import React from 'react';
import { Download, ExternalLink, FileSpreadsheet, FileText } from 'lucide-react';
import type { MicrobiomeDataset } from '../types/microbiome';

interface CohortOverviewProps {
  datasets: MicrobiomeDataset[];
  activeDataset: MicrobiomeDataset;
  onSelectDataset: (id: string) => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
}

export const CohortOverview: React.FC<CohortOverviewProps> = ({
  datasets,
  activeDataset,
  onSelectDataset,
  onExportExcel,
  onExportPdf,
  isExportingPdf,
}) => {
  const { summary, paperSource } = activeDataset;
  const shannonDelta = summary.hfdShannon - summary.controlShannon;
  const fbDelta =
    summary.hfdFBRatio !== null && summary.controlFBRatio !== null
      ? summary.hfdFBRatio - summary.controlFBRatio
      : null;

  return (
    <section aria-labelledby="cohort-heading" className="space-y-5">
      {/* Workspace context & export bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
            <span className="text-teal-700 font-semibold">
              {paperSource
                ? `Estudio científico publicado (${paperSource.journal}, ${paperSource.year})`
                : 'Datos experimentales cargados'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Control n={activeDataset.controlSampleNames.length}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">HFD n={activeDataset.hfdSampleNames.length}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{summary.totalTaxa} taxones evaluados</span>
          </div>
          <h1 id="cohort-heading" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeDataset.name}
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl">
            {activeDataset.description}
          </p>

          {paperSource && (
            <div
              data-testid="paper-provenance-bar"
              className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600"
            >
              <a
                href={paperSource.pubmedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono font-semibold text-teal-800 hover:underline"
              >
                <span>PMID: {paperSource.pmid}</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
              <a
                href={paperSource.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-slate-700 hover:text-teal-800 hover:underline"
              >
                <span>DOI: {paperSource.doi}</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
              <span className="text-slate-500">{paperSource.databaseOrigin}</span>
              <span className="text-slate-500">{paperSource.sequencingMethod}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {datasets.length > 1 && (
            <div className="flex flex-col gap-1">
              <label htmlFor="dataset-selector" className="sr-only">
                Seleccionar cohorte de estudio
              </label>
              <select
                id="dataset-selector"
                value={activeDataset.id}
                onChange={(e) => onSelectDataset(e.target.value)}
                className="px-3 py-2 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 w-full sm:w-auto sm:max-w-md"
              >
                {datasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.paperSource
                      ? `Paper (PMID ${ds.paperSource.pmid}): ${ds.name}`
                      : `Archivo: ${ds.name}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-900 bg-slate-100 border border-slate-300 hover:bg-slate-200 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            {isExportingPdf ? (
              <Download className="w-4 h-4 animate-pulse" aria-hidden="true" />
            ) : (
              <FileText className="w-4 h-4 text-slate-700" aria-hidden="true" />
            )}
            <span>{isExportingPdf ? 'Generando PDF...' : 'Exportar PDF'}</span>
          </button>
        </div>
      </div>

      {/* 4-column scientific KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Diversidad Alfa (Índice Shannon)</div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900">
              {summary.hfdShannon.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">
              HFD vs. {summary.controlShannon.toFixed(2)} Ctrl
            </span>
          </div>
          <div
            className={`mt-1.5 text-xs font-mono tabular-nums ${
              shannonDelta < 0 ? 'text-amber-700' : 'text-teal-700'
            }`}
          >
            {shannonDelta >= 0 ? '▲' : '▼'} {shannonDelta >= 0 ? '+' : ''}
            {shannonDelta.toFixed(2)} en grupo HFD
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Ratio Firmicutes / Bacteroidetes</div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900">
              {summary.hfdFBRatio !== null ? summary.hfdFBRatio.toFixed(2) : 'N/D'}
            </span>
            <span className="text-xs font-mono text-slate-500">
              HFD vs. {summary.controlFBRatio !== null ? summary.controlFBRatio.toFixed(2) : 'N/D'} Ctrl
            </span>
          </div>
          <div
            className={`mt-1.5 text-xs font-mono tabular-nums ${
              fbDelta !== null && fbDelta > 0 ? 'text-amber-700' : 'text-slate-600'
            }`}
          >
            {fbDelta !== null
              ? `${fbDelta >= 0 ? '▲ +' : '▼ '}${fbDelta.toFixed(2)} cambio de razón F/B`
              : 'Filos no especificados para razón F/B'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Desplazamientos de Abundancia</div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900">
              {summary.aumentaHfdCount + summary.disminuyeHfdCount}
            </span>
            <span className="text-xs font-mono text-slate-500">de {summary.totalTaxa} taxones</span>
          </div>
          <div className="mt-1.5 text-xs text-slate-600 font-mono tabular-nums">
            ▲ {summary.aumentaHfdCount} aumentan · ▼ {summary.disminuyeHfdCount} disminuyen
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">Detección Exclusiva por Dieta</div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900">
              {summary.exclusivaHfdCount + summary.noDetectadaHfdCount}
            </span>
            <span className="text-xs font-mono text-slate-500">presencia diferencial</span>
          </div>
          <div className="mt-1.5 text-xs text-slate-600 font-mono tabular-nums">
            +{summary.exclusivaHfdCount} solo en HFD · −{summary.noDetectadaHfdCount} ausentes en HFD
          </div>
        </div>
      </div>
    </section>
  );
};
