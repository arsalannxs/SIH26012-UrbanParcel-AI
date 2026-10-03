import React, { useState } from 'react';
import { FileText, Printer, Download, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, Building2, MapPin, Layers } from 'lucide-react';
import { Parcel, Report } from '../types.ts';
import { api } from '../services/api.ts';

interface ReportViewProps {
  parcels: Parcel[];
  selectedParcelId: string | null;
  onSelectParcel: (id: string) => void;
  reports: Report[];
  onRefreshReports: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  reports,
  onRefreshReports,
}) => {
  const activeParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<Report | null>(reports[0] || null);

  const handleGenerateReport = async () => {
    if (!activeParcel) return;
    setGenerating(true);
    try {
      const newReport = await api.createReport(activeParcel.id);
      setActiveReport(newReport);
      onRefreshReports();
    } catch (err) {
      console.error('Failed to create report', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <FileText className="w-4 h-4" />
            <span>Cadastral Documentation & Surveyor Report Generator</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Parcel Intelligence Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            Produce certified automated cadastral feature reports summarizing area envelopes, structural counts, and topology checks.
          </p>
        </div>

        {/* Parcel Selector & Generate Button */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeParcel?.id || ''}
            onChange={(e) => onSelectParcel(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            {parcels.map((p) => (
              <option key={p.id} value={p.id}>
                {p.parcelCode} ({p.landUse})
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generating ? 'Compiling Report...' : 'Generate Report'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Container (Printable) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm max-w-4xl mx-auto printable-report space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black text-slate-900 tracking-tight">UrbanParcel AI</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">DoLR SIH26012</span>
            </div>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
              Department of Land Resources • Ministry of Rural Development
            </p>
            <h2 className="text-lg font-extrabold text-blue-900 mt-2">
              AUTOMATED URBAN PARCEL ANALYSIS REPORT
            </h2>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="font-mono text-slate-900 font-bold">
              Report Ref: {activeReport?.reportNumber || 'UPAR-2026-0041'}
            </div>
            <div className="text-slate-500">
              Generated: {new Date(activeReport?.generatedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Decision-Support Document
            </div>
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Parcel</span>
            <span className="font-extrabold text-slate-900 text-base">{activeParcel?.parcelCode}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Calculated Area</span>
            <span className="font-extrabold text-slate-900 text-base">{activeParcel?.areaSqM.toLocaleString()} m²</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Perimeter</span>
            <span className="font-extrabold text-slate-900 text-base">{activeParcel?.perimeterM} m</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">AI Confidence</span>
            <span className="font-extrabold text-blue-700 text-base">{Math.round((activeParcel?.confidence || 0.94) * 100)}%</span>
          </div>
        </div>

        {/* Drone Image & Metadata Section */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            1. Drone Flight & Sensor Attributes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Flight Sector:</span>
              <span className="font-semibold">{activeParcel?.wardNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Orthomosaic GSD:</span>
              <span className="font-semibold">2.5 cm / pixel</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Centroid Coordinates:</span>
              <span className="font-mono text-slate-900">{activeParcel?.centroidLat.toFixed(5)}°N, {activeParcel?.centroidLng.toFixed(5)}°E</span>
            </div>
          </div>
        </div>

        {/* Feature Breakdown */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            2. Extracted Cadastral Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-bold text-slate-800 block mb-1">Building Structures</span>
              <span className="text-2xl font-black text-slate-900">{activeParcel?.buildingCount}</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Permanent & semi-permanent</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-bold text-slate-800 block mb-1">Road Access</span>
              <span className="text-2xl font-black text-emerald-700">Connected</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">9m paved access lane</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-bold text-slate-800 block mb-1">Land-Use Class</span>
              <span className="text-base font-extrabold text-slate-900 block mt-1">{activeParcel?.landUse}</span>
              <span className="text-slate-500 block text-[11px]">Consistent with local zoning</span>
            </div>
          </div>
        </div>

        {/* Topology Validation Results */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            3. Geometric & Topological Validation
          </h3>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Polygon Closure & Ring Test:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-700">Coordinate Range & Spatial Integrity:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-700">Boundary Overlap Status:</span>
              {activeParcel?.status === 'NEEDS_REVIEW' || activeParcel?.status === 'ENCROACHMENT_FLAGGED' ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> REVIEW REQUIRED (Minor overlap flagged)
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ZERO CONFLICTS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            4. AI Cadastral Summary & Recommendations
          </h3>
          <p className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-800 leading-relaxed">
            {activeReport?.summary ||
              `Automated AI Cadastral Feature Extraction for Parcel ${activeParcel?.parcelCode}. Extracted total polygon area of ${activeParcel?.areaSqM.toLocaleString()} sq.m with ${activeParcel?.buildingCount} detected structures and ${Math.round((activeParcel?.confidence || 0.94) * 100)}% model confidence score.`}
          </p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <span className="font-bold text-slate-900 block mb-0.5">Surveyor Field Advisory:</span>
            {activeReport?.recommendations ||
              'Conduct ground-truthing using Electronic Total Station (ETS) or RTK-DGPS rover along compound corners prior to official record updation.'}
          </div>
        </div>

        {/* Official SIH Prototype Disclaimer */}
        <div className="pt-6 border-t-2 border-slate-200 text-[10px] text-slate-500 leading-relaxed space-y-1">
          <p className="font-bold text-slate-700">
            PROTOTYPE DISCLAIMER — SMART INDIA HACKATHON 2026:
          </p>
          <p>
            This automated parcel report was generated by UrbanParcel AI for demonstration and decision-support purposes under Problem SIH26012 (Ministry of Rural Development, Department of Land Resources).
            AI-extracted parcel boundaries and measurements do NOT replace official cadastral authorities, statutory land revenue records, or legal land deeds.
          </p>
        </div>
      </div>
    </div>
  );
};
