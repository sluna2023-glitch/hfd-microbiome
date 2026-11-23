import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Eye, Minus, RotateCcw, Search, Sparkles } from 'lucide-react';
import type {
  AnalyzedTaxon,
  MicrobiomeDataset,
  PhylogeneticFilterState,
  ShiftCategory,
} from '../types/microbiome';
import {
  countActivePhylogeneticFilters,
  EMPTY_PHYLOGENETIC_FILTER,
  filterTaxaByPhylogeny,
  PHYLOGENETIC_RANKS,
  selectPhylogeneticRank,
  type PhylogeneticRankKey,
} from '../utils/phylogeneticFilter';
import { PhylogeneticSidebar } from './PhylogeneticSidebar';

interface ComparisonViewProps {
  dataset: MicrobiomeDataset;
  selectedTaxonId: string | null;
  onSelectTaxon: (taxon: AnalyzedTaxon) => void;
  log2ChartRef?: React.RefObject<HTMLDivElement | null>;
  abundanceChartRef?: React.RefObject<HTMLDivElement | null>;
}

const FILTER_TABS: Array<{ id: 'all' | ShiftCategory; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'aumenta_hfd', label: 'Aumentan en HFD' },
  { id: 'disminuye_hfd', label: 'Disminuyen en HFD' },
  { id: 'exclusiva_hfd', label: 'Exclusivas en HFD' },
  { id: 'no_detectada_hfd', label: 'No detectadas en HFD' },
];

const PAGE_SIZE = 50;

