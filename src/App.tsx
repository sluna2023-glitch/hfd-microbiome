import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import type {
  AnalyzedTaxon,
  MicrobiomeDataset,
  PubMedArticle,
} from './types/microbiome';
import { TopBar, type AppSection } from './components/TopBar';
import { CohortOverview } from './components/CohortOverview';
import { ComparisonView } from './components/ComparisonView';
import { MetabolismView } from './components/MetabolismView';
import { InflammationView } from './components/InflammationView';
import { PubMedAiView } from './components/PubMedAiView';
import { TaxonInspectorDrawer } from './components/TaxonInspectorDrawer';
import { UploadDataModal } from './components/UploadDataModal';
import { exportDatasetToExcel, exportReportToPdf } from './utils/exportReports';

export default function App() {
  const [datasets, setDatasets] = useState<MicrobiomeDataset[]>(SAMPLE_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = useState<string>(SAMPLE_DATASETS[0].id);
  const [activeSection, setActiveSection] = useState<AppSection>('comparacion');
  const [selectedTaxon, setSelectedTaxon] = useState<AnalyzedTaxon | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [pubmedArticles, setPubmedArticles] = useState<PubMedArticle[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const log2ChartRef = useRef<HTMLDivElement | null>(null);
  const abundanceChartRef = useRef<HTMLDivElement | null>(null);

  const activeDataset =
    datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  const handleDatasetLoaded = (newDataset: MicrobiomeDataset) => {
    setDatasets((prev) => [newDataset, ...prev]);
    setActiveDatasetId(newDataset.id);
    setSelectedTaxon(null);
    setActiveSection('comparacion');
  };

  const handleArticlesDiscovered = (incoming: PubMedArticle[]) => {
    setPubmedArticles((prev) => {
      const seen = new Set(prev.map((a) => a.pmid));
      const merged = [...prev];
      for (const art of incoming) {
        if (!seen.has(art.pmid)) {
          seen.add(art.pmid);
          merged.push(art);
        }
      }
      return merged;
    });
  };

  const handleExportExcel = () => {
    exportDatasetToExcel(activeDataset, pubmedArticles, null);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const chartImages: Array<{ title: string; dataUrl: string }> = [];
      if (log2ChartRef.current) {
        try {
          const url = await toPng(log2ChartRef.current, {
            backgroundColor: '#FFFFFF',
            pixelRatio: 2,
          });
          chartImages.push({
            title: 'Gráfico A: Desplazamiento Diferencial (log2 Fold Change)',
            dataUrl: url,
          });
        } catch {
          // Proceed cleanly if chart capture is unavailable
        }
      }
      if (abundanceChartRef.current) {
        try {
          const url = await toPng(abundanceChartRef.current, {
            backgroundColor: '#FFFFFF',
            pixelRatio: 2,
          });
          chartImages.push({
            title: 'Gráfico B: Abundancia Relativa Comparativa (Control vs. HFD)',
            dataUrl: url,
          });
        } catch {
          // Proceed cleanly if chart capture is unavailable
        }
      }

      exportReportToPdf({
        dataset: activeDataset,
        pubmedArticles,
        aiInterpretation: null,
        chartImages,
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <TopBar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <CohortOverview
          datasets={datasets}
          activeDataset={activeDataset}
          onSelectDataset={(id) => {
            setActiveDatasetId(id);
            setSelectedTaxon(null);
          }}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          isExportingPdf={isExportingPdf}
        />

        {activeSection === 'comparacion' && (
          <ComparisonView
            dataset={activeDataset}
            selectedTaxonId={selectedTaxon?.id ?? null}
            onSelectTaxon={setSelectedTaxon}
            log2ChartRef={log2ChartRef}
            abundanceChartRef={abundanceChartRef}
          />
        )}

        {activeSection === 'metabolismo' && (
          <MetabolismView
            dataset={activeDataset}
            onSelectTaxon={setSelectedTaxon}
          />
        )}

        {activeSection === 'inflamacion' && (
          <InflammationView
            dataset={activeDataset}
            onSelectTaxon={setSelectedTaxon}
          />
        )}

        {activeSection === 'bibliografia' && (
          <PubMedAiView
            articles={pubmedArticles}
            onUpdateArticles={setPubmedArticles}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            HFD microbioma · Herramienta de análisis comparativo de microbiota intestinal (HFD vs. Control)
          </span>
          <span>
            Las referencias bibliográficas provienen en tiempo real de NCBI PubMed E-utilities.
          </span>
        </div>
      </footer>

      <TaxonInspectorDrawer
        taxon={selectedTaxon}
        onClose={() => setSelectedTaxon(null)}
        onArticlesDiscovered={handleArticlesDiscovered}
      />

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />
    </div>
  );
}
