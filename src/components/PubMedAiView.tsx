import React, { useState } from 'react';
import { BookOpen, Database, ExternalLink, Loader2, Search } from 'lucide-react';
import type {
  BugSigDbSignature,
  PubMedArticle,
} from '../types/microbiome';

interface PubMedAiViewProps {
  articles: PubMedArticle[];
  onUpdateArticles: (articles: PubMedArticle[]) => void;
}

const PRESET_QUERIES = [
  {
    label: 'Microbiota HFD e inflamación murina',
    query: '"high-fat diet"[Title/Abstract] AND "gut microbiota"[Title/Abstract] AND mice[Title/Abstract] AND inflammation[Title/Abstract]',
  },
  {
    label: 'Akkermansia muciniphila y obesidad',
    query: '"Akkermansia muciniphila"[Title/Abstract] AND ("high-fat diet"[Title/Abstract] OR obesity[Title/Abstract])',
  },
  {
    label: 'Ácidos grasos de cadena corta (AGCC)',
    query: '"short-chain fatty acids"[Title/Abstract] AND "high-fat diet"[Title/Abstract] AND microbiota[Title/Abstract]',
  },
  {
    label: 'Bilophila wadsworthia y ácidos biliares',
    query: '"Bilophila"[Title/Abstract] AND ("high-fat"[Title/Abstract] OR "bile acids"[Title/Abstract])',
  },
];

const BUGSIG_PRESETS = ['Todos', 'Akkermansia', 'Alistipes', 'Lactobacillus', 'Bilophila', 'Bacteroides', 'Lachnospiraceae'];

