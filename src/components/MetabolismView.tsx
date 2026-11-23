import React, { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { METABOLIC_PATHWAYS } from '../data/bacteriaKnowledgeBase';
import type { AnalyzedTaxon, MicrobiomeDataset } from '../types/microbiome';
import { renderCategoryLabel } from './ComparisonView';

interface MetabolismViewProps {
  dataset: MicrobiomeDataset;
  onSelectTaxon: (taxon: AnalyzedTaxon) => void;
}

export const MetabolismView: React.FC<MetabolismViewProps> = ({ dataset, onSelectTaxon }) => {
  const scfaStats = useMemo(() => {
    const computePool = (role: 'butirato' | 'propionato' | 'acetato') => {
      const matching = dataset.taxa.filter((t) => t.annotation.scfaRoles.includes(role));
      const controlSum = matching.reduce((acc, t) => acc + t.controlMean, 0);
      const hfdSum = matching.reduce((acc, t) => acc + t.hfdMean, 0);
      return { role, matching, controlSum, hfdSum };
    };
    return [computePool('butirato'), computePool('propionato'), computePool('acetato')];
  }, [dataset.taxa]);

  const cataloguedTaxa = useMemo(
    () => dataset.taxa.filter((t) => t.annotation.isCatalogued),
    [dataset.taxa]
  );

  return (
    <div className="space-y-6">
      {/* Intro & Evidence vs Hypothesis Note */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
        <h2 className="text-lg font-bold text-slate-900">
          Análisis Funcional y Metabolismo Microbiano Intestinal
        </h2>
        <p className="text-sm text-slate-600 max-w-4xl">
          Evaluación de las capacidades metabólicas asociadas a los taxones identificados en{' '}
          <span className="font-medium text-slate-900">{dataset.name}</span>. Las cifras porcentuales provienen directamente de la abundancia relativa medida; las funciones metabólicas representan roles documentados para esos géneros o especies en la literatura científica y deben validarse mediante metabolómica o metagenómica funcional.
        </p>
      </div>

      {/* SCFA Aggregate Pool Comparison */}
      <section aria-labelledby="scfa-heading" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <h3 id="scfa-heading" className="sr-only">
          Balance agregado de taxones productores de ácidos grasos de cadena corta
        </h3>
        {scfaStats.map((pool) => {
          const delta = pool.hfdSum - pool.controlSum;
          const labelMap = {
            butirato: 'Productores de Butirato',
            propionato: 'Productores de Propionato',
            acetato: 'Productores de Acetato',
          };
          const maxBar = Math.max(10, pool.controlSum, pool.hfdSum);
          return (
            <div key={pool.role} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">{labelMap[pool.role]}</div>
                <span className="text-xs font-mono text-slate-500">
                  {pool.matching.length} taxones
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Control (media acumulada)</span>
                    <span className="font-mono tabular-nums font-medium text-teal-800">
                      {pool.controlSum.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-teal-700"
                      style={{ width: `${(pool.controlSum / maxBar) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">HFD (media acumulada)</span>
                    <span className="font-mono tabular-nums font-medium text-amber-700">
                      {pool.hfdSum.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${(pool.hfdSum / maxBar) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div
                  className={`text-xs font-mono tabular-nums ${
                    delta < 0 ? 'text-amber-700' : 'text-teal-700'
                  }`}
                >
                  {delta >= 0 ? '▲ +' : '▼ '}
                  {delta.toFixed(1)} puntos porcentuales en HFD
                </div>
                {pool.matching.length > 0 && (
                  <div className="text-[11px] text-slate-500 truncate" title={pool.matching.map((m) => m.taxonomy.displayName).join(', ')}>
                    Incluye: {pool.matching.slice(0, 3).map((m) => m.taxonomy.displayName).join(', ')}
                    {pool.matching.length > 3 ? ` (+${pool.matching.length - 3})` : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Pathway Reference Cards */}
      <section aria-labelledby="pathways-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <h3 id="pathways-heading" className="sr-only">
          Rutas metabólicas intestinales afectadas por dieta alta en grasas
        </h3>
        {METABOLIC_PATHWAYS.map((pathway) => (
          <div key={pathway.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div>
              <div className="text-xs font-medium text-teal-700">{pathway.subtitle}</div>
              <h4 className="text-base font-semibold text-slate-900 mt-0.5">{pathway.name}</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{pathway.description}</p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Evidencia general en modelos HFD: </span>
              {pathway.hfdImpactSummary}
            </div>
            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
              {pathway.hypothesisNote}
            </div>
            {pathway.references.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Respaldo PubMed:</span>
                {pathway.references.map((ref) => (
                  <a
                    key={ref.pmid}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-teal-800 hover:underline"
                    title={`${ref.authors} (${ref.year}) ${ref.journal}: ${ref.title}`}
                  >
                    <span>
                      {ref.authors.replace(' et al.', '')} ({ref.year}) · PMID {ref.pmid}
                    </span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Per-Taxon Metabolic Function Table */}
      <section aria-labelledby="taxon-metabolic-table" className="bg-white border border-slate-200 rounded-xl">
        <div className="p-5 border-b border-slate-200">
          <h3 id="taxon-metabolic-table" className="text-base font-semibold text-slate-900">
            Mapa Funcional por Bacteria Identificada
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Seleccione cualquier fila para inspeccionar su evidencia estadística, hipótesis mecanística y artículos de PubMed
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Bacteria / Taxón</th>
                <th className="py-3 px-3">Cambio en tus datos</th>
                <th className="py-3 px-3">AGCC producidos</th>
                <th className="py-3 px-4">Funciones metabólicas documentadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(cataloguedTaxa.length > 0 ? cataloguedTaxa : dataset.taxa).map((taxon) => {
                const status = renderCategoryLabel(taxon.category);
                return (
                  <tr
                    key={taxon.id}
                    onClick={() => onSelectTaxon(taxon)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{taxon.taxonomy.displayName}</div>
                      <div className="text-[11px] text-slate-500">
                        Ctrl {taxon.controlMean.toFixed(1)}% → HFD {taxon.hfdMean.toFixed(1)}%
                      </div>
                    </td>
                    <td className={`py-3 px-3 whitespace-nowrap ${status.textClass}`}>
                      {status.symbol} {status.text}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {taxon.annotation.scfaRoles.length > 0
                        ? taxon.annotation.scfaRoles.join(', ')
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed max-w-xl">
                      <div>{taxon.annotation.metabolicFunctions.join(' · ')}</div>
                      {taxon.annotation.references.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-mono text-teal-800">
                          {taxon.annotation.references.map((ref) => (
                            <a
                              key={ref.pmid}
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              <span>PMID: {ref.pmid} ({ref.year})</span>
                              <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
