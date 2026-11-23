import type { MicrobiomeDataset, RawTaxonEntry } from '../types/microbiome';
import { analyzeMicrobiomeDataset, parseTaxonomyString } from '../utils/microbiomeAnalyzer';

function buildEntry(
  id: string,
  taxonomyRaw: string,
  controlValues: number[],
  hfdValues: number[]
): RawTaxonEntry {
  return {
    id,
    taxonomy: parseTaxonomyString(taxonomyRaw),
    controlValues,
    hfdValues,
  };
}

/**
 * Cohorte 1: Shen Y et al., NPJ Biofilms and Microbiomes (2025)
 * PMID: 40783398 · PMCID: PMC12335491 · DOI: 10.1038/s41522-025-00799-3
 * También curado en BugSigDB · BioProject: PRJNA948687 / PRJNA1191677
 * Valores directos de MOESM2_ESM.xlsx (Tabla 1, Dieta Normal After1-7) y
 * MOESM3_ESM.xlsx (Tabla 2, Dieta Alta en Grasas After1-7), abundancia relativa (%).
 */
const SHEN_2025_ND_VS_HFD_ENTRIES: RawTaxonEntry[] = [
  buildEntry(
    "shen25-adlercreutzia",
    "k__Bacteria; p__Actinomycetota; c__Coriobacteriia; o__Eggerthellales; f__Eggerthellaceae; g__Adlercreutzia",
    [0,0.01557,0,0,0,0,0],
    [0,0,0,0,0,0.04718,0]
  ),
  buildEntry(
    "shen25-akkermansia",
    "k__Bacteria; p__Verrucomicrobiota; c__Verrucomicrobiia; o__Verrucomicrobiales; f__Akkermansiaceae; g__Akkermansia",
    [0,0,0,0,0,57.41857,0],
    [0,0,45.08239,0,0,39.74009,0]
  ),
  buildEntry(
    "shen25-alistipes",
    "k__Bacteria; p__Bacteroidota; c__Bacteroidia; o__Bacteroidales; f__Rikenellaceae; g__Alistipes",
    [17.61939,24.62212,20.0998,30.18835,30.70437,15.43907,49.08113],
    [1.62692,10.03161,6.18306,4.97261,4.42561,4.05475,2.676]
  ),
  buildEntry(
    "shen25-anaerotruncus",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Eubacteriales; f__Oscillospiraceae; g__Anaerotruncus",
    [2.3822,2.88351,1.50281,2.50305,3.77917,0.7151,2.42586],
    [6.04069,8.41237,13.42906,2.07747,4.62762,0.52396,3.95184]
  ),
  buildEntry(
    "shen25-bacteroidales-noname",
    "k__Bacteria; p__Bacteroidota; c__Bacteroidia; o__Bacteroidales",
    [0,0,0,0.03081,0,0,0],
    [0,0,0,0,0,0,0]
  ),
  buildEntry(
    "shen25-bacteroides",
    "k__Bacteria; p__Bacteroidota; c__Bacteroidia; o__Bacteroidales; f__Bacteroidaceae; g__Bacteroides",
    [3.14605,10.28493,4.53144,12.15943,6.66738,1.03076,4.26465],
    [4.4956,7.55424,3.31238,1.0707,1.52204,1.48766,0.72605]
  ),
  buildEntry(
    "shen25-bifidobacterium",
    "k__Bacteria; p__Actinomycetota; c__Actinomycetes; o__Bifidobacteriales; f__Bifidobacteriaceae; g__Bifidobacterium",
    [0,12.73164,6.54474,0.40586,0,2.77865,3.4446],
    [0,0,0,0.00869,0,0.24676,0.38451]
  ),
  buildEntry(
    "shen25-blautia",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Lachnospirales; f__Lachnospiraceae; g__Blautia",
    [0.15049,0,0.0881,0.08088,0,0,0],
    [0,0.13348,0.04022,0.06338,0.02374,0,0]
  ),
  buildEntry(
    "shen25-brevundimonas",
    "k__Bacteria; p__Pseudomonadota; c__Alphaproteobacteria; o__Caulobacterales; f__Caulobacteraceae; g__Brevundimonas",
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0.01386]
  ),
  buildEntry(
    "shen25-burkholderiales-noname",
    "k__Bacteria; p__Pseudomonadota; c__Betaproteobacteria; o__Burkholderiales",
    [0.24669,2.26625,4.82018,0.41253,2.56528,0.7074,0.36063],
    [0,0,0,0,0,0,0]
  ),
  buildEntry(
    "shen25-butyricimonas",
    "k__Bacteria; p__Bacteroidota; c__Bacteroidia; o__Bacteroidales; f__Odoribacteraceae; g__Butyricimonas",
    [0.02292,0.02472,0.0073,0.02642,0.07317,0.00992,0.0626],
    [0.03452,0.08844,0.0737,0.01047,0.02636,0.01836,0.00871]
  ),
  buildEntry(
    "shen25-candidatus-arthromitus",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Eubacteriales; f__Clostridiaceae; g__Candidatus_Arthromitus",
    [0.66164,0.18238,0.05401,0.03991,0.0237,0.00288,0.0416],
    [0,0,0,0,0,0,0]
  ),
  buildEntry(
    "shen25-collinsella",
    "k__Bacteria; p__Actinomycetota; c__Coriobacteriia; o__Coriobacteriales; f__Coriobacteriaceae; g__Collinsella",
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0.0165,0.01306]
  ),
  buildEntry(
    "shen25-cupriavidus",
    "k__Bacteria; p__Pseudomonadota; c__Betaproteobacteria; o__Burkholderiales; f__Burkholderiaceae; g__Cupriavidus",
    [0,0,0,0,0,0,0],
    [0.01421,0,0,0,0,0.0064,0]
  ),
  buildEntry(
    "shen25-desulfovibrio",
    "k__Bacteria; p__Thermodesulfobacteriota; c__Desulfovibrionia; o__Desulfovibrionales; f__Desulfovibrionaceae; g__Desulfovibrio",
    [0,0,0,0,0,0,0],
    [0,0,0.00819,0,0.00966,0.00291,0]
  ),
  buildEntry(
    "shen25-dorea",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Lachnospirales; f__Lachnospiraceae; g__Dorea",
    [0.05049,0.1067,1.332,2.09207,0.08947,0.07099,0],
    [1.27746,0.40649,0.01638,0.00649,0.00995,0,0]
  ),
  buildEntry(
    "shen25-enterobacter",
    "k__Bacteria; p__Pseudomonadota; c__Gammaproteobacteria; o__Enterobacterales; f__Enterobacteriaceae; g__Enterobacter",
    [0,0,0,0,0,0,0],
    [0,0.0109,0,0,0.00423,0,0]
  ),
  buildEntry(
    "shen25-enterococcus",
    "k__Bacteria; p__Bacillota; c__Bacilli; o__Lactobacillales; f__Enterococcaceae; g__Enterococcus",
    [0,0,0,0,0,0,0],
    [0.01564,0.00364,0.02417,0.21447,0.00646,0.00111,0]
  ),
  buildEntry(
    "shen25-enterorhabdus",
    "k__Bacteria; p__Actinomycetota; c__Coriobacteriia; o__Eggerthellales; f__Eggerthellaceae; g__Enterorhabdus",
    [0.04365,0.19339,0.1146,0.03608,0.00428,0.02711,0.06924],
    [0.73832,1.58896,0.63441,0.76555,0.55668,0.25406,0.79896]
  ),
  buildEntry(
    "shen25-erysipelotrichaceae-noname",
    "k__Bacteria; p__Bacillota; c__Erysipelotrichia; o__Erysipelotrichales; f__Erysipelotrichaceae",
    [0.01563,0,0,0,0,0,0.66258],
    [0.02484,0,0.00764,0,0.00372,0,0]
  ),
  buildEntry(
    "shen25-escherichia",
    "k__Bacteria; p__Pseudomonadota; c__Gammaproteobacteria; o__Enterobacterales; f__Enterobacteriaceae; g__Escherichia",
    [0.26597,0,0,0,0,0,0.0463],
    [0.64445,0.13305,0.19684,0.55577,0.11546,0.07842,0.02891]
  ),
  buildEntry(
    "shen25-eubacterium",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Eubacteriales; f__Eubacteriaceae; g__Eubacterium",
    [0.19072,0.1171,0.17257,0.30973,0.03519,0.0041,0.13567],
    [0.06144,0.05588,0.103,0.02815,0.07069,0.06248,0.87824]
  ),
  buildEntry(
    "shen25-lachnospiraceae-noname",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Lachnospirales; f__Lachnospiraceae",
    [2.46452,1.62982,3.06841,2.43734,2.57786,0.53375,0.34285],
    [0.29427,0.40943,0.44426,0.02735,0.77475,0.14633,0.16641]
  ),
  buildEntry(
    "shen25-lactobacillus",
    "k__Bacteria; p__Bacillota; c__Bacilli; o__Lactobacillales; f__Lactobacillaceae; g__Lactobacillus",
    [23.03124,26.76736,37.51256,11.43742,3.61462,12.59927,15.24065],
    [1.24209,7.2659,1.22969,50.78731,1.17709,35.50667,64.20156]
  ),
  buildEntry(
    "shen25-lactococcus",
    "k__Bacteria; p__Bacillota; c__Bacilli; o__Lactobacillales; f__Streptococcaceae; g__Lactococcus",
    [0,0,0,0,0,0,0],
    [18.92237,36.10175,13.17108,34.19994,7.86203,11.93458,21.7239]
  ),
  buildEntry(
    "shen25-mucispirillum",
    "k__Bacteria; p__Deferribacterota; c__Deferribacteres; o__Deferribacterales; f__Mucispirillaceae; g__Mucispirillum",
    [44.79702,7.94831,9.80741,28.59388,39.65475,2.30719,14.98258],
    [61.62937,4.8399,4.00442,2.91187,74.748,1.34898,3.14456]
  ),
  buildEntry(
    "shen25-odoribacter",
    "k__Bacteria; p__Bacteroidota; c__Bacteroidia; o__Bacteroidales; f__Odoribacteraceae; g__Odoribacter",
    [1.89134,5.50256,3.85568,4.65538,5.59431,1.30171,3.89396],
    [0.82937,1.74651,2.37312,0.34144,0.89221,0.04194,0.3439]
  ),
  buildEntry(
    "shen25-olsenella",
    "k__Bacteria; p__Actinomycetota; c__Coriobacteriia; o__Coriobacteriales; f__Atopobiaceae; g__Olsenella",
    [0,0,0,0,0,0,0],
    [0,0,0,0.0346,0,0.0693,0.22276]
  ),
  buildEntry(
    "shen25-oscillibacter",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Eubacteriales; f__Oscillospiraceae; g__Oscillibacter",
    [1.68777,0.12297,0.2429,0.45906,0.35959,0.04782,3.51797],
    [0.23634,0.42545,0.41608,0.07357,0.20766,0.02684,0.15466]
  ),
  buildEntry(
    "shen25-parabacteroides",
    "k__Bacteria; p__Bacteroidota; c__Bacteroidia; o__Bacteroidales; f__Tannerellaceae; g__Parabacteroides",
    [0.81458,3.08366,1.74447,3.63003,2.05817,4.11953,0.59371],
    [1.65961,20.4068,8.1437,1.64009,2.64536,4.23649,0.21923]
  ),
  buildEntry(
    "shen25-parasutterella",
    "k__Bacteria; p__Pseudomonadota; c__Betaproteobacteria; o__Burkholderiales; f__Sutterellaceae; g__Parasutterella",
    [0.20687,1.49087,4.11322,0.30228,1.49263,0.80182,0.27343],
    [0,0,0,0,0,0,0]
  ),
  buildEntry(
    "shen25-propionibacteriaceae-unclassified",
    "k__Bacteria; p__Actinomycetota; c__Actinomycetes; o__Propionibacteriales; f__Propionibacteriaceae",
    [0,0,0,0,0.40696,0,0],
    [0,0,0,0,0,0,0]
  ),
  buildEntry(
    "shen25-roseburia",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Lachnospirales; f__Lachnospiraceae; g__Roseburia",
    [0.04792,0,0.0075,0,0,0,0],
    [0.00502,0.00368,0,0,0.00518,0,0.0007]
  ),
  buildEntry(
    "shen25-staphylococcus",
    "k__Bacteria; p__Bacillota; c__Bacilli; o__Caryophanales; f__Staphylococcaceae; g__Staphylococcus",
    [0,0,0,0,0,0,0],
    [0,0.01114,0.00266,0,0,0,0.05812]
  ),
  buildEntry(
    "shen25-subdoligranulum",
    "k__Bacteria; p__Bacillota; c__Clostridia; o__Eubacteriales; f__Oscillospiraceae; g__Subdoligranulum",
    [0.26292,0.02614,0.38029,0.1995,0.29908,0.08437,0.55998],
    [0.20748,0.37039,1.10357,0.21006,0.28548,0.14821,0.28406]
  )
];