export const PubMedAiView: React.FC<PubMedAiViewProps> = ({
  articles,
  onUpdateArticles,
}) => {
  const [queryInput, setQueryInput] = useState(PRESET_QUERIES[0].query);
  const [searching, setSearching] = useState(false);
  const [pubmedError, setPubmedError] = useState<string | null>(null);

  // BugSigDB curated paper database state
  const [bugsigQuery, setBugsigQuery] = useState('');
  const [bugsigLoading, setBugsigLoading] = useState(false);
  const [bugsigError, setBugsigError] = useState<string | null>(null);
  const [bugsigSignatures, setBugsigSignatures] = useState<BugSigDbSignature[]>([]);
  const [bugsigStats, setBugsigStats] = useState<{ total: number; studies: number } | null>(null);

  const runBugSigDbSearch = async (term: string) => {
    const clean = term.trim();
    setBugsigLoading(true);
    setBugsigError(null);
    try {
      const resp = await fetch(`/api/databases/bugsigdb?q=${encodeURIComponent(clean)}`);
      const data = (await resp.json()) as {
        signatures?: BugSigDbSignature[];
        totalMouseHfdSignatures?: number;
        uniqueMouseHfdStudies?: number;
        error?: string;
      };
      if (!resp.ok) {
        throw new Error(data.error || 'No se pudo consultar la base de datos BugSigDB.');
      }
      setBugsigSignatures(data.signatures || []);
      setBugsigStats({
        total: data.totalMouseHfdSignatures || 0,
        studies: data.uniqueMouseHfdStudies || 0,
      });
    } catch (err) {
      setBugsigError(err instanceof Error ? err.message : 'Error consultando BugSigDB.');
    } finally {
      setBugsigLoading(false);
    }
  };

  const runPubMedSearch = async (term: string) => {
    const q = term.trim();
    if (!q) return;
    setSearching(true);
    setPubmedError(null);
    try {
      const resp = await fetch(`/api/pubmed/search?q=${encodeURIComponent(q)}&maxResults=6`);
      const data = (await resp.json()) as { articles?: PubMedArticle[]; error?: string };
      if (!resp.ok) {
        throw new Error(data.error || 'No se pudo completar la búsqueda en PubMed.');
      }
      onUpdateArticles(data.articles || []);
    } catch (err) {
      setPubmedError(err instanceof Error ? err.message : 'Error consultando NCBI PubMed.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* BugSigDB Paper Database Explorer */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">
              Base de Datos Curada de Artículos Científicos (BugSigDB · Ratón + HFD)
            </h3>
            <p className="text-xs text-slate-500">
              Consulta directa del repositorio público BugSigDB con firmas microbianas extraídas de estudios experimentales publicados en ratones alimentados con dieta alta en grasas.
            </p>
          </div>
          {bugsigStats && (
            <div className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 tabular-nums whitespace-nowrap shrink-0">
              {bugsigStats.total} firmas en {bugsigStats.studies} estudios curados
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runBugSigDbSearch(bugsigQuery);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={bugsigQuery}
              onChange={(e) => setBugsigQuery(e.target.value)}
              placeholder="Filtrar firmas por taxón, condición o PMID (ej. Alistipes, 40783398)..."
              aria-label="Filtrar firmas curadas de BugSigDB"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            />
          </div>
          <button
            type="submit"
            disabled={bugsigLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {bugsigLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Database className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{bugsigLoading ? 'Consultando BugSigDB...' : 'Cargar firmas de BugSigDB'}</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Filtros por género/familia:</span>
          {BUGSIG_PRESETS.map((preset) => {
            const term = preset === 'Todos' ? '' : preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setBugsigQuery(term);
                  runBugSigDbSearch(term);
                }}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                {preset}
              </button>
            );
          })}
        </div>

        {bugsigError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {bugsigError}
          </div>
        )}

        {bugsigSignatures.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {bugsigSignatures.map((sig, idx) => {
              const directionLower = sig.abundanceInGroup1.toLowerCase();
              const isIncreased = directionLower.includes('increas');
              const isDecreased = directionLower.includes('decreas');
              return (
                <article
                  key={`${sig.bsdbId}-${idx}`}
                  data-testid="bugsigdb-signature-card"
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <a
                          href={sig.pubmedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-teal-800 hover:underline"
                        >
                          PMID: {sig.pmid}
                        </a>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">{sig.journal} ({sig.year})</span>
                      </div>
                      <a
                        href={sig.bugsigdbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-teal-800"
                      >
                        <span>{sig.bsdbId}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">{sig.title}</h4>
                    <div className="text-xs text-slate-500">{sig.authors}</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs bg-white border border-slate-200 rounded-lg p-2.5">
                      <div>
                        <span className="text-slate-500">Grupo 0 (ref.): </span>
                        <span className="font-medium text-slate-800">
                          {sig.group0Name || 'Control'} {sig.group0Size && sig.group0Size !== 'NA' ? `(n=${sig.group0Size})` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Grupo 1 (exp.): </span>
                        <span className="font-medium text-slate-800">
                          {sig.group1Name || 'HFD'} {sig.group1Size && sig.group1Size !== 'NA' ? `(n=${sig.group1Size})` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Dirección en Grupo 1: </span>
                        <span
                          className={`font-semibold ${
                            isIncreased
                              ? 'text-amber-700'
                              : isDecreased
                                ? 'text-teal-700'
                                : 'text-slate-800'
                          }`}
                        >
                          {isIncreased
                            ? 'Aumentada (increased)'
                            : isDecreased
                              ? 'Disminuida (decreased)'
                              : sig.abundanceInGroup1 || 'N/D'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Método / sitio: </span>
                        <span className="text-slate-700">
                          {sig.statisticalTest && sig.statisticalTest !== 'NA' ? sig.statisticalTest : 'N/D'}
                          {sig.bodySite && sig.bodySite !== 'NA' ? ` · ${sig.bodySite}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {sig.taxa.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/70">
                      {sig.taxa.slice(0, 12).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            const query = `"${t}"[Title/Abstract] AND ("high-fat diet"[Title/Abstract] OR obesity[Title/Abstract])`;
                            setQueryInput(query);
                            runPubMedSearch(query);
                          }}
                          title={`Buscar ${t} en PubMed`}
                          className="px-2 py-0.5 text-[11px] font-mono text-slate-700 bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-800 rounded-md transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                      {sig.taxa.length > 12 && (
                        <span className="text-[11px] text-slate-500 self-center">
                          +{sig.taxa.length - 12} más
                        </span>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
            {bugsigStats
              ? 'No se encontraron firmas curadas en BugSigDB para ese filtro. Pruebe «Todos» o un género diferente.'
              : 'Presione «Cargar firmas de BugSigDB» para consultar firmas microbianas curadas manualmente de estudios publicados en ratones con HFD.'}
          </div>
        )}
      </section>

      {/* Live PubMed Literature Explorer */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">
            Buscador Directo de Bibliografía Científica (NCBI PubMed)
          </h3>
          <p className="text-xs text-slate-500">
            Todas las referencias se consultan en tiempo real desde la base de datos oficial PubMed / MEDLINE. No se generan citas ficticias.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runPubMedSearch(queryInput);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ej: Akkermansia muciniphila AND high-fat diet"
              aria-label="Consulta de búsqueda en PubMed"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <BookOpen className="w-4 h-4" aria-hidden="true" />
            )}
            <span>Buscar en PubMed</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Consultas sugeridas:</span>
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setQueryInput(preset.query);
                runPubMedSearch(preset.query);
              }}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {pubmedError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {pubmedError}
          </div>
        )}

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {articles.map((art) => (
              <article
                key={art.pmid}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-teal-800 hover:underline leading-snug"
                    >
                      {art.title}
                    </a>
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ver artículo PMID ${art.pmid} en PubMed`}
                      className="text-slate-500 hover:text-teal-700 shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    PMID: {art.pmid} · {art.authors} · {art.journal} ({art.year})
                  </div>
                  {art.abstractSnippet && (
                    <p className="text-xs text-slate-600 leading-relaxed">{art.abstractSnippet}</p>
                  )}
                </div>
                {art.doi && (
                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-200/70">
                    DOI: {art.doi}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
            Ejecute una consulta o seleccione una bacteria en la tabla para recuperar artículos verificados de PubMed.
          </div>
        )}
      </section>
    </div>
  );
};
