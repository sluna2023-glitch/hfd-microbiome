export type ShiftCategory =
  | 'aumenta_hfd'
  | 'disminuye_hfd'
  | 'exclusiva_hfd'
  | 'no_detectada_hfd'
  | 'estable';

export type EvidenceTier = 'comprobado_datos' | 'documentado_literatura' | 'hipotesis';

export interface TaxonomyInfo {
  rawName: string;
  phylum: string;
  taxClass: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  displayName: string;
  resolutionLevel: 'especie' | 'genero' | 'familia' | 'orden' | 'clase' | 'filo';
}

export interface PhylogeneticFilterState {
  phylum: string | null;
  taxClass: string | null;
  order: string | null;
  family: string | null;
  genus: string | null;
}

export interface RawTaxonEntry {
  id: string;
  taxonomy: TaxonomyInfo;
  controlValues: number[];
  hfdValues: number[];
  precomputedPValue?: number;
}

export interface PaperCitation {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi?: string;
  url: string;
}

export interface PaperSourceMetadata {
  pmid: string;
  doi: string;
  authors: string;
  journal: string;
  year: string;
  title: string;
  pubmedUrl: string;
  doiUrl: string;
  databaseOrigin: string;
  mouseStrain: string;
  dietProtocol: string;
  sequencingMethod: string;
  measurementUnit: string;
}

export interface FunctionalAnnotation {
  scfaRoles: Array<'butirato' | 'propionato' | 'acetato'>;
  metabolicFunctions: string[];
  barrierAndImmuneRole: string;
  inflammationTendency: 'antiinflamatoria' | 'proinflamatoria' | 'dependiente_contexto' | 'no_caracterizada';
  typicalHfdTrendInLiterature: string;
  mechanisticHypothesis: string;
  references: PaperCitation[];
  isCatalogued: boolean;
}

export interface AnalyzedTaxon {
  id: string;
  taxonomy: TaxonomyInfo;
  controlValues: number[];
  hfdValues: number[];
  controlMean: number;
  hfdMean: number;
  controlSD: number;
  hfdSD: number;
  controlDetectedCount: number;
  hfdDetectedCount: number;
  foldChange: number | null;
  log2FoldChange: number;
  pValue: number;
  fdrQValue: number;
  isStatisticallySignificant: boolean;
  category: ShiftCategory;
  annotation: FunctionalAnnotation;
}

export interface CohortSummaryMetrics {
  totalTaxa: number;
  controlDetectedTaxa: number;
  hfdDetectedTaxa: number;
  sharedTaxa: number;
  exclusivaHfdCount: number;
  noDetectadaHfdCount: number;
  aumentaHfdCount: number;
  disminuyeHfdCount: number;
  estableCount: number;
  significantCount: number;
  controlShannon: number;
  hfdShannon: number;
  controlFirmicutesPct: number;
  hfdFirmicutesPct: number;
  controlBacteroidetesPct: number;
  hfdBacteroidetesPct: number;
  controlFBRatio: number | null;
  hfdFBRatio: number | null;
}

export interface MicrobiomeDataset {
  id: string;
  name: string;
  description: string;
  isSampleData: boolean;
  sourceLabel: string;
  paperSource?: PaperSourceMetadata;
  controlSampleNames: string[];
  hfdSampleNames: string[];
  taxa: AnalyzedTaxon[];
  summary: CohortSummaryMetrics;
}

export interface BugSigDbSignature {
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

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi?: string;
  abstractSnippet?: string;
  url: string;
}

export interface AiStructuredInterpretation {
  resumenEjecutivo: string;
  hallazgosComprobados: string[];
  funcionesMetabolicas: string[];
  relacionInflamacionObesidad: string[];
  hipotesisYExplicaciones: string[];
  citasUtilizadas: Array<{
    pmid: string;
    relevancia: string;
  }>;
  advertenciaMetodologica: string;
}

export interface ParsedTablePreview {
  fileName: string;
  headers: string[];
  rows: Record<string, string | number>[];
  suggestedTaxonomyCol: string;
  suggestedPhylumCol: string;
  suggestedClassCol: string;
  suggestedOrderCol: string;
  suggestedFamilyCol: string;
  suggestedGenusCol: string;
  suggestedSpeciesCol: string;
  suggestedControlCols: string[];
  suggestedHfdCols: string[];
}