export const PUBLISHED_COHORTS: MicrobiomeDataset[] = [
  analyzeMicrobiomeDataset({
    id: 'shen-2025-nd-vs-hfd',
    name: 'Shen Y et al. (2025) · Ratones C57BL/6J: Dieta Normal vs. HFD (60% kcal)',
    description:
      'Metagenómica shotgun fecal en ratones C57BL/6J tras 21 días con dieta de mantenimiento normal D12450J (n=7) frente a dieta alta en grasas/baja en fibra D12492 (60% kcal, n=7). Datos por ratón extraídos de Tabla 1 y Tabla 2 suplementarias.',
    isSampleData: false,
    sourceLabel: 'NPJ Biofilms Microbiomes (2025) · PMID: 40783398 · PMC12335491 · BugSigDB',
    paperSource: {
      pmid: '40783398',
      doi: '10.1038/s41522-025-00799-3',
      authors: 'Shen Y et al.',
      journal: 'NPJ Biofilms and Microbiomes',
      year: '2025',
      title: 'High-fat and low-fiber diet elevates the gut resistome: a comparative metagenomic study',
      pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/40783398/',
      doiUrl: 'https://doi.org/10.1038/s41522-025-00799-3',
      databaseOrigin: 'PMC Open Access (PMC12335491) · BugSigDB · BioProject PRJNA948687',
      mouseStrain: 'C57BL/6J (SPF, 7–8 semanas al inicio)',
      dietProtocol: 'Control D12450J (10% kcal grasa) vs. HFD D12492 (60% kcal grasa), 21 días',
      sequencingMethod: 'Metagenómica shotgun (Illumina NovaSeq 6000, 150 pb PE)',
      measurementUnit: 'Abundancia relativa porcentual (%) por ratón (Tablas 1 y 2 suplementarias)',
    },
    controlSampleNames: ['ND_After1', 'ND_After2', 'ND_After3', 'ND_After4', 'ND_After5', 'ND_After6', 'ND_After7'],
    hfdSampleNames: ['HFD_After1', 'HFD_After2', 'HFD_After3', 'HFD_After4', 'HFD_After5', 'HFD_After6', 'HFD_After7'],
    rawEntries: SHEN_2025_ND_VS_HFD_ENTRIES,
  }),
];

