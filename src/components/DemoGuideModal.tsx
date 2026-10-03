import React from 'react';
import { Play, CheckCircle2, ArrowRight, X, Sparkles, Compass, MapPin, Building2, ShieldCheck, FileText } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, arg?: string) => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const demoSteps = [
    {
      step: '1',
      title: 'Open Dashboard',
      desc: 'View aggregate DoLR cadastral statistics, images processed, and system overview.',
      tab: 'dashboard',
      icon: '📊',
    },
    {
      step: '2',
      title: 'Select Drone Image & Start Analysis',
      desc: 'Inspect Sector 4-B 2.5cm GSD aerial orthomosaic and trigger AI feature extraction.',
      tab: 'drone-analysis',
      icon: '📸',
    },
    {
      step: '3',
      title: 'Inspect Extracted Features',
      desc: 'Toggle vector overlays: parcel boundaries (blue), buildings (red), roads (yellow), and open areas (green).',
      tab: 'features',
      icon: '📐',
    },
    {
      step: '4',
      title: 'Interactive 2D Parcel Map',
      desc: 'Click on Parcel UP-MH-00124 to inspect area (1,842 sq.m), building footprints, and road frontage.',
      tab: 'parcel-map',
      icon: '🗺️',
    },
    {
      step: '5',
      title: 'Run Geometry Validation',
      desc: 'Verify polygon closure, coordinate validity, and inspect the flagged minor boundary overlap.',
      tab: 'validation',
      icon: '✅',
    },
    {
      step: '6',
      title: 'Generate Official Parcel Report',
      desc: 'Create an automated cadastral summary document ready for print or surveyor audit.',
      tab: 'reports',
      icon: '📄',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Smart India Hackathon 2026 Demo Walkthrough</h2>
              <p className="text-xs text-slate-500">6-Step Guided Demonstration for SIH Evaluators & Judges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {demoSteps.map((s) => (
            <div
              key={s.step}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-sm font-bold text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{s.icon}</span>
                    <span>{s.title}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onNavigate(s.tab);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-white border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 flex items-center gap-1 shadow-2xs"
              >
                <span>Jump</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
          <strong>SIH Evaluator Note:</strong> All sample orthomosaics and extracted polygon vectors run deterministically in SIH Demo Mode without external dependencies. Server-side Gemini AI generates intelligent cadastral explanations when an API key is attached.
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              onClose();
              onNavigate('drone-analysis');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>Start Live Walkthrough</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
