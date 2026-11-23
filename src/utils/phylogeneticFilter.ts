import type { AnalyzedTaxon, PhylogeneticFilterState } from '../types/microbiome';

export type PhylogeneticRankKey = keyof PhylogeneticFilterState;

export interface PhylogeneticRankConfig {
  key: PhylogeneticRankKey;
  label: string;
  shortLabel: string;
}

export interface PhylogeneticRankOption {
  value: string;
  count: number;
  isUnclassified: boolean;
}

export const PHYLOGENETIC_RANKS: PhylogeneticRankConfig[] = [
  { key: 'phylum', label: 'Filo (Phylum)', shortLabel: 'Filo' },
  { key: 'taxClass', label: 'Clase (Class)', shortLabel: 'Clase' },
  { key: 'order', label: 'Orden (Order)', shortLabel: 'Orden' },
  { key: 'family', label: 'Familia (Family)', shortLabel: 'Familia' },
  { key: 'genus', label: 'Género (Genus)', shortLabel: 'Género' },
];

export const EMPTY_PHYLOGENETIC_FILTER: PhylogeneticFilterState = {
  phylum: null,
  taxClass: null,
  order: null,
  family: null,
  genus: null,
};

const UNCLASSIFIED_VALUES = new Set([
  'no especificado',
  'no especificada',
  'no identificado',
  'no identificada',
  'sin clasificar',
  'unclassified',
]);

export function isUnclassifiedRankValue(val: string): boolean {
  return UNCLASSIFIED_VALUES.has(val.trim().toLowerCase());
}

export function countActivePhylogeneticFilters(filter: PhylogeneticFilterState): number {
  return PHYLOGENETIC_RANKS.reduce(
    (count, rank) => (filter[rank.key] !== null ? count + 1 : count),
    0
  );
}

export function matchesPhylogeneticFilter(
  taxon: AnalyzedTaxon,
  filter: Partial<PhylogeneticFilterState>
): boolean {
  if (filter.phylum && taxon.taxonomy.phylum !== filter.phylum) return false;
  if (filter.taxClass && taxon.taxonomy.taxClass !== filter.taxClass) return false;
  if (filter.order && taxon.taxonomy.order !== filter.order) return false;
  if (filter.family && taxon.taxonomy.family !== filter.family) return false;
  if (filter.genus && taxon.taxonomy.genus !== filter.genus) return false;
  return true;
}

export function filterTaxaByPhylogeny(
  taxa: AnalyzedTaxon[],
  filter: PhylogeneticFilterState
): AnalyzedTaxon[] {
  if (countActivePhylogeneticFilters(filter) === 0) return taxa;
  return taxa.filter((taxon) => matchesPhylogeneticFilter(taxon, filter));
}

export function getCascadingRankOptions(
  taxa: AnalyzedTaxon[],
  filter: PhylogeneticFilterState
): Record<PhylogeneticRankKey, PhylogeneticRankOption[]> {
  const result = {} as Record<PhylogeneticRankKey, PhylogeneticRankOption[]>;

  PHYLOGENETIC_RANKS.forEach((rank, idx) => {
    // Options at rank `idx` are constrained by all active parent ranks `< idx`
    const parentFilter: Partial<PhylogeneticFilterState> = {};
    for (let p = 0; p < idx; p++) {
      const parentKey = PHYLOGENETIC_RANKS[p].key;
      const parentVal = filter[parentKey];
      if (parentVal !== null) {
        parentFilter[parentKey] = parentVal;
      }
    }

    const scopedTaxa = taxa.filter((t) => matchesPhylogeneticFilter(t, parentFilter));
    const counts = new Map<string, number>();

    for (const taxon of scopedTaxa) {
      const val = taxon.taxonomy[rank.key];
      if (!val) continue;
      counts.set(val, (counts.get(val) ?? 0) + 1);
    }

    const options: PhylogeneticRankOption[] = Array.from(counts.entries())
      .map(([value, count]) => ({
        value,
        count,
        isUnclassified: isUnclassifiedRankValue(value),
      }))
      .sort((a, b) => {
        if (a.isUnclassified !== b.isUnclassified) {
          return a.isUnclassified ? 1 : -1;
        }
        if (b.count !== a.count) return b.count - a.count;
        return a.value.localeCompare(b.value, 'es');
      });

    result[rank.key] = options;
  });

  return result;
}

export function selectPhylogeneticRank(
  taxa: AnalyzedTaxon[],
  currentFilter: PhylogeneticFilterState,
  rank: PhylogeneticRankKey,
  value: string | null
): PhylogeneticFilterState {
  const nextVal = currentFilter[rank] === value ? null : value;
  const nextFilter: PhylogeneticFilterState = {
    ...currentFilter,
    [rank]: nextVal,
  };

  // Reconcile descendant ranks so no impossible child selection remains active
  const changedIdx = PHYLOGENETIC_RANKS.findIndex((r) => r.key === rank);
  const optionsAfterChange = getCascadingRankOptions(taxa, nextFilter);

  for (let i = changedIdx + 1; i < PHYLOGENETIC_RANKS.length; i++) {
    const childKey = PHYLOGENETIC_RANKS[i].key;
    const childSelected = nextFilter[childKey];
    if (childSelected !== null) {
      const stillValid = optionsAfterChange[childKey].some((opt) => opt.value === childSelected);
      if (!stillValid) {
        nextFilter[childKey] = null;
      }
    }
  }

  return nextFilter;
}
