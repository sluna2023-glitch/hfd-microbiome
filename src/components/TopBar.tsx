import React from 'react';
import { Upload } from 'lucide-react';

export type AppSection = 'comparacion' | 'metabolismo' | 'inflamacion' | 'bibliografia';

interface TopBarProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  onOpenUpload: () => void;
}

const NAV_ITEMS: Array<{ id: AppSection; label: string }> = [
  { id: 'comparacion', label: 'Comparación' },
  { id: 'metabolismo', label: 'Metabolismo' },
  { id: 'inflamacion', label: 'Inflamación' },
  { id: 'bibliografia', label: 'PubMed' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onSelectSection,
  onOpenUpload,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectSection('comparacion')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
        >
          HFD microbioma
        </button>

        <nav
          aria-label="Secciones principales"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`py-2 border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  isActive
                    ? 'border-teal-700 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Cargar datos</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden flex items-center gap-4 px-4 pb-2.5 overflow-x-auto border-t border-slate-100 text-xs font-medium"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`py-1.5 border-b-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-teal-700 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
