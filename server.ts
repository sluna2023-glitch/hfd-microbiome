import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PubMedArticleServer {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi?: string;
  abstractSnippet?: string;
  url: string;
}

interface BugSigDbSignatureServer {
  bsdbId: string;
  pmid: string;
  doi: string;
  authors: string;
  title: string;
  journal: string;
  year: string;
  hostSpecies: string;
  bodySite: string;
  condition: string;
  group0Name: string;
  group1Name: string;
  group0Size: string;
  group1Size: string;
  abundanceInGroup1: string;
  statisticalTest: string;
  taxa: string[];
  pubmedUrl: string;
  bugsigdbUrl: string;
}

const pubmedCache = new Map<string, { timestamp: number; articles: PubMedArticleServer[] }>();
const CACHE_TTL_MS = 1000 * 60 * 20;

let bugsigCache: { timestamp: number; signatures: BugSigDbSignatureServer[] } | null = null;
const BUGSIG_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function simplifyMetaPhlAnTaxon(raw: string): string {
  const parts = raw
    .split('|')
    .map((p) => p.replace(/^[kpcofgst]__/, '').trim())
    .filter(Boolean);
  return parts[parts.length - 1] || raw;
}

async function fetchBugSigDbMouseHfdSignatures(): Promise<BugSigDbSignatureServer[]> {
  if (bugsigCache && Date.now() - bugsigCache.timestamp < BUGSIG_CACHE_TTL_MS) {
    return bugsigCache.signatures;
  }

  const url = 'https://raw.githubusercontent.com/waldronlab/BugSigDBExports/devel/full_dump.csv';
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'HFD-Microbiome-Analyzer/1.0' },
  });
  if (!resp.ok) {
    throw new Error(`Error consultando BugSigDB (${resp.status})`);
  }
  const text = await resp.text();
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0 && !l.startsWith('#'));
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const colIdx = new Map<string, number>();
  headers.forEach((h, i) => colIdx.set(h, i));

  const get = (cells: string[], col: string) => cells[colIdx.get(col) ?? -1] || '';

  const signatures: BugSigDbSignatureServer[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < 10) continue;

    const pmid = get(cells, 'PMID');
    if (!pmid || pmid === 'NA') continue;

    const host = get(cells, 'Host species');
    const cond = get(cells, 'Condition');
    const g0 = get(cells, 'Group 0 name');
    const g1 = get(cells, 'Group 1 name');
    const title = decodeXmlEntities(get(cells, 'Title'));
    const haystack = `${host} ${cond} ${g0} ${g1} ${title}`.toLowerCase();

    const isMouse =
      host.toLowerCase().includes('mus musculus') ||
      haystack.includes('mouse') ||
      haystack.includes('mice') ||
      haystack.includes('c57bl');
    const isHfd =
      haystack.includes('high-fat') ||
      haystack.includes('high fat') ||
      haystack.includes('hfd') ||
      haystack.includes('western diet');

    if (!isMouse || !isHfd) continue;

    const rawTaxa = get(cells, 'MetaPhlAn taxon names');
    const taxa = rawTaxa
      ? Array.from(new Set(rawTaxa.split(',').map((t) => simplifyMetaPhlAnTaxon(t)).filter(Boolean)))
      : [];

    const bsdbId = get(cells, 'BSDB ID');
    const studyCol = get(cells, 'Study');
    const studySlug = studyCol
      ? studyCol.replace(/\s+/g, '_')
      : `Study_${bsdbId.replace(/^bsdb:/, '').split('/')[0]}`;
    signatures.push({
      bsdbId,
      pmid,
      doi: get(cells, 'DOI'),
      authors: get(cells, 'Authors list').split(';').slice(0, 3).join(', ') + (get(cells, 'Authors list').includes(';') ? ' et al.' : ''),
      title,
      journal: get(cells, 'Journal'),
      year: get(cells, 'Year'),
      hostSpecies: host,
      bodySite: get(cells, 'Body site'),
      condition: cond,
      group0Name: g0,
      group1Name: g1,
      group0Size: get(cells, 'Group 0 sample size'),
      group1Size: get(cells, 'Group 1 sample size'),
      abundanceInGroup1: get(cells, 'Abundance in Group 1'),
      statisticalTest: get(cells, 'Statistical test'),
      taxa,
      pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      bugsigdbUrl: `https://bugsigdb.org/${encodeURIComponent(studySlug)}`,
    });
  }

  bugsigCache = { timestamp: Date.now(), signatures };
  return signatures;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePubMedXml(xml: string): PubMedArticleServer[] {
  const articles: PubMedArticleServer[] = [];
  const articleBlocks = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];

  for (const block of articleBlocks) {
    const pmidMatch = block.match(/<MedlineCitation[^>]*>[\s\S]*?<PMID[^>]*>(\d+)<\/PMID>/);
    const pmid = pmidMatch ? pmidMatch[1].trim() : '';
    if (!pmid) continue;

    const titleMatch = block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/);
    const title = titleMatch ? decodeXmlEntities(titleMatch[1]) : 'Título no disponible';

    const journalMatch =
      block.match(/<ISOAbbreviation>([\s\S]*?)<\/ISOAbbreviation>/) ||
      block.match(/<Title>([\s\S]*?)<\/Title>/);
    const journal = journalMatch ? decodeXmlEntities(journalMatch[1]) : 'Revista científica';

    const yearMatch =
      block.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/) ||
      block.match(/<PubDate>[\s\S]*?<MedlineDate>(\d{4})/);
    const year = yearMatch ? yearMatch[1] : 's.f.';

    const authorMatches = Array.from(block.matchAll(/<Author[^>]*>([\s\S]*?)<\/Author>/g));
    const authorNames = authorMatches
      .slice(0, 3)
      .map((m) => {
        const last = m[1].match(/<LastName>([\s\S]*?)<\/LastName>/)?.[1] || '';
        const initials = m[1].match(/<Initials>([\s\S]*?)<\/Initials>/)?.[1] || '';
        const collective = m[1].match(/<CollectiveName>([\s\S]*?)<\/CollectiveName>/)?.[1] || '';
        return last ? `${decodeXmlEntities(last)} ${decodeXmlEntities(initials)}`.trim() : decodeXmlEntities(collective);
      })
      .filter(Boolean);
    const authors =
      authorNames.length > 0
        ? authorMatches.length > 3
          ? `${authorNames.join(', ')} et al.`
          : authorNames.join(', ')
        : 'Autores no especificados';

    const doiMatch = block.match(/<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/);
    const doi = doiMatch ? decodeXmlEntities(doiMatch[1]) : undefined;

    const abstractParts = Array.from(block.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)).map((m) =>
      decodeXmlEntities(m[1])
    );
    const fullAbstract = abstractParts.join(' ');
    const abstractSnippet =
      fullAbstract.length > 520 ? `${fullAbstract.slice(0, 517)}...` : fullAbstract || undefined;

    articles.push({
      pmid,
      title,
      authors,
      journal,
      year,
      doi,
      abstractSnippet,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    });
  }

  return articles;
}

