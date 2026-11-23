import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeMicrobiomeDataset,
  benjaminiHochbergFDR,
  buildDatasetFromMappedTable,
  classifyShift,
  computeShannonIndex,
  detectColumnsFromTable,
  parseCsvTextToRows,
  parseTaxonomyString,
  welchTTestPValue,
} from './microbiomeAnalyzer';

import {
  EMPTY_PHYLOGENETIC_FILTER,
  filterTaxaByPhylogeny,
  getCascadingRankOptions,
  selectPhylogeneticRank,
} from './phylogeneticFilter';
import { PUBLISHED_COHORTS, generateCsvTemplateContent } from '../data/sampleDatasets';
import { METABOLIC_PATHWAYS, getFunctionalAnnotation } from '../data/bacteriaKnowledgeBase';

test('parseTaxonomyString extracts phylum, class, order, family, genus, and species accurately and flags unclassified', () => {
  const full = parseTaxonomyString(
    'k__Bacteria; p__Verrucomicrobiota; c__Verrucomicrobiae; o__Verrucomicrobiales; f__Akkermansiaceae; g__Akkermansia; s__Akkermansia_muciniphila'
  );
  assert.equal(full.phylum, 'Verrucomicrobiota');
  assert.equal(full.taxClass, 'Verrucomicrobiae');
  assert.equal(full.order, 'Verrucomicrobiales');
  assert.equal(full.family, 'Akkermansiaceae');
  assert.equal(full.genus, 'Akkermansia');
  assert.equal(full.species, 'Akkermansia muciniphila');
  assert.equal(full.resolutionLevel, 'especie');

  const familyOnly = parseTaxonomyString(
    'k__Bacteria; p__Bacteroidetes; c__Bacteroidia; o__Bacteroidales; f__Muribaculaceae; g__unclassified; s__unclassified'
  );
  assert.equal(familyOnly.taxClass, 'Bacteroidia');
  assert.equal(familyOnly.order, 'Bacteroidales');
  assert.equal(familyOnly.family, 'Muribaculaceae');
  assert.equal(familyOnly.genus, 'No identificado');
  assert.equal(familyOnly.species, 'No identificada a nivel de especie');
  assert.equal(familyOnly.resolutionLevel, 'familia');

  const genusOnly = parseTaxonomyString(
    'k__Bacteria; p__Firmicutes; f__Erysipelotrichaceae; g__Allobaculum; s__unclassified'
  );
  assert.equal(genusOnly.taxClass, 'No especificada');
  assert.equal(genusOnly.order, 'No especificado');
  assert.equal(genusOnly.family, 'Erysipelotrichaceae');
  assert.equal(genusOnly.genus, 'Allobaculum');
  assert.equal(genusOnly.species, 'No identificada a nivel de especie');
  assert.equal(genusOnly.displayName, 'Allobaculum spp.');
  assert.equal(genusOnly.resolutionLevel, 'genero');
});

test('welchTTestPValue returns low p-value for clearly separated groups and ~1 for identical groups', () => {
  const pDiff = welchTTestPValue([10.1, 9.8, 10.4, 9.9], [2.1, 1.9, 2.3, 2.0]);
  assert.ok(pDiff < 0.001, `Expected p < 0.001, got ${pDiff}`);

  const pSame = welchTTestPValue([5.0, 5.2, 4.8], [5.0, 5.2, 4.8]);
  assert.ok(pSame > 0.99, `Expected p ~ 1, got ${pSame}`);
});

test('classifyShift distinguishes exclusive HFD, undetected in HFD, increases, decreases, and stable', () => {
  assert.equal(classifyShift(0, 3.4, 0.001, 11.7), 'exclusiva_hfd');
  assert.equal(classifyShift(4.6, 0, 0.001, -12.1), 'no_detectada_hfd');
  assert.equal(classifyShift(2.0, 10.0, 0.002, 2.32), 'aumenta_hfd');
  assert.equal(classifyShift(10.0, 2.0, 0.002, -2.32), 'disminuye_hfd');
  assert.equal(classifyShift(5.0, 5.2, 0.65, 0.05), 'estable');
});

test('benjaminiHochbergFDR preserves monotonicity and bounds [0, 1]', () => {
  const q = benjaminiHochbergFDR([0.001, 0.01, 0.04, 0.5]);
  assert.equal(q.length, 4);
  assert.ok(q[0] <= q[1] && q[1] <= q[2] && q[2] <= q[3]);
  assert.ok(q.every((val) => val >= 0 && val <= 1));
});

test('computeShannonIndex returns 0 for single taxon and higher diversity for uniform community', () => {
  assert.equal(computeShannonIndex([100]), 0);
  const diverse = computeShannonIndex([25, 25, 25, 25]);
  const skewed = computeShannonIndex([90, 5, 3, 2]);
  assert.ok(diverse > skewed);
});

