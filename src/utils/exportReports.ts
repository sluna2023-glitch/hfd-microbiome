import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { METABOLIC_PATHWAYS } from '../data/bacteriaKnowledgeBase';
import type {
  AiStructuredInterpretation,
  MicrobiomeDataset,
  PaperCitation,
  PubMedArticle,
  ShiftCategory,
} from '../types/microbiome';

const CATEGORY_LABELS: Record<ShiftCategory, string> = {
  aumenta_hfd: 'Aumenta en HFD',
  disminuye_hfd: 'Disminuye en HFD',
  exclusiva_hfd: 'Exclusiva en HFD',
  no_detectada_hfd: 'No detectada en HFD',
  estable: 'Sin cambio significativo',
};

function collectAllVerifiedReferences(
  dataset: MicrobiomeDataset,
  pubmedArticles: PubMedArticle[]
): PaperCitation[] {
  const byPmid = new Map<string, PaperCitation>();

  if (dataset.paperSource) {
    byPmid.set(dataset.paperSource.pmid, {
      pmid: dataset.paperSource.pmid,
      title: dataset.paperSource.title,
      authors: dataset.paperSource.authors,
      journal: dataset.paperSource.journal,
      year: dataset.paperSource.year,
      doi: dataset.paperSource.doi,
      url: dataset.paperSource.pubmedUrl,
    });
  }

  for (const art of pubmedArticles) {
    if (!byPmid.has(art.pmid)) {
      byPmid.set(art.pmid, {
        pmid: art.pmid,
        title: art.title,
        authors: art.authors,
        journal: art.journal,
        year: art.year,
        doi: art.doi,
        url: art.url,
      });
    }
  }

  for (const taxon of dataset.taxa) {
    for (const ref of taxon.annotation.references) {
      if (!byPmid.has(ref.pmid)) {
        byPmid.set(ref.pmid, ref);
      }
    }
  }

  for (const pathway of METABOLIC_PATHWAYS) {
    for (const ref of pathway.references) {
      if (!byPmid.has(ref.pmid)) {
        byPmid.set(ref.pmid, ref);
      }
    }
  }

  return Array.from(byPmid.values());
}

