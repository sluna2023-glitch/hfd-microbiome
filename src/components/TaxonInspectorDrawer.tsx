import React, { useEffect, useState } from 'react';
import { BookOpen, ExternalLink, Loader2, X } from 'lucide-react';
import type {
  AnalyzedTaxon,
  PubMedArticle,
} from '../types/microbiome';
import { renderCategoryLabel } from './ComparisonView';

interface TaxonInspectorDrawerProps {
  taxon: AnalyzedTaxon | null;
  onClose: () => void;
  onArticlesDiscovered: (articles: PubMedArticle[]) => void;
}

export const TaxonInspectorDrawer: React.FC<TaxonInspectorDrawerProps> = ({
  taxon,
  onClose,
  onArticlesDiscovered,
}) => {
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [loadingPubmed, setLoadingPubmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setArticles([]);
    setErrorMsg(null);
  }, [taxon?.id]);

  if (!taxon) return null;

  const status = renderCategoryLabel(taxon.category);
  const searchTerm =
    taxon.taxonomy.species && !taxon.taxonomy.species.toLowerCase().includes('no identificada')
      ? taxon.taxonomy.species
      : taxon.taxonomy.genus && !taxon.taxonomy.genus.toLowerCase().includes('no identificado')
        ? taxon.taxonomy.genus
        : taxon.taxonomy.family;

  const handleSearchPubMed = async () => {
    setLoadingPubmed(true);
    setErrorMsg(null);
    try {
      const q = `"${searchTerm}"[Title/Abstract] AND ("high-fat diet"[Title/Abstract] OR obesity[Title/Abstract] OR "gut microbiota"[Title/Abstract])`;
      const resp = await fetch(`/api/pubmed/search?q=${encodeURIComponent(q)}&maxResults=5`);
      const data = (await resp.json()) as { articles?: PubMedArticle[]; error?: string };
      if (!resp.ok && (!data.articles || data.articles.length === 0)) {
        throw new Error(data.error || 'Error consultando PubMed.');
      }
      const list = data.articles || [];
      setArticles(list);
      if (list.length > 0) onArticlesDiscovered(list);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No fue posible consultar PubMed.');
    } finally {
      setLoadingPubmed(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-title"
    >
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-slate-500">
              <span>{taxon.taxonomy.phylum}</span>
              <span aria-hidden="true"> · </span>
              <span>Resolución: {taxon.taxonomy.resolutionLevel}</span>
            </div>
            <h2 id="inspector-title" className="text-xl font-bold text-slate-900 mt-0.5">
              {taxon.taxonomy.displayName}
            </h2>
            <p className={`text-xs mt-1 ${status.textClass}`}>
              {status.symbol} {status.text}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de detalle"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Taxonomy Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <div className="text-slate-500">Filo</div>
              <div className="font-semibold text-slate-900 mt-0.5">{taxon.taxonomy.phylum}</div>
            </div>
            <div>
              <div className="text-slate-500">Clase</div>
              <div className="font-semibold text-slate-900 mt-0.5">{taxon.taxonomy.taxClass}</div>
            </div>
            <div>
              <div className="text-slate-500">Orden</div>
              <div className="font-semibold text-slate-900 mt-0.5">{taxon.taxonomy.order}</div>
            </div>
            <div>
              <div className="text-slate-500">Familia</div>
              <div className="font-semibold text-slate-900 mt-0.5">{taxon.taxonomy.family}</div>
            </div>
            <div>
              <div className="text-slate-500">Género</div>
              <div className="font-semibold text-slate-900 mt-0.5">{taxon.taxonomy.genus}</div>
            </div>
            <div>
              <div className="text-slate-500">Especie</div>
              <div className="font-semibold text-slate-900 mt-0.5">{taxon.taxonomy.species}</div>
            </div>
          </div>

          {/* 1. Evidencia comprobada en los datos */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                1. Resultados Comprobados en los Datos
              </h3>
              <span className="text-xs font-mono text-teal-700">Medición directa</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500">Media Control</div>
                <div className="text-lg font-semibold font-mono tabular-nums text-slate-900">
                  {taxon.controlMean.toFixed(2)}%
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  DE ±{taxon.controlSD.toFixed(2)} · Det: {taxon.controlDetectedCount}/{taxon.controlValues.length}
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500">Media HFD</div>
                <div className="text-lg font-semibold font-mono tabular-nums text-slate-900">
                  {taxon.hfdMean.toFixed(2)}%
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  DE ±{taxon.hfdSD.toFixed(2)} · Det: {taxon.hfdDetectedCount}/{taxon.hfdValues.length}
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500">log2 Fold Change</div>
                <div className="text-lg font-semibold font-mono tabular-nums text-slate-900">
                  {taxon.log2FoldChange >= 0 ? '+' : ''}
                  {taxon.log2FoldChange.toFixed(2)}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  FC: {taxon.foldChange !== null ? `${taxon.foldChange.toFixed(2)}x` : 'Solo HFD'}
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500">Significancia</div>
                <div className="text-lg font-semibold font-mono tabular-nums text-slate-900">
                  {taxon.pValue < 0.001 ? '<0.001' : taxon.pValue.toFixed(3)}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  FDR q={taxon.fdrQValue < 0.001 ? '<0.001' : taxon.fdrQValue.toFixed(3)}
                </div>
              </div>
            </div>
          </section>

          {/* 2. Funciones documentadas e hipótesis */}
          <section className="space-y-3 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              2. Funciones Intestinales Documentadas vs. Hipótesis
            </h3>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-900">
                  Metabolismo y Ácidos Grasos de Cadena Corta (AGCC)
                </div>
                <div className="text-xs text-slate-600">
                  AGCC asociados:{' '}
                  <span className="font-medium text-slate-900">
                    {taxon.annotation.scfaRoles.length > 0
                      ? taxon.annotation.scfaRoles.join(' · ')
                      : 'Sin producción relevante de AGCC documentada'}
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  {taxon.annotation.metabolicFunctions.map((fn, i) => (
                    <li key={i}>{fn}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
                <div className="text-xs font-semibold text-slate-900">
                  Barrera Intestinal, Inflamación y Respuesta Inmunológica
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {taxon.annotation.barrierAndImmuneRole}
                </p>
                <p className="text-xs text-slate-500">
                  Tendencia típica descrita en HFD: {taxon.annotation.typicalHfdTrendInLiterature}
                </p>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 space-y-1">
                <div className="text-xs font-semibold text-amber-900">
                  Hipótesis Mecanística (Explicación tentativa sujeta a validación)
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  {taxon.annotation.mechanisticHypothesis}
                </p>
              </div>

              {taxon.annotation.references.length > 0 && (
                <div
                  data-testid="taxon-curated-references"
                  className="bg-white border border-slate-200 rounded-lg p-4 space-y-2"
                >
                  <div className="text-xs font-semibold text-slate-900">
                    Referencias Científicas Verificadas de Respaldo ({taxon.annotation.references.length})
                  </div>
                  <div className="space-y-1.5">
                    {taxon.annotation.references.map((ref) => (
                      <div key={ref.pmid} className="text-xs text-slate-700 leading-snug">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono font-semibold text-teal-800 hover:underline mr-1.5"
                        >
                          <span>PMID: {ref.pmid}</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                        <span>
                          {ref.authors} ({ref.year}) {ref.journal}. «{ref.title}»
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 3. Real PubMed References */}
          <section className="space-y-4 border-t border-slate-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  3. Bibliografía Real en PubMed
                </h3>
                <p className="text-xs text-slate-500">
                  Consulta artículos científicos verificados en tiempo real en NCBI PubMed
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSearchPubMed}
                  disabled={loadingPubmed}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors disabled:opacity-60"
                >
                  {loadingPubmed ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>Buscar en PubMed</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}

            {articles.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-900">
                  Artículos Reales Recuperados de NCBI PubMed ({articles.length})
                </div>
                {articles.map((art) => (
                  <div key={art.pmid} className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-teal-800 hover:underline leading-snug"
                      >
                        {art.title}
                      </a>
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir artículo PMID ${art.pmid} en PubMed`}
                        className="text-slate-500 hover:text-teal-700 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      PMID: {art.pmid} · {art.authors} · {art.journal} ({art.year})
                    </div>
                    {art.abstractSnippet && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">{art.abstractSnippet}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