test('parseCsvTextToRows and buildDatasetFromMappedTable map explicit Class and Order columns', () => {
  const csv = [
    'Taxonomia,Filo,Clase,Orden,Familia,Genero,Especie,Control_1,Control_2,Control_3,HFD_1,HFD_2,HFD_3',
    'OTU_1,Firmicutes,Clostridia,Lachnospirales,Lachnospiraceae,Roseburia,Roseburia intestinalis,20,22,18,5,4,6',
    'OTU_2,Bacteroidetes,Bacteroidia,Bacteroidales,Muribaculaceae,unclassified,unclassified,50,48,52,20,22,18',
    'OTU_3,Desulfobacterota,Desulfovibrionia,Desulfovibrionales,Desulfovibrionaceae,Bilophila,Bilophila wadsworthia,0,0,0,10,12,11',
  ].join('\n');

  const { headers, rows } = parseCsvTextToRows(csv);
  const preview = detectColumnsFromTable('prueba.csv', headers, rows);
  assert.equal(preview.suggestedTaxonomyCol, 'Taxonomia');
  assert.equal(preview.suggestedPhylumCol, 'Filo');
  assert.equal(preview.suggestedClassCol, 'Clase');
  assert.equal(preview.suggestedOrderCol, 'Orden');
  assert.deepEqual(preview.suggestedControlCols, ['Control_1', 'Control_2', 'Control_3']);
  assert.deepEqual(preview.suggestedHfdCols, ['HFD_1', 'HFD_2', 'HFD_3']);

  const dataset = buildDatasetFromMappedTable({
    datasetName: 'Prueba CSV',
    fileName: 'prueba.csv',
    rows,
    taxonomyCol: preview.suggestedTaxonomyCol,
    phylumCol: preview.suggestedPhylumCol,
    classCol: preview.suggestedClassCol,
    orderCol: preview.suggestedOrderCol,
    familyCol: preview.suggestedFamilyCol,
    genusCol: preview.suggestedGenusCol,
    speciesCol: preview.suggestedSpeciesCol,
    controlCols: preview.suggestedControlCols,
    hfdCols: preview.suggestedHfdCols,
  });

  assert.equal(dataset.taxa.length, 3);
  assert.equal(dataset.summary.exclusivaHfdCount, 1);
  const bilophila = dataset.taxa.find((t) => t.taxonomy.genus === 'Bilophila');
  assert.ok(bilophila);
  assert.equal(bilophila.taxonomy.taxClass, 'Desulfovibrionia');
  assert.equal(bilophila.taxonomy.order, 'Desulfovibrionales');
  assert.equal(bilophila.category, 'exclusiva_hfd');
});

test('analyzeMicrobiomeDataset normalizes raw count tables automatically to relative percentages', () => {
  const dataset = analyzeMicrobiomeDataset({
    id: 'raw-counts',
    name: 'Conteos crudos',
    description: 'Prueba',
    isSampleData: false,
    sourceLabel: 'Test',
    controlSampleNames: ['C1', 'C2'],
    hfdSampleNames: ['H1', 'H2'],
    rawEntries: [
      {
        id: 't1',
        taxonomy: parseTaxonomyString('p__Firmicutes;f__Lachnospiraceae;g__Roseburia;s__Roseburia_intestinalis'),
        controlValues: [600, 600],
        hfdValues: [200, 200],
      },
      {
        id: 't2',
        taxonomy: parseTaxonomyString('p__Bacteroidetes;f__Muribaculaceae'),
        controlValues: [400, 400],
        hfdValues: [800, 800],
      },
    ],
  });

  const roseburia = dataset.taxa.find((t) => t.taxonomy.genus === 'Roseburia');
  assert.ok(roseburia);
  assert.equal(Math.round(roseburia.controlMean), 60);
  assert.equal(Math.round(roseburia.hfdMean), 20);
});

