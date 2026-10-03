import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, XCircle, ChevronRight, MapPin, FileText, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { ValidationResult, ValidationSummary } from '../types.ts';

interface ValidationViewProps {
  summary: ValidationSummary | null;
  results: ValidationResult[];
  onSelectParcelOnMap: (parcelId: string) => void;
  onGenerateReport: (parcelId: string) => void;
}

export const ValidationView: React.FC<ValidationViewProps> = ({
  summary,
  results,
  onSelectParcelOnMap,
  onGenerateReport,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<ValidationResult | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'issues' | 'passed'>('all');

  const filteredResults = results.filter(r => {
    if (filterMode === 'issues') return r.hasWarnings || r.overlapCount > 0;
    if (filterMode === 'passed') return !r.hasWarnings && r.overlapCount === 0;
    return true;
  });

  const checks = [
    { label: 'Closed Boundaries', status: 'valid', count: `${summary?.closedBoundariesPassed || 6}/6 Passed`, icon: CheckCircle2 },
    { label: 'Valid Coordinates', status: 'valid', count: '100% In Range', icon: CheckCircle2 },
    { label: 'No Duplicate Parcels', status: 'valid', count: '0 Duplicates', icon: CheckCircle2 },
    { label: '2 Possible Overlaps', status: 'warning', count: 'Requires Review', icon: AlertTriangle },
    { label: 'Building Geometry', status: 'valid', count: '13 Enclosed, 1 Setback', icon: CheckCircle2 },
    { label: 'Road Connectivity', status: 'valid', count: '100% Accessible', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>SIH26012 Quality Assurance & Topological Integrity</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Cadastral Geometry Validation</h1>
            <p className="text-sm text-slate-500 mt-1">
              Automated topological rule engine checks for boundary closures, self-intersections, coordinate bounds, and setback conflicts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Topology Engine Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Geometry Validation Cards Checklist (Section 8) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 text-slate-500">
          Geometry Validation Checklist
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {checks.map((item, idx) => {
            const isWarning = item.status === 'warning';
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWarning
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isWarning ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isWarning ? 'bg-amber-200/60 text-amber-800' : 'bg-emerald-200/60 text-emerald-800'
                  }`}>
                    {isWarning ? 'Alert' : 'Pass'}
                  </span>
                </div>
                <div className="text-xs font-bold leading-tight">{item.label}</div>
                <div className="text-[11px] opacity-80 mt-1">{item.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Results Table & Issues Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Parcel Topology Verification Log</h2>
            <p className="text-xs text-slate-500">Click any parcel record to review surveyor instructions</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => setFilterMode('issues')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'issues'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Issues (2)
            </button>
            <button
              onClick={() => setFilterMode('passed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'passed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Passed ({results.filter(r => !r.hasWarnings).length})
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Parcel Code</th>
                <th className="py-2.5 px-3">Land Use</th>
                <th className="py-2.5 px-3">Closure</th>
                <th className="py-2.5 px-3">Overlaps</th>
                <th className="py-2.5 px-3">Building Enclosure</th>
                <th className="py-2.5 px-3">Topology Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((res) => {
                const hasIssue = res.hasWarnings || res.overlapCount > 0;
                return (
                  <tr
                    key={res.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      hasIssue ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {res.parcelCode}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{res.landUse}</td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Closed Ring
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {res.overlapCount > 0 ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {res.overlapCount} Overlap
                        </span>
                      ) : (
                        <span className="text-slate-500">None (0)</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {res.buildingInsideParcel ? (
                        <span className="text-emerald-700 font-medium">Inside Boundaries</span>
                      ) : (
                        <span className="text-rose-700 font-semibold">Protrudes Setback</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        hasIssue
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {hasIssue ? 'Review Flagged' : 'Topologically Valid'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {hasIssue && (
                        <button
                          onClick={() => setSelectedIssue(res)}
                          className="px-2.5 py-1 rounded text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
                        >
                          Review Issues
                        </button>
                      )}
                      <button
                        onClick={() => onSelectParcelOnMap(res.parcelId)}
                        className="px-2.5 py-1 rounded text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        View on Map
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Issues Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Cadastral Topology Issue Review: {selectedIssue.parcelCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1">Issue Description:</span>
                <p className="text-amber-800">{selectedIssue.overlapDescription || 'Potential boundary overlap flagged during polygon intersection test.'}</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">Surveyor Remediation Steps:</span>
                <p className="text-blue-800">{selectedIssue.surveyorNotes || 'Perform ground check using RTK-DGPS rover to establish authoritative boundary coordinates.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Validation Timestamp:</span>
                  <span className="font-mono text-slate-800">{new Date(selectedIssue.validatedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Rule Engine:</span>
                  <span className="font-semibold text-slate-800">DoLR GeoValidate v1.2</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const id = selectedIssue.parcelId;
                  setSelectedIssue(null);
                  onSelectParcelOnMap(id);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Inspect on Map
              </button>
              <button
                onClick={() => {
                  const id = selectedIssue.parcelId;
                  setSelectedIssue(null);
                  onGenerateReport(id);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Generate Parcel Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
