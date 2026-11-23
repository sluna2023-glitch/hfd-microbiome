import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import type { AnalyzedTaxon, PhylogeneticFilterState } from '../types/microbiome';
import {
  countActivePhylogeneticFilters,
  getCascadingRankOptions,
  PHYLOGENETIC_RANKS,
  type PhylogeneticRankKey,
} from '../utils/phylogeneticFilter';

interface PhylogeneticSidebarProps {
  taxa: AnalyzedTaxon[];
  filteredCount: number;
  filter: PhylogeneticFilterState;
  onSelectRank: (rank: PhylogeneticRankKey, value: string | null) => void;
  onResetFilters: () => void;
}

export const PhylogeneticSidebar: React.FC<PhylogeneticSidebarProps> = ({
  taxa,
  filteredCount,
  filter,
  onSelectRank,
  onResetFilters,
}) => {
  const [rankSearch, setRankSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedRanks, setExpandedRanks] = useState<Record<PhylogeneticRankKey, boolean>>({
    phylum: true,
    taxClass: true,
    order: true,
    family: true,
    genus: true,
  });

  const activeCount = countActivePhylogeneticFilters(filter);
  const rankOptions = useMemo(() => getCascadingRankOptions(taxa, filter), [taxa, filter]);

  const normalizedRankSearch = rankSearch.trim().toLowerCase();

  const toggleRankExpanded = (key: PhylogeneticRankKey) => {
    setExpandedRanks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearAll = () => {
    setRankSearch('');
    onResetFilters();
  };

  const sidebarBody = (
    <div className="divide-y divide-slate-200">
      {/* Header & Count */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="hidden lg:block">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
              <span>Filtros Filogenéticos</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
              {filteredCount} de {taxa.length} taxones
              {activeCount > 0 ? ` · ${activeCount} ${activeCount === 1 ? 'nivel activo' : 'niveles activos'}` : ''}
            </p>
          </div>
          <span className="lg:hidden text-xs text-slate-500 font-mono tabular-nums">
            {filteredCount} de {taxa.length} taxones
          </span>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={activeCount === 0 && rankSearch.trim() === ''}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Limpiar filtros</span>
          </button>
        </div>

        {/* Active Selections Strip */}
        {activeCount > 0 && (
          <div className="space-y-1.5 pt-1" aria-label="Niveles seleccionados actualmente">
            <div className="text-[11px] font-medium text-slate-500">Selección activa</div>
            <div className="flex flex-wrap gap-1.5">
              {PHYLOGENETIC_RANKS.map((rank) => {
                const selectedVal = filter[rank.key];
                if (!selectedVal) return null;
                return (
                  <button
                    key={rank.key}
                    type="button"
                    onClick={() => onSelectRank(rank.key, null)}
                    aria-label={`Quitar filtro de ${rank.shortLabel}: ${selectedVal}`}
                    className="inline-flex items-center gap-1.5 max-w-full px-2 py-1 text-xs font-medium bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 rounded-md transition-colors"
                  >
                    <span className="text-teal-700 shrink-0">{rank.shortLabel}:</span>
                    <span className="truncate">{selectedVal}</span>
                    <X className="w-3 h-3 shrink-0 text-teal-700" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Search within Phylogenetic Ranks */}
        <div className="relative">
          <Search
            className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={rankSearch}
            onChange={(e) => setRankSearch(e.target.value)}
            placeholder="Filtrar filo, clase, orden..."
            aria-label="Filtrar opciones filogenéticas por nombre"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          />
        </div>
      </div>

      {/* Cascading 5-Level Phylogenetic Accordion Lists */}
      <div className="divide-y divide-slate-100">
        {PHYLOGENETIC_RANKS.map((rank) => {
          const allOptions = rankOptions[rank.key];
          const selectedValue = filter[rank.key];
          const matchingOptions = normalizedRankSearch
            ? allOptions.filter((opt) => opt.value.toLowerCase().includes(normalizedRankSearch))
            : allOptions;
          const isOpen = expandedRanks[rank.key] || Boolean(normalizedRankSearch);

          return (
            <section key={rank.key} aria-labelledby={`rank-heading-${rank.key}`} className="py-2.5 px-3">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  id={`rank-heading-${rank.key}`}
                  aria-expanded={isOpen}
                  onClick={() => toggleRankExpanded(rank.key)}
                  className="flex-1 flex items-center justify-between gap-2 py-1 px-1 text-left rounded hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    )}
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {rank.label}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                    {matchingOptions.length}
                  </span>
                </button>

                {selectedValue !== null && (
                  <button
                    type="button"
                    onClick={() => onSelectRank(rank.key, null)}
                    aria-label={`Restablecer ${rank.shortLabel}`}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 shrink-0"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              {isOpen && (
                <div
                  className="mt-1.5 max-h-40 overflow-y-auto space-y-0.5 pr-0.5"
                  role="group"
                  aria-label={`Opciones de ${rank.label}`}
                >
                  {matchingOptions.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-slate-400">
                      Sin coincidencias en este nivel
                    </div>
                  ) : (
                    matchingOptions.map((opt) => {
                      const isSelected = selectedValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => onSelectRank(rank.key, opt.value)}
                          className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                            isSelected
                              ? 'bg-teal-700 text-white font-medium'
                              : opt.isUnclassified
                                ? 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate" title={opt.value}>
                            {opt.value}
                          </span>
                          <span
                            className={`font-mono tabular-nums text-[11px] shrink-0 ${
                              isSelected ? 'text-teal-100' : 'text-slate-400'
                            }`}
                          >
                            {opt.count}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside aria-label="Filtros filogenéticos" className="lg:sticky lg:top-6">
      {/* Mobile / Tablet Collapsible Header */}
      <div className="lg:hidden bg-white border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <SlidersHorizontal className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
            <span>Filtros Filogenéticos</span>
          </span>
          <span className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600">
            <span>
              {filteredCount}/{taxa.length}
              {activeCount > 0 ? ` · ${activeCount} activos` : ''}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </span>
        </button>
        {mobileOpen && <div className="border-t border-slate-200">{sidebarBody}</div>}
      </div>

      {/* Desktop Always-Visible Sidebar */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-y-auto lg:max-h-[calc(100vh-2rem)]">
        {sidebarBody}
      </div>
    </aside>
  );
};
