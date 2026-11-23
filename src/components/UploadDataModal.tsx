import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileUp, X } from 'lucide-react';
import type { MicrobiomeDataset, ParsedTablePreview } from '../types/microbiome';
import {
  buildDatasetFromMappedTable,
  detectColumnsFromTable,
  parseCsvTextToRows,
} from '../utils/microbiomeAnalyzer';
import { generateCsvTemplateContent } from '../data/sampleDatasets';

interface UploadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: MicrobiomeDataset) => void;
}

export const UploadDataModal: React.FC<UploadDataModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
}) => {
  const [preview, setPreview] = useState<ParsedTablePreview | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [taxonomyCol, setTaxonomyCol] = useState('');
  const [phylumCol, setPhylumCol] = useState('');
  const [classCol, setClassCol] = useState('');
  const [orderCol, setOrderCol] = useState('');
  const [familyCol, setFamilyCol] = useState('');
  const [genusCol, setGenusCol] = useState('');
  const [speciesCol, setSpeciesCol] = useState('');
  const [controlCols, setControlCols] = useState<string[]>([]);
  const [hfdCols, setHfdCols] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyPreview = (parsed: ParsedTablePreview) => {
    setPreview(parsed);
    setDatasetName(parsed.fileName.replace(/\.(csv|tsv|xlsx|xls)$/i, ''));
    setTaxonomyCol(parsed.suggestedTaxonomyCol);
    setPhylumCol(parsed.suggestedPhylumCol);
    setClassCol(parsed.suggestedClassCol);
    setOrderCol(parsed.suggestedOrderCol);
    setFamilyCol(parsed.suggestedFamilyCol);
    setGenusCol(parsed.suggestedGenusCol);
    setSpeciesCol(parsed.suggestedSpeciesCol);
    setControlCols(parsed.suggestedControlCols);
    setHfdCols(parsed.suggestedHfdCols);
    setErrorMsg(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet, {
          defval: '',
        });
        const headers = jsonRows.length > 0 ? Object.keys(jsonRows[0]) : [];
        if (headers.length === 0 || jsonRows.length === 0) {
          throw new Error('La hoja de Excel no contiene filas válidas.');
        }
        applyPreview(detectColumnsFromTable(file.name, headers, jsonRows));
      } else {
        const text = await file.text();
        const { headers, rows } = parseCsvTextToRows(text);
        if (headers.length === 0 || rows.length === 0) {
          throw new Error('El archivo CSV/TSV no contiene encabezados o filas válidas.');
        }
        applyPreview(detectColumnsFromTable(file.name, headers, rows));
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo leer el archivo seleccionado.');
    }
  };

  const toggleSampleCol = (col: string, target: 'control' | 'hfd') => {
    if (target === 'control') {
      setHfdCols((prev) => prev.filter((c) => c !== col));
      setControlCols((prev) =>
        prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
      );
    } else {
      setControlCols((prev) => prev.filter((c) => c !== col));
      setHfdCols((prev) =>
        prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
      );
    }
  };

  const handleDownloadTemplate = () => {
    const csv = generateCsvTemplateContent();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_HFD_microbiome_analyzer.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      setErrorMsg('Seleccione primero un archivo CSV, TSV o Excel.');
      return;
    }
    if (!taxonomyCol && !familyCol && !genusCol && !speciesCol) {
      setErrorMsg('Asigne al menos una columna taxonómica (Taxonomía, Familia, Género o Especie).');
      return;
    }
    if (controlCols.length === 0 || hfdCols.length === 0) {
      setErrorMsg('Debe asignar al menos una columna de muestras para Control y una para HFD.');
      return;
    }

    const built = buildDatasetFromMappedTable({
      datasetName: datasetName.trim() || preview.fileName,
      fileName: preview.fileName,
      rows: preview.rows,
      taxonomyCol,
      phylumCol,
      classCol,
      orderCol,
      familyCol,
      genusCol,
      speciesCol,
      controlCols,
      hfdCols,
    });

    if (built.taxa.length === 0) {
      setErrorMsg('No se encontraron taxones válidos con los campos seleccionados.');
      return;
    }

    onDatasetLoaded(built);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 id="upload-modal-title" className="text-lg font-bold text-slate-900">
              Cargar Resultados Experimentales de Microbiota
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compatible con tablas de abundancia relativa o conteos crudos (.csv, .tsv, .xlsx, .xls)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de carga"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* File Drop & Template */}
          <div className="border border-dashed border-slate-300 bg-slate-50/70 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <label
                htmlFor="microbiome-file-input"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer transition-colors"
              >
                <FileUp className="w-4 h-4" aria-hidden="true" />
                <span>Seleccionar archivo (.csv, .tsv, .xlsx)</span>
              </label>
              <input
                id="microbiome-file-input"
                type="file"
                accept=".csv,.tsv,.txt,.xlsx,.xls"
                onChange={handleFileChange}
                className="sr-only"
              />
              <p className="text-xs text-slate-500">
                {preview
                  ? `Archivo cargado: ${preview.fileName} (${preview.rows.length} filas, ${preview.headers.length} columnas)`
                  : 'Puede subir matrices exportadas de QIIME2, MetaPhlAn, Kraken2 o Excel.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Descargar plantilla CSV</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          {preview && (
            <div className="space-y-5">
              <div>
                <label htmlFor="dataset-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del estudio o experimento
                </label>
                <input
                  id="dataset-name-input"
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                />
              </div>

              {/* Taxonomy Column Mapping */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-900">
                  Mapeo de Columnas Taxonómicas
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'tax-col', label: 'Taxonomía completa / OTU', val: taxonomyCol, set: setTaxonomyCol },
                    { id: 'fil-col', label: 'Columna Filo (opcional)', val: phylumCol, set: setPhylumCol },
                    { id: 'cla-col', label: 'Columna Clase (opcional)', val: classCol, set: setClassCol },
                    { id: 'ord-col', label: 'Columna Orden (opcional)', val: orderCol, set: setOrderCol },
                    { id: 'fam-col', label: 'Columna Familia (opcional)', val: familyCol, set: setFamilyCol },
                    { id: 'gen-col', label: 'Columna Género (opcional)', val: genusCol, set: setGenusCol },
                    { id: 'esp-col', label: 'Columna Especie (opcional)', val: speciesCol, set: setSpeciesCol },
                  ].map((field) => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-[11px] text-slate-600 mb-1">
                        {field.label}
                      </label>
                      <select
                        id={field.id}
                        value={field.val}
                        onChange={(e) => field.set(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                      >
                        <option value="">— No asignar —</option>
                        {preview.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Column Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-teal-800">
                    Muestras Grupo Control ({controlCols.length} seleccionadas)
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {preview.headers.map((col) => (
                      <label key={`ctrl-${col}`} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={controlCols.includes(col)}
                          onChange={() => toggleSampleCol(col, 'control')}
                          className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                        />
                        <span className="truncate">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-amber-800">
                    Muestras Grupo HFD ({hfdCols.length} seleccionadas)
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {preview.headers.map((col) => (
                      <label key={`hfd-${col}`} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hfdCols.includes(col)}
                          onChange={() => toggleSampleCol(col, 'hfd')}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                        />
                        <span className="truncate">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!preview}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg"
            >
              Analizar conjunto de datos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
