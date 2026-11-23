import type {
  AnalyzedTaxon,
  CohortSummaryMetrics,
  FunctionalAnnotation,
  MicrobiomeDataset,
  PaperSourceMetadata,
  ParsedTablePreview,
  RawTaxonEntry,
  ShiftCategory,
  TaxonomyInfo,
} from '../types/microbiome';
import { getFunctionalAnnotation } from '../data/bacteriaKnowledgeBase';

const PSEUDOCOUNT = 0.001;
const DETECTION_THRESHOLD = 0.0001;

function cleanRankToken(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/^[kpcofgs]__+/i, '')
    .replace(/^d__+/i, '')
    .replace(/_/g, ' ')
    .trim();
}

function isUnclassifiedToken(token: string): boolean {
  const lower = token.toLowerCase();
  return (
    !token ||
    lower === 'unclassified' ||
    lower === 'uncultured' ||
    lower === 'na' ||
    lower === 'n/a' ||
    lower === 'none' ||
    lower === 'no identificada' ||
    lower === 'sin clasificar' ||
    lower === '-' ||
    lower.startsWith('uncultured ')
  );
}

export function parseTaxonomyString(
  rawInput: string,
  explicitCols?: {
    phylum?: string;
    taxClass?: string;
    order?: string;
    family?: string;
    genus?: string;
    species?: string;
  }
): TaxonomyInfo {
  const rawName = (rawInput || '').trim();
  let phylum = cleanRankToken(explicitCols?.phylum);
  let taxClass = cleanRankToken(explicitCols?.taxClass);
  let order = cleanRankToken(explicitCols?.order);
  let family = cleanRankToken(explicitCols?.family);
  let genus = cleanRankToken(explicitCols?.genus);
  let species = cleanRankToken(explicitCols?.species);

  if (rawName.includes(';') || rawName.includes('|') || /[kpcofgs]__/i.test(rawName)) {
    const parts = rawName.split(/[;|]/).map((p) => p.trim());
    for (const part of parts) {
      if (/^p__/i.test(part) && !phylum) phylum = cleanRankToken(part);
      else if (/^c__/i.test(part) && !taxClass) taxClass = cleanRankToken(part);
      else if (/^o__/i.test(part) && !order) order = cleanRankToken(part);
      else if (/^f__/i.test(part) && !family) family = cleanRankToken(part);
      else if (/^g__/i.test(part) && !genus) genus = cleanRankToken(part);
      else if (/^s__/i.test(part) && !species) species = cleanRankToken(part);
    }
    if (!taxClass && !order && !family && !genus && !species && parts.length >= 2) {
      const cleaned = parts.map(cleanRankToken).filter((t) => !isUnclassifiedToken(t));
      if (cleaned.length >= 7) {
        phylum = phylum || cleaned[1] || '';
        taxClass = taxClass || cleaned[2] || '';
        order = order || cleaned[3] || '';
        family = family || cleaned[cleaned.length - 3] || '';
        genus = genus || cleaned[cleaned.length - 2] || '';
        species = species || cleaned[cleaned.length - 1] || '';
      } else if (cleaned.length === 6) {
        phylum = phylum || cleaned[0] || '';
        taxClass = taxClass || cleaned[1] || '';
        order = order || cleaned[2] || '';
        family = family || cleaned[3] || '';
        genus = genus || cleaned[4] || '';
        species = species || cleaned[5] || '';
      } else if (cleaned.length === 5) {
        phylum = phylum || cleaned[0] || '';
        taxClass = taxClass || cleaned[1] || '';
        order = order || cleaned[2] || '';
        family = family || cleaned[3] || '';
        genus = genus || cleaned[4] || '';
      } else if (cleaned.length === 4) {
        phylum = phylum || cleaned[0] || '';
        family = family || cleaned[1] || '';
        genus = genus || cleaned[2] || '';
        species = species || cleaned[3] || '';
      } else if (cleaned.length === 3) {
        family = family || cleaned[0];
        genus = genus || cleaned[1];
        species = species || cleaned[2];
      } else if (cleaned.length === 2) {
        genus = genus || cleaned[0];
        species = species || cleaned[1];
      }
    }
  } else if (rawName && !species && !genus) {
    const words = rawName.replace(/_/g, ' ').split(/\s+/).filter(Boolean);
    if (words.length >= 2 && /^[A-Z]/.test(words[0]) && /^[a-z]/.test(words[1]) && words[1] !== 'sp.' && words[1] !== 'spp.') {
      genus = words[0];
      species = `${words[0]} ${words[1]}`;
    } else if (/aceae$/i.test(rawName)) {
      family = rawName;
    } else {
      genus = rawName.replace(/\s+sp\.?$/i, '');
    }
  }

  if (isUnclassifiedToken(phylum)) phylum = '';
  if (isUnclassifiedToken(taxClass)) taxClass = '';
  if (isUnclassifiedToken(order)) order = '';
  if (isUnclassifiedToken(family)) family = '';
  if (isUnclassifiedToken(genus)) genus = '';
  if (isUnclassifiedToken(species) || /\bsp\.?$/i.test(species)) species = '';

  if (species && genus && !species.toLowerCase().startsWith(genus.toLowerCase()) && !species.includes(' ')) {
    species = `${genus} ${species}`;
  }

  let resolutionLevel: TaxonomyInfo['resolutionLevel'] = 'filo';
  let displayName = rawName || 'Taxón no clasificado';

  if (species) {
    resolutionLevel = 'especie';
    displayName = species;
  } else if (genus) {
    resolutionLevel = 'genero';
    displayName = `${genus} spp.`;
  } else if (family) {
    resolutionLevel = 'familia';
    displayName = `Familia ${family}`;
  } else if (order) {
    resolutionLevel = 'orden';
    displayName = `Orden ${order}`;
  } else if (taxClass) {
    resolutionLevel = 'clase';
    displayName = `Clase ${taxClass}`;
  } else if (phylum) {
    resolutionLevel = 'filo';
    displayName = `Filo ${phylum}`;
  }

  return {
    rawName: rawName || displayName,
    phylum: phylum || 'No especificado',
    taxClass: taxClass || 'No especificada',
    order: order || 'No especificado',
    family: family || 'No identificada',
    genus: genus || 'No identificado',
    species: species || 'No identificada a nivel de especie',
    displayName,
    resolutionLevel,
  };
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// Log-gamma via Lanczos approximation for Welch's t-test p-value calculation
function logGamma(z: number): number {
  const g = 7;
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 100;
  const EPS = 3e-7;
  const FPMIN = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function regularizedIncompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a;
  }
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

export function welchTTestPValue(groupA: number[], groupB: number[]): number {
  const n1 = groupA.length;
  const n2 = groupB.length;
  if (n1 < 2 || n2 < 2) return 1;

  const m1 = mean(groupA);
  const m2 = mean(groupB);
  const sd1 = standardDeviation(groupA);
  const sd2 = standardDeviation(groupB);
  const v1 = (sd1 * sd1) / n1;
  const v2 = (sd2 * sd2) / n2;
  const seSq = v1 + v2;

  if (seSq === 0) {
    return m1 === m2 ? 1 : 0.0001;
  }

  const t = Math.abs(m1 - m2) / Math.sqrt(seSq);
  const df =
    (seSq * seSq) /
    ((v1 * v1) / (n1 - 1) + (v2 * v2) / (n2 - 1));

  const x = df / (df + t * t);
  const p = regularizedIncompleteBeta(df / 2, 0.5, x);
  return Math.min(1, Math.max(0, Number.isFinite(p) ? p : 1));
}

export function benjaminiHochbergFDR(pValues: number[]): number[] {
  const n = pValues.length;
  if (n === 0) return [];
  const indexed = pValues.map((p, idx) => ({ p, idx })).sort((a, b) => a.p - b.p);
  const qValues = new Array<number>(n);
  let prevMin = 1;
  for (let i = n - 1; i >= 0; i--) {
    const rank = i + 1;
    const rawQ = (indexed[i].p * n) / rank;
    prevMin = Math.min(prevMin, rawQ);
    qValues[indexed[i].idx] = Math.min(1, prevMin);
  }
  return qValues;
}

export function classifyShift(
  controlMean: number,
  hfdMean: number,
  pValue: number,
  log2FC: number
): ShiftCategory {
  const controlDetected = controlMean > DETECTION_THRESHOLD;
  const hfdDetected = hfdMean > DETECTION_THRESHOLD;

  if (!controlDetected && hfdDetected) {
    return 'exclusiva_hfd';
  }
  if (controlDetected && !hfdDetected) {
    return 'no_detectada_hfd';
  }
  if (!controlDetected && !hfdDetected) {
    return 'estable';
  }

  const absLog2 = Math.abs(log2FC);
  if (hfdMean > controlMean && (pValue < 0.05 || absLog2 >= 0.585)) {
    return 'aumenta_hfd';
  }
  if (hfdMean < controlMean && (pValue < 0.05 || absLog2 >= 0.585)) {
    return 'disminuye_hfd';
  }
  return 'estable';
}

export function computeShannonIndex(abundances: number[]): number {
  const positive = abundances.filter((v) => v > 0);
  const total = positive.reduce((acc, v) => acc + v, 0);
  if (total <= 0) return 0;
  let shannon = 0;
  for (const val of positive) {
    const p = val / total;
    if (p > 0) {
      shannon -= p * Math.log(p);
    }
  }
  return shannon;
}

export function normalizeCohortAbundances(entries: RawTaxonEntry[]): RawTaxonEntry[] {
  if (entries.length === 0) return entries;
  const sampleCountControl = entries[0].controlValues.length;
  const sampleCountHfd = entries[0].hfdValues.length;

  const controlSums = new Array<number>(sampleCountControl).fill(0);
  const hfdSums = new Array<number>(sampleCountHfd).fill(0);

  for (const entry of entries) {
    entry.controlValues.forEach((v, i) => {
      controlSums[i] += Math.max(0, v);
    });
    entry.hfdValues.forEach((v, i) => {
      hfdSums[i] += Math.max(0, v);
    });
  }

  // If sums look like raw read counts (> 120) or fractions (~1.0), normalize to 0-100%
  const allSums = [...controlSums, ...hfdSums].filter((s) => s > 0);
  if (allSums.length === 0) return entries;
  const avgSum = mean(allSums);
  const needsScaling = avgSum > 120 || avgSum <= 1.5;

  if (!needsScaling) return entries;

  return entries.map((entry) => ({
    ...entry,
    controlValues: entry.controlValues.map((v, idx) =>
      controlSums[idx] > 0 ? (Math.max(0, v) / controlSums[idx]) * 100 : 0
    ),
    hfdValues: entry.hfdValues.map((v, idx) =>
      hfdSums[idx] > 0 ? (Math.max(0, v) / hfdSums[idx]) * 100 : 0
    ),
  }));
}

export function analyzeMicrobiomeDataset(params: {
  id: string;
  name: string;
  description: string;
  isSampleData: boolean;
  sourceLabel: string;
  paperSource?: PaperSourceMetadata;
  controlSampleNames: string[];
  hfdSampleNames: string[];
  rawEntries: RawTaxonEntry[];
}): MicrobiomeDataset {
  const normalized = normalizeCohortAbundances(params.rawEntries);

  const rawPValues = normalized.map((entry) =>
    entry.precomputedPValue !== undefined
      ? entry.precomputedPValue
      : welchTTestPValue(entry.controlValues, entry.hfdValues)
  );
  const qValues = benjaminiHochbergFDR(rawPValues);

  const taxa: AnalyzedTaxon[] = normalized.map((entry, idx) => {
    const controlMean = mean(entry.controlValues);
    const hfdMean = mean(entry.hfdValues);
    const controlSD = standardDeviation(entry.controlValues);
    const hfdSD = standardDeviation(entry.hfdValues);
    const controlDetectedCount = entry.controlValues.filter((v) => v > DETECTION_THRESHOLD).length;
    const hfdDetectedCount = entry.hfdValues.filter((v) => v > DETECTION_THRESHOLD).length;

    const foldChange = controlMean > DETECTION_THRESHOLD ? hfdMean / controlMean : null;
    const log2FoldChange = Math.log2((hfdMean + PSEUDOCOUNT) / (controlMean + PSEUDOCOUNT));
    const pValue = rawPValues[idx];
    const fdrQValue = qValues[idx];
    const category = classifyShift(controlMean, hfdMean, pValue, log2FoldChange);
    const isStatisticallySignificant = pValue < 0.05;

    const annotation: FunctionalAnnotation = getFunctionalAnnotation(entry.taxonomy);

    return {
      id: entry.id,
      taxonomy: entry.taxonomy,
      controlValues: entry.controlValues,
      hfdValues: entry.hfdValues,
      controlMean,
      hfdMean,
      controlSD,
      hfdSD,
      controlDetectedCount,
      hfdDetectedCount,
      foldChange,
      log2FoldChange,
      pValue,
      fdrQValue,
      isStatisticallySignificant,
      category,
      annotation,
    };
  });

  // Sort by absolute log2FoldChange descending so most prominent shifts lead
  taxa.sort((a, b) => Math.abs(b.log2FoldChange) - Math.abs(a.log2FoldChange));

  const controlMeans = taxa.map((t) => t.controlMean);
  const hfdMeans = taxa.map((t) => t.hfdMean);

  const isFirmicutes = (phylum: string) => {
    const p = phylum.toLowerCase();
    return p.includes('firmicutes') || p.includes('bacillota');
  };
  const isBacteroidetes = (phylum: string) => {
    const p = phylum.toLowerCase();
    return p.includes('bacteroidetes') || p.includes('bacteroidota');
  };

  const controlFirmicutesPct = taxa
    .filter((t) => isFirmicutes(t.taxonomy.phylum))
    .reduce((acc, t) => acc + t.controlMean, 0);
  const hfdFirmicutesPct = taxa
    .filter((t) => isFirmicutes(t.taxonomy.phylum))
    .reduce((acc, t) => acc + t.hfdMean, 0);

  const controlBacteroidetesPct = taxa
    .filter((t) => isBacteroidetes(t.taxonomy.phylum))
    .reduce((acc, t) => acc + t.controlMean, 0);
  const hfdBacteroidetesPct = taxa
    .filter((t) => isBacteroidetes(t.taxonomy.phylum))
    .reduce((acc, t) => acc + t.hfdMean, 0);

  const summary: CohortSummaryMetrics = {
    totalTaxa: taxa.length,
    controlDetectedTaxa: taxa.filter((t) => t.controlMean > DETECTION_THRESHOLD).length,
    hfdDetectedTaxa: taxa.filter((t) => t.hfdMean > DETECTION_THRESHOLD).length,
    sharedTaxa: taxa.filter(
      (t) => t.controlMean > DETECTION_THRESHOLD && t.hfdMean > DETECTION_THRESHOLD
    ).length,
    exclusivaHfdCount: taxa.filter((t) => t.category === 'exclusiva_hfd').length,
    noDetectadaHfdCount: taxa.filter((t) => t.category === 'no_detectada_hfd').length,
    aumentaHfdCount: taxa.filter((t) => t.category === 'aumenta_hfd').length,
    disminuyeHfdCount: taxa.filter((t) => t.category === 'disminuye_hfd').length,
    estableCount: taxa.filter((t) => t.category === 'estable').length,
    significantCount: taxa.filter((t) => t.isStatisticallySignificant).length,
    controlShannon: computeShannonIndex(controlMeans),
    hfdShannon: computeShannonIndex(hfdMeans),
    controlFirmicutesPct,
    hfdFirmicutesPct,
    controlBacteroidetesPct,
    hfdBacteroidetesPct,
    controlFBRatio:
      controlBacteroidetesPct > 0.01 ? controlFirmicutesPct / controlBacteroidetesPct : null,
    hfdFBRatio:
      hfdBacteroidetesPct > 0.01 ? hfdFirmicutesPct / hfdBacteroidetesPct : null,
  };

  return {
    id: params.id,
    name: params.name,
    description: params.description,
    isSampleData: params.isSampleData,
    sourceLabel: params.sourceLabel,
    paperSource: params.paperSource,
    controlSampleNames: params.controlSampleNames,
    hfdSampleNames: params.hfdSampleNames,
    taxa,
    summary,
  };
}

export function detectColumnsFromTable(
  fileName: string,
  headers: string[],
  rows: Record<string, string | number>[]
): ParsedTablePreview {
  const lowerHeaders = headers.map((h) => ({ raw: h, lower: h.toLowerCase().trim() }));

  const findHeader = (patterns: RegExp[]) =>
    lowerHeaders.find((h) => patterns.some((p) => p.test(h.lower)))?.raw || '';

  const suggestedTaxonomyCol = findHeader([
    /^taxonom/,
    /^taxon$/,
    /^bacteria/,
    /^organism/,
    /^otu/,
    /^asv/,
    /^feature/,
    /^nombre/,
  ]);
  const suggestedPhylumCol = findHeader([/^phylum$/, /^filo$/]);
  const suggestedClassCol = findHeader([/^class$/, /^clase$/]);
  const suggestedOrderCol = findHeader([/^order$/, /^orden$/]);
  const suggestedFamilyCol = findHeader([/^family$/, /^familia$/]);
  const suggestedGenusCol = findHeader([/^genus$/, /^g[eé]nero$/]);
  const suggestedSpeciesCol = findHeader([/^species$/, /^especie$/]);

  const taxonomyColsSet = new Set(
    [
      suggestedTaxonomyCol,
      suggestedPhylumCol,
      suggestedClassCol,
      suggestedOrderCol,
      suggestedFamilyCol,
      suggestedGenusCol,
      suggestedSpeciesCol,
    ].filter(Boolean)
  );

  const suggestedControlCols: string[] = [];
  const suggestedHfdCols: string[] = [];

  for (const h of headers) {
    if (taxonomyColsSet.has(h)) continue;
    const low = h.toLowerCase();
    if (/^(ctrl|control|chow|nd|normal|lean|basal)/i.test(low) || /_ctrl|_control|_nd\b/i.test(low)) {
      suggestedControlCols.push(h);
    } else if (/^(hfd|high.?fat|obese|fat|grasa|alta)/i.test(low) || /_hfd|_fat\b/i.test(low)) {
      suggestedHfdCols.push(h);
    }
  }

  return {
    fileName,
    headers,
    rows,
    suggestedTaxonomyCol: suggestedTaxonomyCol || (suggestedSpeciesCol ? '' : headers[0] || ''),
    suggestedPhylumCol,
    suggestedClassCol,
    suggestedOrderCol,
    suggestedFamilyCol,
    suggestedGenusCol,
    suggestedSpeciesCol,
    suggestedControlCols,
    suggestedHfdCols,
  };
}

export function parseCsvTextToRows(text: string): {
  headers: string[];
  rows: Record<string, string | number>[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }

  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t')
    ? '\t'
    : firstLine.includes(';') && !firstLine.includes(',')
      ? ';'
      : ',';

  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitLine(lines[0]).map((h) => h.replace(/^"|"$/g, ''));
  const rows: Record<string, string | number>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.length === 0) continue;
    const row: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      const raw = (cells[idx] ?? '').replace(/^"|"$/g, '');
      const normalizedNum = raw.replace(',', '.');
      if (raw !== '' && !Number.isNaN(Number(normalizedNum)) && !/[a-zA-Z]/.test(raw)) {
        row[h] = Number(normalizedNum);
      } else {
        row[h] = raw;
      }
    });
    rows.push(row);
  }

  return { headers, rows };
}