export function renderCategoryLabel(category: ShiftCategory): {
  text: string;
  symbol: string;
  textClass: string;
} {
  switch (category) {
    case 'exclusiva_hfd':
      return { text: 'Exclusiva HFD', symbol: '◆', textClass: 'text-rose-700 font-semibold' };
    case 'no_detectada_hfd':
      return { text: 'No detectada en HFD', symbol: '○', textClass: 'text-sky-700 font-semibold' };
    case 'aumenta_hfd':
      return { text: 'Aumenta en HFD', symbol: '▲', textClass: 'text-amber-700 font-semibold' };
    case 'disminuye_hfd':
      return { text: 'Disminuye en HFD', symbol: '▼', textClass: 'text-teal-700 font-semibold' };
    default:
      return { text: 'Estable', symbol: '—', textClass: 'text-slate-500' };
  }
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  dataset,
  selectedTaxonId,
  onSelectTaxon,
  log2ChartRef,
  abundanceChartRef,
}) => {
  const [filter, setFilter] = useState<'all' | ShiftCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'log2fc' | 'hfdMean' | 'controlMean' | 'pValue'>('log2fc');
  const [sortAsc, setSortAsc] = useState(false);
  const [phyloFilter, setPhyloFilter] = useState<PhylogeneticFilterState>(EMPTY_PHYLOGENETIC_FILTER);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setPhyloFilter(EMPTY_PHYLOGENETIC_FILTER);
    setFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  }, [dataset.id]);

  const activePhyloCount = countActivePhylogeneticFilters(phyloFilter);

  const phyloFilteredTaxa = useMemo(
    () => filterTaxaByPhylogeny(dataset.taxa, phyloFilter),
    [dataset.taxa, phyloFilter]
  );

  // Top taxa for diverging log2FC chart (up to 14 most shifted within active clade)
  const log2ChartTaxa = useMemo(() => {
    return [...phyloFilteredTaxa]
      .sort((a, b) => Math.abs(b.log2FoldChange) - Math.abs(a.log2FoldChange))
      .slice(0, 14)
      .sort((a, b) => b.log2FoldChange - a.log2FoldChange);
  }, [phyloFilteredTaxa]);

  const maxAbsLog2 = useMemo(() => {
    const maxVal = Math.max(2, ...log2ChartTaxa.map((t) => Math.abs(t.log2FoldChange)));
    return Math.ceil(maxVal);
  }, [log2ChartTaxa]);

  // Top 10 abundant taxa for grouped abundance comparison within active clade
  const topAbundantTaxa = useMemo(() => {
    return [...phyloFilteredTaxa]
      .sort((a, b) => Math.max(b.controlMean, b.hfdMean) - Math.max(a.controlMean, a.hfdMean))
      .slice(0, 10);
  }, [phyloFilteredTaxa]);

  const maxAbundance = useMemo(() => {
    return Math.max(10, ...topAbundantTaxa.map((t) => Math.max(t.controlMean, t.hfdMean)));
  }, [topAbundantTaxa]);

  // Phylum distribution summary within active clade
  const phylumBreakdown = useMemo(() => {
    const map = new Map<string, { control: number; hfd: number }>();
    for (const t of phyloFilteredTaxa) {
      const p = t.taxonomy.phylum || 'No especificado';
      const prev = map.get(p) || { control: 0, hfd: 0 };
      map.set(p, {
        control: prev.control + t.controlMean,
        hfd: prev.hfd + t.hfdMean,
      });
    }
    return Array.from(map.entries())
      .map(([phylum, vals]) => ({ phylum, ...vals }))
      .sort((a, b) => Math.max(b.control, b.hfd) - Math.max(a.control, a.hfd));
  }, [phyloFilteredTaxa]);

  const filteredTaxa = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = phyloFilteredTaxa.filter((t) => {
      if (filter !== 'all' && t.category !== filter) return false;
      if (!q) return true;
      return (
        t.taxonomy.displayName.toLowerCase().includes(q) ||
        t.taxonomy.family.toLowerCase().includes(q) ||
        t.taxonomy.genus.toLowerCase().includes(q) ||
        t.taxonomy.species.toLowerCase().includes(q) ||
        t.taxonomy.phylum.toLowerCase().includes(q) ||
        t.taxonomy.taxClass.toLowerCase().includes(q) ||
        t.taxonomy.order.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      let diff = 0;
      if (sortField === 'log2fc') diff = Math.abs(b.log2FoldChange) - Math.abs(a.log2FoldChange);
      else if (sortField === 'hfdMean') diff = b.hfdMean - a.hfdMean;
      else if (sortField === 'controlMean') diff = b.controlMean - a.controlMean;
      else if (sortField === 'pValue') diff = a.pValue - b.pValue;
      return sortAsc ? -diff : diff;
    });
    return list;
  }, [phyloFilteredTaxa, filter, searchQuery, sortField, sortAsc]);

  useEffect(() => {
    setCurrentPage(1);
  }, [phyloFilter, filter, searchQuery, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredTaxa.length / PAGE_SIZE));
  const paginatedTaxa = useMemo(() => {
    if (filteredTaxa.length <= PAGE_SIZE) return filteredTaxa;
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTaxa.slice(start, start + PAGE_SIZE);
  }, [filteredTaxa, currentPage]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleSelectPhylogeneticRank = (rank: PhylogeneticRankKey, value: string | null) => {
    setPhyloFilter((prev) => selectPhylogeneticRank(dataset.taxa, prev, rank, value));
  };

  const handleResetAllFilters = () => {
    setPhyloFilter(EMPTY_PHYLOGENETIC_FILTER);
    setFilter('all');
    setSearchQuery('');
  };

  const activeCladeSummary = useMemo(() => {
    if (activePhyloCount === 0) return null;
    return PHYLOGENETIC_RANKS.filter((r) => phyloFilter[r.key] !== null)
      .map((r) => `${r.shortLabel}: ${phyloFilter[r.key]}`)
      .join(' · ');
  }, [activePhyloCount, phyloFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[288px_minmax(0,1fr)] gap-6 items-start">
      <PhylogeneticSidebar
        taxa={dataset.taxa}
        filteredCount={phyloFilteredTaxa.length}
        filter={phyloFilter}
        onSelectRank={handleSelectPhylogeneticRank}
        onResetFilters={() => setPhyloFilter(EMPTY_PHYLOGENETIC_FILTER)}
      />

      <div className="min-w-0 space-y-6">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Chart 1: Diverging log2 Fold Change */}
          <div
            ref={log2ChartRef}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Desplazamiento Diferencial (log2 Fold Change)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeCladeSummary
                      ? `Subconjunto filogenético (${phyloFilteredTaxa.length} taxones) · Haga clic en una barra para analizar`
                      : 'Hacia la derecha: enriquecida en HFD · Hacia la izquierda: mayor en Control · Haga clic en una barra para analizar'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-teal-600 inline-block rounded-xs" />
                    Control
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-amber-600 inline-block rounded-xs" />
                    HFD
                  </span>
                </div>
              </div>

              <div className="space-y-2" data-testid="log2fc-chart">
                {log2ChartTaxa.map((taxon) => {
                  const isPositive = taxon.log2FoldChange >= 0;
                  const widthPct = Math.min(100, (Math.abs(taxon.log2FoldChange) / maxAbsLog2) * 100);
                  const isSelected = selectedTaxonId === taxon.id;

                  return (
                    <button
                      key={taxon.id}
                      type="button"
                      onClick={() => onSelectTaxon(taxon)}
                      className={`w-full grid grid-cols-[140px_1fr_64px] sm:grid-cols-[170px_1fr_72px] items-center gap-2 py-1 px-1.5 rounded text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                        isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-800 truncate" title={taxon.taxonomy.displayName}>
                        {taxon.taxonomy.displayName}
                      </span>
                      <div className="relative h-5 flex items-center bg-slate-50 rounded-xs overflow-hidden border border-slate-100">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 z-10" />
                        {isPositive ? (
                          <div
                            className="absolute left-1/2 h-3.5 bg-amber-600 rounded-r-xs transition-all"
                            style={{ width: `${widthPct / 2}%` }}
                          />
                        ) : (
                          <div
                            className="absolute right-1/2 h-3.5 bg-teal-600 rounded-l-xs transition-all"
                            style={{ width: `${widthPct / 2}%` }}
                          />
                        )}
                      </div>
                      <span
                        className={`text-xs font-mono tabular-nums text-right ${
                          isPositive ? 'text-amber-700' : 'text-teal-700'
                        }`}
                      >
                        {taxon.log2FoldChange >= 0 ? '+' : ''}
                        {taxon.log2FoldChange.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>−{maxAbsLog2} (Mayor en Control)</span>
              <span>0</span>
              <span>+{maxAbsLog2} (Mayor en HFD)</span>
            </div>
          </div>

          {/* Chart 2: Grouped Relative Abundance + Phylum Summary */}
          <div
            ref={abundanceChartRef}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Abundancia Relativa Media (%) — Top {Math.min(10, topAbundantTaxa.length)} Taxones
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comparación porcentual directa entre ratones Control y dieta alta en grasas (HFD)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-teal-700 inline-block rounded-xs" />
                    Control %
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-amber-500 inline-block rounded-xs" />
                    HFD %
                  </span>
                </div>
              </div>

              <div className="space-y-2.5" data-testid="abundance-chart">
                {topAbundantTaxa.map((taxon) => {
                  const ctrlW = (taxon.controlMean / maxAbundance) * 100;
                  const hfdW = (taxon.hfdMean / maxAbundance) * 100;
                  return (
                    <button
                      key={taxon.id}
                      type="button"
                      onClick={() => onSelectTaxon(taxon)}
                      className="w-full text-left hover:bg-slate-50 p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-800 truncate pr-2">
                          {taxon.taxonomy.displayName}
                        </span>
                        <span className="font-mono tabular-nums text-slate-500 shrink-0">
                          {taxon.controlMean.toFixed(1)}% vs. {taxon.hfdMean.toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 bg-slate-100 rounded-xs overflow-hidden">
                          <div className="h-full bg-teal-700" style={{ width: `${Math.max(1, ctrlW)}%` }} />
                        </div>
                        <div className="h-2 bg-slate-100 rounded-xs overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${Math.max(1, hfdW)}%` }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phylum summary strip */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-700 mb-2">
                Distribución por Filo (Control vs. HFD)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {phylumBreakdown.slice(0, 6).map((item) => (
                  <div key={item.phylum} className="bg-slate-50 border border-slate-200/70 rounded-lg px-2.5 py-1.5">
                    <div className="text-[11px] font-medium text-slate-700 truncate">{item.phylum}</div>
                    <div className="text-xs font-mono tabular-nums text-slate-900 mt-0.5">
                      {item.control.toFixed(1)}% → {item.hfd.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Taxonomic Table */}
        <section aria-labelledby="taxonomy-table-heading" className="bg-white border border-slate-200 rounded-xl">
          <div className="p-5 border-b border-slate-200 flex flex-col gap-3.5">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="taxonomy-table-heading" className="text-base font-semibold text-slate-900">
                  Identificación Taxonómica y Comparación Estadística
                </h2>
                <span
                  className="text-xs font-mono tabular-nums text-slate-500"
                  data-testid="filtered-taxon-count"
                >
                  Mostrando {filteredTaxa.length} de {dataset.taxa.length} taxones
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeCladeSummary
                  ? `Filtro filogenético activo: ${activeCladeSummary}`
                  : 'Clasificación por filo, clase, orden, familia, género y especie con prueba de Welch y FDR'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar especie, género o familia..."
                  aria-label="Buscar bacteria por especie, género o familia"
                  className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 w-full sm:w-64"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      filter === tab.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Taxón / Linaje</th>
                  <th className="py-3 px-3">Familia / Género</th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('controlMean')}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      <span>Control %</span>
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('hfdMean')}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      <span>HFD %</span>
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('log2fc')}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      <span>log2FC</span>
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('pValue')}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      <span>p-valor</span>
                    </button>
                  </th>
                  <th className="py-3 px-3 text-center">Detección (Ctrl / HFD)</th>
                  <th className="py-3 px-3">Estado en HFD</th>
                  <th className="py-3 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm" data-testid="comparison-table-body">
                {paginatedTaxa.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-500 text-sm">
                      <div className="space-y-3">
                        <p>No hay bacterias que coincidan con la combinación de filtros seleccionada.</p>
                        <button
                          type="button"
                          onClick={handleResetAllFilters}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Restablecer todos los filtros</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTaxa.map((taxon) => {
                    const status = renderCategoryLabel(taxon.category);
                    const isSelected = selectedTaxonId === taxon.id;

                    return (
                      <tr
                        key={taxon.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-teal-50/40' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{taxon.taxonomy.displayName}</div>
                          <div className="text-xs text-slate-500">
                            {taxon.taxonomy.phylum} · {taxon.taxonomy.taxClass} · {taxon.taxonomy.order}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-700">
                          <div>Fam: {taxon.taxonomy.family}</div>
                          <div className="text-slate-500">Gén: {taxon.taxonomy.genus}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                          {taxon.controlMean.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 font-medium">
                          {taxon.hfdMean.toFixed(2)}%
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono tabular-nums font-medium ${
                            taxon.log2FoldChange > 0.5
                              ? 'text-amber-700'
                              : taxon.log2FoldChange < -0.5
                                ? 'text-teal-700'
                                : 'text-slate-500'
                          }`}
                        >
                          {taxon.log2FoldChange >= 0 ? '+' : ''}
                          {taxon.log2FoldChange.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                          <span className={taxon.pValue < 0.05 ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
                            {taxon.pValue < 0.001 ? '<0.001' : taxon.pValue.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums text-xs text-slate-600">
                          {taxon.controlDetectedCount}/{taxon.controlValues.length} ·{' '}
                          {taxon.hfdDetectedCount}/{taxon.hfdValues.length}
                        </td>
                        <td className="py-3 px-3 text-xs whitespace-nowrap">
                          <span className={status.textClass}>
                            {status.symbol} {status.text}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectTaxon(taxon)}
                            aria-label={`Analizar ${taxon.taxonomy.displayName}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Analizar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-4 text-xs text-slate-600 bg-white">
              <span className="font-mono tabular-nums">
                Página {currentPage} de {totalPages} · Filas {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredTaxa.length)} de {filteredTaxa.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Footer note explaining classification rule */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <ArrowUp className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                Aumenta / Exclusiva en HFD
              </span>
              <span className="inline-flex items-center gap-1">
                <ArrowDown className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                Disminuye / No detectada en HFD
              </span>
              <span className="inline-flex items-center gap-1">
                <Minus className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                Sin cambio marcado
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
              <span>Haga clic en cualquier bacteria para ver funciones, hipótesis y referencias reales de PubMed</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