// Alias preservado para compatibilidad de importaciones
export const SAMPLE_DATASETS: MicrobiomeDataset[] = PUBLISHED_COHORTS;

export function generateCsvTemplateContent(): string {
  const headers = [
    'Taxonomia',
    'Filo',
    'Clase',
    'Orden',
    'Familia',
    'Genero',
    'Especie',
    'Control_1',
    'Control_2',
    'Control_3',
    'HFD_1',
    'HFD_2',
    'HFD_3',
  ];
  // Filas reales tomadas de Shen Y et al. (2025, PMID: 40783398, MOESM2/MOESM3 After1-After3)
  const rows = [
    ['k__Bacteria; p__Bacteroidota; c__Bacteroidia; o__Bacteroidales; f__Rikenellaceae; g__Alistipes', 'Bacteroidota', 'Bacteroidia', 'Bacteroidales', 'Rikenellaceae', 'Alistipes', '', '23.9636', '27.0908', '18.1705', '4.3679', '1.4712', '2.5964'],
    ['k__Bacteria; p__Verrucomicrobiota; c__Verrucomicrobiae; o__Verrucomicrobiales; f__Akkermansiaceae; g__Akkermansia', 'Verrucomicrobiota', 'Verrucomicrobiae', 'Verrucomicrobiales', 'Akkermansiaceae', 'Akkermansia', '', '0', '0', '22.411', '0', '0', '37.1319'],
    ['k__Bacteria; p__Actinomycetota; c__Actinomycetes; o__Bifidobacteriales; f__Bifidobacteriaceae; g__Bifidobacterium', 'Actinomycetota', 'Actinomycetes', 'Bifidobacteriales', 'Bifidobacteriaceae', 'Bifidobacterium', '', '2.0079', '0', '3.7024', '0', '0', '0.289'],
    ['k__Bacteria; p__Bacteroidota; c__Bacteroidia; o__Bacteroidales; f__Bacteroidaceae; g__Bacteroides', 'Bacteroidota', 'Bacteroidia', 'Bacteroidales', 'Bacteroidaceae', 'Bacteroides', '', '5.3442', '7.669', '10.5797', '1.6227', '1.3095', '4.9806'],
  ];
  return [
    '# Plantilla basada en datos reales de Shen Y et al. (2025, PMID: 40783398, DOI: 10.1038/s41522-025-00799-3)',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');
}