export function buildDatasetFromMappedTable(params: {
  datasetName: string;
  fileName: string;
  rows: Record<string, string | number>[];
  taxonomyCol: string;
  phylumCol: string;
  classCol?: string;
  orderCol?: string;
  familyCol: string;
  genusCol: string;
  speciesCol: string;
  controlCols: string[];
  hfdCols: string[];
  pValueCol?: string;
}): MicrobiomeDataset {
  const rawEntries: RawTaxonEntry[] = [];

  params.rows.forEach((row, index) => {
    const rawTax = params.taxonomyCol ? String(row[params.taxonomyCol] ?? '').trim() : '';
    const phylum = params.phylumCol ? String(row[params.phylumCol] ?? '').trim() : '';
    const taxClass = params.classCol ? String(row[params.classCol] ?? '').trim() : '';
    const order = params.orderCol ? String(row[params.orderCol] ?? '').trim() : '';
    const family = params.familyCol ? String(row[params.familyCol] ?? '').trim() : '';
    const genus = params.genusCol ? String(row[params.genusCol] ?? '').trim() : '';
    const species = params.speciesCol ? String(row[params.speciesCol] ?? '').trim() : '';

    if (!rawTax && !phylum && !taxClass && !order && !family && !genus && !species) return;

    const taxonomy = parseTaxonomyString(rawTax || species || genus || family || order || taxClass || phylum, {
      phylum,
      taxClass,
      order,
      family,
      genus,
      species,
    });

    const toNum = (val: unknown) => {
      if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
      const parsed = Number(String(val ?? '').replace(',', '.').trim());
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const controlValues = params.controlCols.map((c) => toNum(row[c]));
    const hfdValues = params.hfdCols.map((c) => toNum(row[c]));

    const precomputedPValue =
      params.pValueCol && row[params.pValueCol] !== undefined && row[params.pValueCol] !== ''
        ? toNum(row[params.pValueCol])
        : undefined;

    rawEntries.push({
      id: `uploaded-${index}-${taxonomy.displayName.toLowerCase().replace(/\s+/g, '-')}`,
      taxonomy,
      controlValues,
      hfdValues,
      precomputedPValue,
    });
  });

  return analyzeMicrobiomeDataset({
    id: `custom-${Date.now()}`,
    name: params.datasetName || params.fileName,
    description: `Datos cargados desde el archivo "${params.fileName}" (${params.controlCols.length} muestras Control vs. ${params.hfdCols.length} muestras HFD).`,
    isSampleData: false,
    sourceLabel: `Archivo local: ${params.fileName}`,
    controlSampleNames: params.controlCols,
    hfdSampleNames: params.hfdCols,
    rawEntries,
  });
}
