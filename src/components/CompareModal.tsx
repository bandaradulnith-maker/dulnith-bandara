import React, { useState } from 'react';
import {
  X,
  Scale,
  Sparkles,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Species } from '../types/biodiversity';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesList: Species[];
  initialSpeciesA?: Species | null;
  initialSpeciesB?: Species | null;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  speciesList,
  initialSpeciesA,
  initialSpeciesB,
}) => {
  if (!isOpen) return null;

  const [speciesAId, setSpeciesAId] = useState<string>(
    initialSpeciesA?.id || speciesList[0]?.id || ''
  );
  const [speciesBId, setSpeciesBId] = useState<string>(
    initialSpeciesB?.id || speciesList[1]?.id || ''
  );
  const [customBName, setCustomBName] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedA = speciesList.find((s) => s.id === speciesAId) || speciesList[0];
  const selectedB = speciesList.find((s) => s.id === speciesBId);

  const runComparison = async () => {
    setIsComparing(true);
    setError(null);
    try {
      const nameA = selectedA?.scientificName || 'Species A';
      const nameB = customBName || selectedB?.scientificName || 'Related Taxon';

      const res = await fetch('/api/compare-species', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speciesA: nameA, speciesB: nameB }),
      });

      if (!res.ok) throw new Error('Failed to fetch comparison analysis.');

      const data = await res.json();
      setComparisonData(data);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err.message || 'Unable to compare species.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Side-by-Side Species Comparison
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Diagnostic Key Matrix & Observable Distinctions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Selectors */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Primary Specimen (A)
              </label>
              <select
                value={speciesAId}
                onChange={(e) => setSpeciesAId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600"
              >
                {speciesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonNames.en} ({s.scientificName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Candidate to Compare (B)
              </label>
              <select
                value={speciesBId}
                onChange={(e) => {
                  setSpeciesBId(e.target.value);
                  setCustomBName('');
                }}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600"
              >
                {speciesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonNames.en} ({s.scientificName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={runComparison}
            disabled={isComparing}
            className="w-full bg-emerald-800 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            {isComparing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Diagnostic Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Run Diagnostic Comparison</span>
              </>
            )}
          </button>

          {/* Comparison Results */}
          {comparisonData && (
            <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950">
                <span className="font-bold block mb-0.5">Field Diagnostic Summary:</span>
                <p className="leading-relaxed">{comparisonData.summary || 'Side-by-side key characteristics generated below.'}</p>
              </div>

              {/* Observable Photographic Keys */}
              {comparisonData.photographicKeys && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Observable in Photographs (Field Keys):</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                    {comparisonData.photographicKeys.map((k: string, i: number) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comparison Aspect Rows */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Detailed Feature Breakdown
                </span>
                {comparisonData.comparisons?.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-bold text-slate-900">{c.aspect}</span>
                      {c.significance && (
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          {c.significance}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <strong className="text-slate-800 block mb-0.5 truncate">
                          {comparisonData.speciesA}:
                        </strong>
                        <p className="text-slate-600">{c.speciesAValue}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <strong className="text-slate-800 block mb-0.5 truncate">
                          {comparisonData.speciesB}:
                        </strong>
                        <p className="text-slate-600">{c.speciesBValue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