async function fetchPubMedArticles(query: string, maxResults = 5): Promise<PubMedArticleServer[]> {
  const normalizedKey = `${query.trim().toLowerCase()}::${maxResults}`;
  const cached = pubmedCache.get(normalizedKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.articles;
  }

  const esearchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
  esearchUrl.searchParams.set('db', 'pubmed');
  esearchUrl.searchParams.set('term', query);
  esearchUrl.searchParams.set('retmax', String(maxResults));
  esearchUrl.searchParams.set('sort', 'relevance');
  esearchUrl.searchParams.set('retmode', 'json');

  const searchResp = await fetch(esearchUrl.toString(), {
    headers: { 'User-Agent': 'HFD-Microbiome-Analyzer/1.0' },
  });
  if (!searchResp.ok) {
    throw new Error(`Error consultando PubMed esearch (${searchResp.status})`);
  }
  const searchJson = (await searchResp.json()) as {
    esearchresult?: { idlist?: string[] };
  };
  const pmids = searchJson.esearchresult?.idlist || [];
  if (pmids.length === 0) {
    pubmedCache.set(normalizedKey, { timestamp: Date.now(), articles: [] });
    return [];
  }

  const efetchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
  efetchUrl.searchParams.set('db', 'pubmed');
  efetchUrl.searchParams.set('id', pmids.join(','));
  efetchUrl.searchParams.set('retmode', 'xml');

  const fetchResp = await fetch(efetchUrl.toString(), {
    headers: { 'User-Agent': 'HFD-Microbiome-Analyzer/1.0' },
  });
  if (!fetchResp.ok) {
    throw new Error(`Error consultando PubMed efetch (${fetchResp.status})`);
  }
  const xml = await fetchResp.text();
  const articles = parsePubMedXml(xml);
  pubmedCache.set(normalizedKey, { timestamp: Date.now(), articles });
  return articles;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, geminiConfigured: Boolean(getGeminiClient()) });
  });

  app.get('/api/pubmed/search', async (req, res) => {
    try {
      const q = String(req.query.q || '').trim();
      const maxResults = Math.min(10, Math.max(1, Number(req.query.maxResults || 6)));
      if (!q) {
        return res.status(400).json({ error: 'Debe proporcionar un término de búsqueda en PubMed.' });
      }
      const articles = await fetchPubMedArticles(q, maxResults);
      return res.json({ query: q, articles });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error consultando NCBI PubMed.';
      return res.status(502).json({ error: message, articles: [] });
    }
  });

  app.get('/api/databases/bugsigdb', async (req, res) => {
    try {
      const q = String(req.query.q || '').trim().toLowerCase();
      const all = await fetchBugSigDbMouseHfdSignatures();
      const filtered = q
        ? all.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.pmid.includes(q) ||
              s.condition.toLowerCase().includes(q) ||
              s.group0Name.toLowerCase().includes(q) ||
              s.group1Name.toLowerCase().includes(q) ||
              s.taxa.some((t) => t.toLowerCase().includes(q))
          )
        : all;
      const uniqueStudies = new Set(all.map((s) => s.pmid)).size;
      return res.json({
        totalMouseHfdSignatures: all.length,
        uniqueMouseHfdStudies: uniqueStudies,
        signatures: filtered.slice(0, 30),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error consultando BugSigDB.';
      return res.status(502).json({ error: message, signatures: [], totalMouseHfdSignatures: 0, uniqueMouseHfdStudies: 0 });
    }
  });

  app.post('/api/ai/interpret', async (req, res) => {
    try {
      const body = req.body as {
        mode: 'taxon' | 'cohort';
        taxon?: {
          displayName: string;
          phylum: string;
          family: string;
          genus: string;
          species: string;
          controlMean: number;
          hfdMean: number;
          log2FoldChange: number;
          pValue: number;
          fdrQValue: number;
          category: string;
        };
        cohort?: {
          name: string;
          isSampleData: boolean;
          paperSource?: {
            pmid: string;
            doi: string;
            authors: string;
            journal: string;
            year: string;
            dietProtocol: string;
          };
          totalTaxa: number;
          controlShannon: number;
          hfdShannon: number;
          controlFBRatio: number | null;
          hfdFBRatio: number | null;
          topIncreases: Array<{ name: string; controlMean: number; hfdMean: number; pValue: number }>;
          topDecreases: Array<{ name: string; controlMean: number; hfdMean: number; pValue: number }>;
          exclusiveHfd: string[];
          undetectedHfd: string[];
        };
      };

      // 1. Fetch real PubMed references first so AI is grounded on verified articles
      let pubmedQuery = '';
      if (body.mode === 'taxon' && body.taxon) {
        const cleanTerm =
          body.taxon.species && !body.taxon.species.toLowerCase().includes('no identificada')
            ? body.taxon.species
            : body.taxon.genus && !body.taxon.genus.toLowerCase().includes('no identificado')
              ? body.taxon.genus
              : body.taxon.family;
        pubmedQuery = `"${cleanTerm}"[Title/Abstract] AND ("high-fat diet"[Title/Abstract] OR "high fat diet"[Title/Abstract] OR obesity[Title/Abstract] OR inflammation[Title/Abstract] OR "short-chain fatty acids"[Title/Abstract])`;
      } else {
        pubmedQuery =
          '("high-fat diet"[Title/Abstract] AND "gut microbiota"[Title/Abstract] AND mice[Title/Abstract]) AND (inflammation[Title/Abstract] OR "short-chain fatty acids"[Title/Abstract] OR obesity[Title/Abstract])';
      }

      let articles: PubMedArticleServer[] = [];
      let pubmedWarning = '';
      try {
        articles = await fetchPubMedArticles(pubmedQuery, 5);
        // Fallback broader search if highly specific species+HFD returned 0 results
        if (articles.length === 0 && body.mode === 'taxon' && body.taxon) {
          const fallbackTerm =
            body.taxon.genus && !body.taxon.genus.toLowerCase().includes('no identificado')
              ? body.taxon.genus
              : body.taxon.family;
          if (fallbackTerm && !fallbackTerm.toLowerCase().includes('no identificad')) {
            articles = await fetchPubMedArticles(
              `"${fallbackTerm}"[Title/Abstract] AND (microbiota[Title/Abstract] OR gut[Title/Abstract])`,
              4
            );
          }
        }
      } catch (pubErr) {
        pubmedWarning =
          pubErr instanceof Error ? pubErr.message : 'No fue posible conectar con NCBI PubMed en este momento.';
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            'El servicio de interpretación con IA no tiene configurada la variable GEMINI_API_KEY en el servidor. Se muestran las referencias reales recuperadas de PubMed.',
          articles,
          pubmedWarning,
        });
      }

      const pubmedContext =
        articles.length > 0
          ? articles
              .map(
                (a) =>
                  `- PMID: ${a.pmid} | ${a.title} (${a.authors}, ${a.journal}, ${a.year})\n  Resumen: ${a.abstractSnippet || 'Sin resumen disponible en efetch'}`
              )
              .join('\n')
          : 'No se recuperaron artículos en PubMed para esta consulta específica.';

      const dataContext =
        body.mode === 'taxon' && body.taxon
          ? `Análisis de taxón individual:
- Nombre mostrado: ${body.taxon.displayName}
- Taxonomía: Filo=${body.taxon.phylum}, Familia=${body.taxon.family}, Género=${body.taxon.genus}, Especie=${body.taxon.species}
- Media en grupo Control: ${body.taxon.controlMean.toFixed(3)}%
- Media en grupo HFD: ${body.taxon.hfdMean.toFixed(3)}%
- log2 Fold Change (HFD/Control): ${body.taxon.log2FoldChange.toFixed(3)}
- p-valor (Welch): ${body.taxon.pValue.toExponential(3)} | FDR q-valor: ${body.taxon.fdrQValue.toExponential(3)}
- Clasificación observada en los datos: ${body.taxon.category}`
          : `Análisis global de cohorte (${body.cohort?.name || 'Estudio'}):
- Origen de los datos: ${
              body.cohort?.paperSource
                ? `Estudio científico publicado: ${body.cohort.paperSource.authors} (${body.cohort.paperSource.journal}, ${body.cohort.paperSource.year}), PMID ${body.cohort.paperSource.pmid}, DOI ${body.cohort.paperSource.doi}. Protocolo: ${body.cohort.paperSource.dietProtocol}`
                : 'Conjunto experimental cargado por el usuario'
            }
- Total de taxones evaluados: ${body.cohort?.totalTaxa ?? 0}
- Diversidad alfa Shannon: Control=${body.cohort?.controlShannon.toFixed(3) ?? '0'} vs. HFD=${body.cohort?.hfdShannon.toFixed(3) ?? '0'}
- Ratio Firmicutes/Bacteroidetes: Control=${body.cohort?.controlFBRatio?.toFixed(2) ?? 'N/D'} vs. HFD=${body.cohort?.hfdFBRatio?.toFixed(2) ?? 'N/D'}
- Taxones que aumentan en HFD: ${JSON.stringify(body.cohort?.topIncreases || [])}
- Taxones que disminuyen en HFD: ${JSON.stringify(body.cohort?.topDecreases || [])}
- Exclusivos en HFD: ${JSON.stringify(body.cohort?.exclusiveHfd || [])}
- No detectados en HFD: ${JSON.stringify(body.cohort?.undetectedHfd || [])}`;

      const systemInstruction = `Eres un investigador senior en microbiota intestinal murina, inmunometabolismo y bioinformática.
Responde SIEMPRE en español académico claro, preciso y riguroso.
REGLAS ESTRICTAS DE INTEGRIDAD CIENTÍFICA:
1. NUNCA inventes bacterias, porcentajes, p-valores, ni PMIDs o artículos científicos.
2. En "hallazgosComprobados" SOLO describe hechos numéricos y comparaciones observadas directamente en los datos proporcionados arriba.
3. En "citasUtilizadas" SOLO puedes incluir PMIDs que aparezcan textualmente en la lista "Artículos reales de PubMed" proporcionada en el prompt. Si la lista está vacía, devuelve un arreglo vacío [].
4. Diferencia explícitamente entre evidencia observada en los datos, mecanismos biológicos documentados en literatura y "hipotesisYExplicaciones" (que deben formularse como hipótesis o posibles explicaciones a validar experimentalmente).
5. Analiza funciones metabólicas (ácidos grasos de cadena corta como butirato/propionato/acetato, ácidos biliares, metabolismo lipídico, mucina) y relación con obesidad, barrera intestinal (LPS/endotoxemia) e inflamación/respuesta inmunológica.`;

      const prompt = `${dataContext}

Artículos reales recuperados de NCBI PubMed:
${pubmedContext}

Genera una interpretación científica estructurada en JSON siguiendo el esquema requerido.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resumenEjecutivo: {
                type: Type.STRING,
                description: 'Resumen claro de 2-3 oraciones distinguiendo datos observados e implicación biológica.',
              },
              hallazgosComprobados: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de hechos cuantitativos comprobados directamente en los datos del estudio.',
              },
              funcionesMetabolicas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Funciones metabólicas en el intestino (AGCC, nutrientes, ácidos biliares, mucina).',
              },
              relacionInflamacionObesidad: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Vínculos documentados con obesidad, inflamación intestinal, barrera epitelial e inmunología.',
              },
              hipotesisYExplicaciones: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Posibles explicaciones mecanísticas e hipótesis que requieren validación experimental.',
              },
              citasUtilizadas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    pmid: { type: Type.STRING },
                    relevancia: { type: Type.STRING },
                  },
                },
                description: 'Solo PMIDs presentes exactamente en el contexto de PubMed proporcionado.',
              },
              advertenciaMetodologica: {
                type: Type.STRING,
                description: 'Nota sobre limitaciones metodológicas (p. ej. asociación 16S frente a causalidad o tamaño muestral).',
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as {
        resumenEjecutivo?: string;
        hallazgosComprobados?: string[];
        funcionesMetabolicas?: string[];
        relacionInflamacionObesidad?: string[];
        hipotesisYExplicaciones?: string[];
        citasUtilizadas?: Array<{ pmid: string; relevancia: string }>;
        advertenciaMetodologica?: string;
      };

      // Strictly filter citations so only verified fetched PMIDs can ever be returned
      const validPmidSet = new Set(articles.map((a) => a.pmid));
      const verifiedCitations = (parsed.citasUtilizadas || []).filter((c) => validPmidSet.has(String(c.pmid).trim()));

      return res.json({
        interpretation: {
          resumenEjecutivo: parsed.resumenEjecutivo || '',
          hallazgosComprobados: parsed.hallazgosComprobados || [],
          funcionesMetabolicas: parsed.funcionesMetabolicas || [],
          relacionInflamacionObesidad: parsed.relacionInflamacionObesidad || [],
          hipotesisYExplicaciones: parsed.hipotesisYExplicaciones || [],
          citasUtilizadas: verifiedCitations,
          advertenciaMetodologica:
            parsed.advertenciaMetodologica ||
            'Los perfiles de abundancia relativa muestran asociaciones estadísticas y no demuestran causalidad por sí solos.',
        },
        articles,
        pubmedWarning,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error generando interpretación científica.';
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`HFD Microbiome Analyzer server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