export function exportDatasetToExcel(
  dataset: MicrobiomeDataset,
  pubmedArticles: PubMedArticle[],
  aiInterpretation: AiStructuredInterpretation | null
): void {
  const wb = XLSX.utils.book_new();
  const paper = dataset.paperSource;

  // Sheet 1: Resumen del Estudio
  const summaryRows = [
    { Parametro: 'Nombre del conjunto de datos', Valor: dataset.name },
    { Parametro: 'Origen de los datos', Valor: dataset.sourceLabel },
    {
      Parametro: 'Naturaleza / Procedencia',
      Valor: paper
        ? `Estudio publicado en ${paper.journal} (${paper.year}) · PMID: ${paper.pmid} · DOI: ${paper.doi}`
        : 'Datos experimentales cargados por el usuario',
    },
    ...(paper
      ? [
          { Parametro: 'Autores principales', Valor: paper.authors },
          { Parametro: 'Cepa / Modelo murino', Valor: paper.mouseStrain },
          { Parametro: 'Protocolo dietético', Valor: paper.dietProtocol },
          { Parametro: 'Método de secuenciación', Valor: paper.sequencingMethod },
          { Parametro: 'Base de datos origen', Valor: paper.databaseOrigin },
        ]
      : []),
    { Parametro: 'Muestras Control (n)', Valor: dataset.controlSampleNames.length },
    { Parametro: 'Muestras HFD (n)', Valor: dataset.hfdSampleNames.length },
    { Parametro: 'Total de taxones analizados', Valor: dataset.summary.totalTaxa },
    { Parametro: 'Taxones detectados en Control', Valor: dataset.summary.controlDetectedTaxa },
    { Parametro: 'Taxones detectados en HFD', Valor: dataset.summary.hfdDetectedTaxa },
    { Parametro: 'Aumentan en HFD', Valor: dataset.summary.aumentaHfdCount },
    { Parametro: 'Disminuyen en HFD', Valor: dataset.summary.disminuyeHfdCount },
    { Parametro: 'Exclusivos en HFD', Valor: dataset.summary.exclusivaHfdCount },
    { Parametro: 'No detectados en HFD', Valor: dataset.summary.noDetectadaHfdCount },
    { Parametro: 'Índice Shannon (Control)', Valor: Number(dataset.summary.controlShannon.toFixed(3)) },
    { Parametro: 'Índice Shannon (HFD)', Valor: Number(dataset.summary.hfdShannon.toFixed(3)) },
    {
      Parametro: 'Ratio Firmicutes/Bacteroidetes (Control)',
      Valor: dataset.summary.controlFBRatio !== null ? Number(dataset.summary.controlFBRatio.toFixed(3)) : 'N/D',
    },
    {
      Parametro: 'Ratio Firmicutes/Bacteroidetes (HFD)',
      Valor: dataset.summary.hfdFBRatio !== null ? Number(dataset.summary.hfdFBRatio.toFixed(3)) : 'N/D',
    },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen_Estudio');

  // Sheet 2: Comparación Taxonómica
  const taxonRows = dataset.taxa.map((t) => ({
    Taxon_Principal: t.taxonomy.displayName,
    Filo: t.taxonomy.phylum,
    Clase: t.taxonomy.taxClass,
    Orden: t.taxonomy.order,
    Familia: t.taxonomy.family,
    Genero: t.taxonomy.genus,
    Especie: t.taxonomy.species,
    Media_Control_Pct: Number(t.controlMean.toFixed(4)),
    DE_Control: Number(t.controlSD.toFixed(4)),
    Media_HFD_Pct: Number(t.hfdMean.toFixed(4)),
    DE_HFD: Number(t.hfdSD.toFixed(4)),
    Fold_Change_HFD_vs_Ctrl: t.foldChange !== null ? Number(t.foldChange.toFixed(3)) : 'Infinito (solo HFD)',
    log2_Fold_Change: Number(t.log2FoldChange.toFixed(3)),
    p_valor_Welch: Number(t.pValue.toFixed(5)),
    FDR_q_valor: Number(t.fdrQValue.toFixed(5)),
    Deteccion_Control: `${t.controlDetectedCount}/${t.controlValues.length}`,
    Deteccion_HFD: `${t.hfdDetectedCount}/${t.hfdValues.length}`,
    Estado_Cambio: CATEGORY_LABELS[t.category],
  }));
  const wsTaxa = XLSX.utils.json_to_sheet(taxonRows);
  XLSX.utils.book_append_sheet(wb, wsTaxa, 'Comparacion_Taxonomica');

  // Sheet 3: Funciones Metabólicas e Inflamación
  const functionRows = dataset.taxa.map((t) => ({
    Taxon: t.taxonomy.displayName,
    Estado_en_Datos: CATEGORY_LABELS[t.category],
    Produccion_AGCC: t.annotation.scfaRoles.length > 0 ? t.annotation.scfaRoles.join(', ') : 'No documentada / Nula',
    Tendencia_Inflamatoria_Literatura: t.annotation.inflammationTendency,
    Funciones_Metabolicas_Documentadas: t.annotation.metabolicFunctions.join(' | '),
    Barrera_e_Inmunologia: t.annotation.barrierAndImmuneRole,
    Hipotesis_Mecanistica: t.annotation.mechanisticHypothesis,
    PMIDs_Respaldo: t.annotation.references.map((r) => r.pmid).join(', '),
  }));
  const wsFunctions = XLSX.utils.json_to_sheet(functionRows);
  XLSX.utils.book_append_sheet(wb, wsFunctions, 'Metabolismo_Inflamacion');

  // Sheet 4: Bibliografía PubMed + Síntesis IA
  const allRefs = collectAllVerifiedReferences(dataset, pubmedArticles);
  const refRows = allRefs.map((a) => ({
    PMID: a.pmid,
    Titulo: a.title,
    Autores: a.authors,
    Revista: a.journal,
    Anio: a.year,
    DOI: a.doi || '',
    Enlace_PubMed: a.url,
  }));
  if (aiInterpretation) {
    refRows.push({
      PMID: 'SINTESIS_IA',
      Titulo: aiInterpretation.resumenEjecutivo,
      Autores: 'Hallazgos comprobados: ' + aiInterpretation.hallazgosComprobados.join(' | '),
      Revista: 'Hipótesis: ' + aiInterpretation.hipotesisYExplicaciones.join(' | '),
      Anio: '',
      DOI: '',
      Enlace_PubMed: aiInterpretation.advertenciaMetodologica,
    });
  }
  const wsRefs = XLSX.utils.json_to_sheet(refRows);
  XLSX.utils.book_append_sheet(wb, wsRefs, 'Referencias_PubMed');

  const safeSlug = dataset.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  XLSX.writeFile(wb, `HFD-Microbiome-Analyzer_${safeSlug || 'informe'}.xlsx`);
}

export function exportReportToPdf(params: {
  dataset: MicrobiomeDataset;
  pubmedArticles: PubMedArticle[];
  aiInterpretation: AiStructuredInterpretation | null;
  chartImages?: Array<{ title: string; dataUrl: string }>;
}): void {
  const { dataset, pubmedArticles, aiInterpretation, chartImages = [] } = params;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const paper = dataset.paperSource;

  // Header band
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('HFD microbioma — Informe Científico Comparativo', 14, 13);
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  const subtitle = paper
    ? `${dataset.name} · PMID: ${paper.pmid} (${paper.journal}, ${paper.year})`
    : `${dataset.name} · Datos experimentales cargados`;
  doc.text(subtitle, 14, 21);

  let cursorY = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text('1. Resumen Cuantitativo de la Cohorte (Resultados Comprobados en los Datos)', 14, cursorY);
  cursorY += 5;

  autoTable(doc, {
    startY: cursorY,
    head: [['Métrica comparativa', 'Grupo Control', 'Grupo HFD', 'Interpretación directa']],
    body: [
      [
        'Número de muestras (n)',
        String(dataset.controlSampleNames.length),
        String(dataset.hfdSampleNames.length),
        `Total de ${dataset.summary.totalTaxa} taxones evaluados`,
      ],
      [
        'Diversidad alfa (Índice Shannon)',
        dataset.summary.controlShannon.toFixed(3),
        dataset.summary.hfdShannon.toFixed(3),
        dataset.summary.hfdShannon < dataset.summary.controlShannon
          ? 'Menor diversidad en HFD'
          : 'Diversidad conservada o mayor en HFD',
      ],
      [
        'Ratio Firmicutes / Bacteroidetes',
        dataset.summary.controlFBRatio !== null ? dataset.summary.controlFBRatio.toFixed(2) : 'N/D',
        dataset.summary.hfdFBRatio !== null ? dataset.summary.hfdFBRatio.toFixed(2) : 'N/D',
        'Indicador clásico de desplazamiento taxonómico por dieta',
      ],
      [
        'Taxones exclusivos / no detectados',
        `${dataset.summary.noDetectadaHfdCount} solo en Control`,
        `${dataset.summary.exclusivaHfdCount} solo en HFD`,
        `${dataset.summary.significantCount} taxones con p < 0,05 (${dataset.summary.aumentaHfdCount + dataset.summary.disminuyeHfdCount} cambios en compartidos)`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Embedded chart snapshots if provided
  for (const chart of chartImages) {
    if (cursorY > 210) {
      doc.addPage();
      cursorY = 18;
    }
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(chart.title, 14, cursorY);
    cursorY += 3;
    try {
      doc.addImage(chart.dataUrl, 'PNG', 14, cursorY, pageWidth - 28, 68);
      cursorY += 74;
    } catch {
      cursorY += 6;
    }
  }

  // Taxonomic table
  if (cursorY > 220) {
    doc.addPage();
    cursorY = 18;
  }
  doc.setFontSize(12);
  doc.text('2. Comparación Taxonómica (Familia, Género y Especie)', 14, cursorY);
  cursorY += 4;

  autoTable(doc, {
    startY: cursorY,
    head: [['Taxón / Especie', 'Familia', 'Control %', 'HFD %', 'log2FC', 'p-valor', 'Estado']],
    body: dataset.taxa.map((t) => [
      t.taxonomy.displayName,
      t.taxonomy.family,
      t.controlMean.toFixed(2),
      t.hfdMean.toFixed(2),
      t.log2FoldChange.toFixed(2),
      t.pValue < 0.001 ? '<0.001' : t.pValue.toFixed(3),
      CATEGORY_LABELS[t.category],
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    margin: { left: 14, right: 14 },
  });

  cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  if (aiInterpretation) {
    if (cursorY > 220) {
      doc.addPage();
      cursorY = 18;
    }
    doc.setFontSize(12);
    doc.text('3. Interpretación Científica: Evidencia vs. Hipótesis', 14, cursorY);
    cursorY += 6;
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(
      `Resumen: ${aiInterpretation.resumenEjecutivo}\n\n` +
        `Resultados comprobados en los datos:\n• ${aiInterpretation.hallazgosComprobados.join('\n• ')}\n\n` +
        `Hipótesis y posibles explicaciones (por validar):\n• ${aiInterpretation.hipotesisYExplicaciones.join('\n• ')}`,
      pageWidth - 28
    );
    doc.text(lines, 14, cursorY);
    cursorY += lines.length * 4 + 8;
  }

  const allRefs = collectAllVerifiedReferences(dataset, pubmedArticles);
  if (allRefs.length > 0) {
    if (cursorY > 220) {
      doc.addPage();
      cursorY = 18;
    }
    doc.setFontSize(12);
    doc.text('4. Referencias Científicas Reales (NCBI PubMed)', 14, cursorY);
    cursorY += 4;
    autoTable(doc, {
      startY: cursorY,
      head: [['PMID', 'Título', 'Autores / Revista / Año']],
      body: allRefs.map((a) => [
        a.pmid,
        a.title,
        `${a.authors} · ${a.journal} (${a.year})`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      margin: { left: 14, right: 14 },
    });
  }

  const safeSlug = dataset.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  doc.save(`HFD-Microbiome-Informe_${safeSlug || 'reporte'}.pdf`);
}