test('phylogeneticFilter cascades parent selections, reconciles invalid child selections, and scales to 240 taxa', () => {
  const rawEntries = Array.from({ length: 240 }, (_, idx) => {
    const isFirm = idx % 2 === 0;
    const isClost = idx % 4 === 0;
    const phylum = isFirm ? 'Firmicutes' : 'Bacteroidetes';
    const taxClass = isFirm ? (isClost ? 'Clostridia' : 'Bacilli') : 'Bacteroidia';
    const order = isFirm ? (isClost ? 'Lachnospirales' : 'Lactobacillales') : 'Bacteroidales';
    const family = isFirm ? (isClost ? 'Lachnospiraceae' : 'Lactobacillaceae') : 'Muribaculaceae';
    const genus = `Genus_${idx % 20}`;
    return {
      id: `taxon-${idx}`,
      taxonomy: parseTaxonomyString(
        `k__Bacteria; p__${phylum}; c__${taxClass}; o__${order}; f__${family}; g__${genus}; s__${genus}_sp${idx}`
      ),
      controlValues: [1.0, 1.1],
      hfdValues: [0.5, 0.6],
    };
  });

  const dataset = analyzeMicrobiomeDataset({
    id: 'large-240',
    name: 'Cohorte 240 taxones',
    description: 'Prueba de escalabilidad',
    isSampleData: false,
    sourceLabel: 'Test',
    controlSampleNames: ['C1', 'C2'],
    hfdSampleNames: ['H1', 'H2'],
    rawEntries,
  });

  let filter = EMPTY_PHYLOGENETIC_FILTER;
  const initialOptions = getCascadingRankOptions(dataset.taxa, filter);
  assert.equal(initialOptions.phylum.length, 2);
  assert.equal(initialOptions.taxClass.length, 3);

  // Select Firmicutes -> Class options narrow to Clostridia & Bacilli (60 each)
  filter = selectPhylogeneticRank(dataset.taxa, filter, 'phylum', 'Firmicutes');
  const firmOptions = getCascadingRankOptions(dataset.taxa, filter);
  assert.deepEqual(
    firmOptions.taxClass.map((o) => o.value).sort(),
    ['Bacilli', 'Clostridia']
  );
  assert.equal(filterTaxaByPhylogeny(dataset.taxa, filter).length, 120);

  // Select Clostridia -> Lachnospiraceae
  filter = selectPhylogeneticRank(dataset.taxa, filter, 'taxClass', 'Clostridia');
  filter = selectPhylogeneticRank(dataset.taxa, filter, 'family', 'Lachnospiraceae');
  assert.equal(filterTaxaByPhylogeny(dataset.taxa, filter).length, 60);

  // Switch Phylum to Bacteroidetes -> incompatible child selections (Clostridia, Lachnospiraceae) auto-reset
  filter = selectPhylogeneticRank(dataset.taxa, filter, 'phylum', 'Bacteroidetes');
  assert.equal(filter.phylum, 'Bacteroidetes');
  assert.equal(filter.taxClass, null);
  assert.equal(filter.family, null);
  assert.equal(filterTaxaByPhylogeny(dataset.taxa, filter).length, 120);
});

test('PUBLISHED_COHORTS contains only the Shen Y et al. (2025) peer-reviewed cohort with valid PMID and DOI', () => {
  assert.equal(PUBLISHED_COHORTS.length, 1);
  const cohort = PUBLISHED_COHORTS[0];
  assert.equal(cohort.id, 'shen-2025-nd-vs-hfd');
  assert.equal(cohort.isSampleData, false, `Expected ${cohort.id} to have isSampleData=false`);
  assert.ok(cohort.paperSource, `Expected ${cohort.id} to carry paperSource`);
  assert.equal(cohort.paperSource.pmid, '40783398');
  assert.equal(cohort.paperSource.doi, '10.1038/s41522-025-00799-3');
  assert.equal(cohort.taxa.length, 35);
  assert.equal(
    cohort.summary.aumentaHfdCount +
      cohort.summary.disminuyeHfdCount +
      cohort.summary.exclusivaHfdCount +
      cohort.summary.noDetectadaHfdCount +
      cohort.summary.estableCount,
    cohort.summary.totalTaxa
  );
  assert.equal(
    cohort.summary.significantCount,
    cohort.taxa.filter((t) => t.pValue < 0.05).length
  );
  assert.ok(cohort.summary.controlFBRatio !== null && cohort.summary.hfdFBRatio !== null);

  const template = generateCsvTemplateContent();
  assert.ok(template.includes('40783398'));
  assert.ok(template.includes('Alistipes'));
});

test('catalogued bacteria annotations and METABOLIC_PATHWAYS carry verified PubMed citations', () => {
  for (const pathway of METABOLIC_PATHWAYS) {
    assert.ok(pathway.references.length >= 2, `Expected >=2 PubMed refs on ${pathway.id}`);
    for (const ref of pathway.references) {
      assert.match(ref.pmid, /^\d+$/);
      assert.ok(ref.url.startsWith(`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}`));
    }
  }

  for (const genus of ['Akkermansia', 'Alistipes', 'Bilophila', 'Bifidobacterium', 'Blautia', 'Mucispirillum']) {
    const ann = getFunctionalAnnotation(
      parseTaxonomyString(`k__Bacteria; p__Bacillota; c__Clostridia; o__Eubacteriales; f__Lachnospiraceae; g__${genus}`)
    );
    assert.equal(ann.isCatalogued, true, `Expected ${genus} to be catalogued`);
    assert.ok(ann.references.length >= 1, `Expected >=1 PubMed ref for ${genus}`);
    for (const ref of ann.references) {
      assert.match(ref.pmid, /^\d+$/);
      assert.ok(ref.url.startsWith('https://pubmed.ncbi.nlm.nih.gov/'));
    }
  }
});
