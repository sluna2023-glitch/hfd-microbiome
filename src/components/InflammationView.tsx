import React, { useMemo } from 'react';
import { ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { AnalyzedTaxon, MicrobiomeDataset } from '../types/microbiome';
import { renderCategoryLabel } from './ComparisonView';

interface InflammationViewProps {
  dataset: MicrobiomeDataset;
  onSelectTaxon: (taxon: AnalyzedTaxon) => void;
}

export const InflammationView: React.FC<InflammationViewProps> = ({
  dataset,
  onSelectTaxon,
}) => {
  const grouped = useMemo(() => {
    const anti = dataset.taxa.filter((t) => t.annotation.inflammationTendency === 'antiinflamatoria');
    const pro = dataset.taxa.filter((t) => t.annotation.inflammationTendency === 'proinflamatoria');
    const ctx = dataset.taxa.filter((t) => t.annotation.inflammationTendency === 'dependiente_contexto');

    const sumGroup = (list: AnalyzedTaxon[]) => ({
      list,
      controlSum: list.reduce((a, b) => a + b.controlMean, 0),
      hfdSum: list.reduce((a, b) => a + b.hfdMean, 0),
    });

    return {
      anti: sumGroup(anti),
      pro: sumGroup(pro),
      ctx: sumGroup(ctx),
    };
  }, [dataset.taxa]);

  const axes = [
    {
      title: '1. Eje Dieta Alta en Grasas → Disbiosis y Pérdida de Barrera Mucosa',
      observedEvidence: `En el conjunto activo, la abundancia acumulada de taxones con perfil antiinflamatorio/protector de barrera pasa de ${grouped.anti.controlSum.toFixed(1)}% en Control a ${grouped.anti.hfdSum.toFixed(1)}% en HFD.`,
      mechanism:
        'La reducción de especies degradadoras de mucina benéficas (p. ej. Akkermansia) y productoras de butirato (Roseburia, Faecalibacterium, Lachnospiraceae) se asocia con adelgazamiento de la capa de moco y menor expresión de proteínas de unión estrecha (ZO-1, ocludina).',
      hypothesis:
        'Hipótesis: El compromiso de la barrera epitelial incrementa la permeabilidad paracelular y facilita la translocación de fragmentos bacterianos.',
      references: [
        { pmid: '23671105', label: 'Everard A et al. (2013) PNAS · PMID 23671105' },
        { pmid: '35641786', label: 'Cani PD et al. (2022) Nat Rev Gastroenterol Hepatol · PMID 35641786' },
      ],
    },
    {
      title: '2. Endotoxemia Metabólica (LPS) y Activación TLR4 / NF-κB',
      observedEvidence: `Los taxones asociados a potencial proinflamatorio o producción de H₂S/LPS cambian de ${grouped.pro.controlSum.toFixed(1)}% en Control a ${grouped.pro.hfdSum.toFixed(1)}% en HFD.`,
      mechanism:
        'Las bacterias Gram-negativas (Desulfovibrio, Bilophila, Enterobacteriaceae) aportan lipopolisacárido (LPS) y sulfuro de hidrógeno (H₂S). El LPS circulante se une al complejo CD14/TLR4 en macrófagos intestinales, hepáticos y adiposos.',
      hypothesis:
        'Hipótesis: La activación sostenida de NF-κB eleva citocinas proinflamatorias (TNF-α, IL-1β, IL-6), impulsando inflamación crónica de bajo grado y resistencia periférica a la insulina.',
      references: [
        { pmid: '17456850', label: 'Cani PD et al. (2007) Diabetes · PMID 17456850' },
        { pmid: '22722865', label: 'Devkota S et al. (2012) Nature · PMID 22722865' },
        { pmid: '33505393', label: 'Mohammad S et al. (2020) Front Immunol · PMID 33505393' },
      ],
    },
    {
      title: '3. Desequilibrio Inmunológico Mucoso (Células Treg / IL-10 frente a Th17)',
      observedEvidence: `Las variaciones en taxones dependientes de contexto suman ${grouped.ctx.controlSum.toFixed(1)}% en Control frente a ${grouped.ctx.hfdSum.toFixed(1)}% en HFD.`,
      mechanism:
        'Los ácidos grasos de cadena corta (especialmente butirato y propionato) promueven la diferenciación de linfocitos T reguladores (Foxp3+ Treg) y la producción de IL-10 e IgA secretora.',
      hypothesis:
        'Hipótesis: La caída de metabolitos fermentativos bajo HFD desplaza la respuesta inmune de la lámina propia hacia un perfil proinflamatorio que retroalimenta la adiposidad visceral.',
      references: [
        { pmid: '24226770', label: 'Furusawa Y et al. (2013) Nature · PMID 24226770' },
        { pmid: '23828891', label: 'Smith PM et al. (2013) Science · PMID 23828891' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
        <h2 className="text-lg font-bold text-slate-900">
          Relación entre Microbiota, Obesidad, Inflamación Intestinal e Inmunología
        </h2>
        <p className="text-sm text-slate-600 max-w-4xl">
          Integración de los cambios observados en <span className="font-medium text-slate-900">{dataset.name}</span> con las vías inmunometabólicas descritas en ratones bajo dieta alta en grasas. Se separan explícitamente los valores medidos de las hipótesis biológicas.
        </p>
      </div>

      {/* Anti-inflammatory vs Pro-inflammatory balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" aria-hidden="true" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Taxones Asociados a Homeostasis y Perfil Antiinflamatorio
                </h3>
                <p className="text-xs text-slate-500">
                  Control: {grouped.anti.controlSum.toFixed(1)}% · HFD: {grouped.anti.hfdSum.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {grouped.anti.list.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                No se detectaron taxones catalogados en esta categoría dentro del conjunto actual.
              </p>
            ) : (
              grouped.anti.list.map((taxon) => {
                const status = renderCategoryLabel(taxon.category);
                return (
                  <button
                    key={taxon.id}
                    type="button"
                    onClick={() => onSelectTaxon(taxon)}
                    className="w-full py-3 text-left hover:bg-slate-50 px-2 rounded transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{taxon.taxonomy.displayName}</div>
                      <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {taxon.annotation.barrierAndImmuneRole}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono tabular-nums text-slate-800">
                        {taxon.controlMean.toFixed(1)}% → {taxon.hfdMean.toFixed(1)}%
                      </div>
                      <div className={`text-[11px] ${status.textClass}`}>
                        {status.symbol} {status.text}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700" aria-hidden="true" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Taxones Asociados a Respuesta Proinflamatoria / Estrés de Barrera
                </h3>
                <p className="text-xs text-slate-500">
                  Control: {grouped.pro.controlSum.toFixed(1)}% · HFD: {grouped.pro.hfdSum.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {grouped.pro.list.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                No se detectaron taxones catalogados en esta categoría dentro del conjunto actual.
              </p>
            ) : (
              grouped.pro.list.map((taxon) => {
                const status = renderCategoryLabel(taxon.category);
                return (
                  <button
                    key={taxon.id}
                    type="button"
                    onClick={() => onSelectTaxon(taxon)}
                    className="w-full py-3 text-left hover:bg-slate-50 px-2 rounded transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{taxon.taxonomy.displayName}</div>
                      <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {taxon.annotation.barrierAndImmuneRole}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono tabular-nums text-slate-800">
                        {taxon.controlMean.toFixed(1)}% → {taxon.hfdMean.toFixed(1)}%
                      </div>
                      <div className={`text-[11px] ${status.textClass}`}>
                        {status.symbol} {status.text}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mechanistic Axes: Evidence vs Mechanism vs Hypothesis */}
      <section aria-labelledby="immune-axes-heading" className="space-y-4">
        <h3 id="immune-axes-heading" className="text-base font-semibold text-slate-900">
          Ejes Obesidad — Inflamación Intestinal — Respuesta Inmunológica
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {axes.map((axis) => (
            <div key={axis.title} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-slate-900">{axis.title}</h4>
                <div className="text-xs bg-teal-50/70 border border-teal-200/80 rounded-lg p-3 text-teal-950">
                  <span className="font-semibold">Comprobado en los datos: </span>
                  {axis.observedEvidence}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Mecanismo documentado: </span>
                  {axis.mechanism}
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-xs bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-amber-900">
                  {axis.hypothesis}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-teal-800 pt-1">
                  {axis.references.map((ref) => (
                    <a
                      key={ref.pmid}
                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      <span>{ref.label}</span>
                      <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
