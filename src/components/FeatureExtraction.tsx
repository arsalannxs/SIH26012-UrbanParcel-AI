import React, { useState } from 'react';
import { Layers, Building, Milestone, Trees, Droplets, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Info, HelpCircle } from 'lucide-react';
import { CadastralFeature, AiExplanationResponse } from '../types.ts';
import { api } from '../services/api.ts';

interface FeatureExtractionProps {
  features: CadastralFeature[];
  activeParcelCode?: string;
  onNavigate: (tab: string) => void;
}

export const FeatureExtraction: React.FC<FeatureExtractionProps> = ({
  features,
  activeParcelCode = 'UP-MH-00124',
  onNavigate,
}) => {
  const [activeLayers, setActiveLayers] = useState({
    parcels: true,
    buildings: true,
    roads: true,
    openAreas: true,
    vegetation: true,
    issues: true,
  });

  const [aiAnalysis, setAiAnalysis] = useState<AiExplanationResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string>('');

  const featureCards = [
    {
      type: 'PARCEL_BOUNDARY',
      name: 'PARCEL BOUNDARY',
      detected: 6,
      confidence: 94,
      status: 'Successfully extracted',
      color: '#2563EB',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Orthorectified cadastral boundary lines detected from compound walls and field cadastre.',
    },
    {
      type: 'BUILDING_FOOTPRINT',
      name: 'BUILDING FOOTPRINT',
      detected: 14,
      confidence: 96,
      status: 'Successfully extracted',
      color: '#EF4444',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      description: 'Roof perimeter polygons including flat concrete slabs, tiles, and auxiliary structures.',
    },
    {
      type: 'ROAD',
      name: 'ROAD & ACCESS LANES',
      detected: 4,
      confidence: 98,
      status: 'Successfully extracted',
      color: '#EAB308',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Centerline alignments and surface edge vectors for primary and secondary rights-of-way.',
    },
    {
      type: 'OPEN_AREA',
      name: 'OPEN AREA / COURTYARDS',
      detected: 6,
      confidence: 92,
      status: 'Successfully extracted',
      color: '#10B981',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Permeable open spaces, driveways, internal setbacks, and unbuilt plot parcels.',
    },
    {
      type: 'VEGETATION',
      name: 'VEGETATION & TREE CANOPY',
      detected: 8,
      confidence: 88,
      status: 'Successfully extracted',
      color: '#8B5CF6',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Perimeter trees and green cover masks filtered from structural geometry.',
    },
    {
      type: 'POSSIBLE_ENCROACHMENT',
      name: 'POSSIBLE ENCROACHMENT',
      detected: 2,
      confidence: 85,
      status: 'Flagged for Review',
      warning: true,
      color: '#F97316',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'Structures or fences intersecting setback margins or adjacent public access tracks.',
    },
  ];

  const handleAskGemini = async () => {
    setAiLoading(true);
    try {
      const res = await api.askAiCadastralAdvisor(activeParcelCode);
      setAiAnalysis(res.data);
      setAiSource(res.source);
    } catch (err) {
      console.error('Failed to get AI explanation', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <Layers className="w-4 h-4" />
              <span>Multi-Class Semantic Segmentation (GSD: 2.5cm)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Cadastral Feature Extraction</h1>
            <p className="text-sm text-slate-500 mt-1">
              Inspection of computer-vision extracted boundaries, building footprints, roadways, and flagged spatial issues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('parcel-map')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Open in 2D Map →
            </button>
          </div>
        </div>
      </div>

      {/* Visual Overlay Section with Toggleable Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Aerial Drone Visual Overlay with SVG Vector Masks (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">AI Vector Overlay Preview</h2>
            <span className="text-[11px] text-slate-500 font-mono">Ortho Resolution: 2.5cm/px</span>
          </div>

          {/* Canvas Simulation with Drone Background + SVG Vector Layers */}
          <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 aspect-[4/3] select-none">
            <img
              src="https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80"
              alt="Sector 4-B Drone Orthomosaic"
              className="w-full h-full object-cover opacity-85"
            />

            {/* SVG Vector Graphic Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 600"
              preserveAspectRatio="none"
            >
              {/* Roads (Yellow) */}
              {activeLayers.roads && (
                <g stroke="#EAB308" strokeWidth="12" fill="none" opacity="0.85" strokeLinecap="round">
                  <path d="M 0 340 L 800 360" />
                  <path d="M 420 350 L 430 0" strokeWidth="8" />
                  <path d="M 120 340 L 420 350" strokeWidth="6" strokeDasharray="6,4" />
                </g>
              )}

              {/* Parcels (Blue) */}
              {activeLayers.parcels && (
                <g stroke="#2563EB" strokeWidth="3" fill="#3B82F6" fillOpacity="0.2">
                  {/* Parcel 1 */}
                  <polygon points="120,80 380,90 370,300 110,290" />
                  {/* Parcel 2 */}
                  <polygon points="450,70 720,80 710,280 440,270" />
                  {/* Parcel 3 (South) */}
                  <polygon points="110,380 390,390 380,560 100,550" />
                  {/* Parcel 4 (South East) */}
                  <polygon points="440,390 730,400 720,570 430,560" />
                </g>
              )}

              {/* Buildings (Red) */}
              {activeLayers.buildings && (
                <g stroke="#DC2626" strokeWidth="2.5" fill="#EF4444" fillOpacity="0.75">
                  {/* Buildings in Parcel 1 */}
                  <polygon points="150,110 260,115 255,190 145,185" />
                  <polygon points="280,120 350,125 345,175 275,170" />
                  <polygon points="160,210 240,215 235,265 155,260" />

                  {/* Buildings in Parcel 2 */}
                  <polygon points="480,100 680,110 670,240 470,230" />

                  {/* Buildings in Parcel 3 */}
                  <polygon points="150,420 330,430 320,520 140,510" />

                  {/* Buildings in Parcel 4 */}
                  <polygon points="470,420 590,425 585,520 465,515" />
                  <polygon points="620,430 700,435 695,490 615,485" />
                </g>
              )}

              {/* Open Areas (Green) */}
              {activeLayers.openAreas && (
                <g stroke="#059669" strokeWidth="2" fill="#10B981" fillOpacity="0.4">
                  <polygon points="270,210 350,215 345,280 265,275" />
                  <polygon points="120,400 370,405 365,420 115,415" />
                </g>
              )}

              {/* Vegetation (Purple) */}
              {activeLayers.vegetation && (
                <g stroke="#7C3AED" strokeWidth="2" fill="#8B5CF6" fillOpacity="0.45">
                  <circle cx="130" cy="100" r="18" />
                  <circle cx="360" cy="110" r="16" />
                  <circle cx="700" cy="100" r="22" />
                  <circle cx="430" cy="540" r="19" />
                </g>
              )}

              {/* Possible Encroachments (Orange) */}
              {activeLayers.issues && (
                <g stroke="#EA580C" strokeWidth="3" fill="#F97316" fillOpacity="0.7">
                  {/* Southern overlap into lane */}
                  <polygon points="105,335 180,338 178,355 103,352" strokeDasharray="4,2" />
                  {/* Setback protrusion */}
                  <polygon points="435,342 470,345 468,362 433,359" strokeDasharray="4,2" />
                </g>
              )}
            </svg>

            {/* Interactive Layer Pills on Canvas */}
            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-lg border border-slate-700 space-y-1">
              <span className="font-bold text-amber-300 block">Ortho Cadastre Vector Overlay</span>
              <span className="text-[10px] text-slate-300">ResNet-UNet v2.4 Feature Inference</span>
            </div>
          </div>

          {/* Layer Checkboxes */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2">Toggle Feature Layers:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-medium hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={activeLayers.parcels}
                  onChange={(e) => setActiveLayers(prev => ({ ...prev, parcels: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 shrink-0"></span>
                <span>Parcel Boundary</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-medium hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={activeLayers.buildings}
                  onChange={(e) => setActiveLayers(prev => ({ ...prev, buildings: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="w-2.5 h-2.5 rounded-xs bg-red-600 shrink-0"></span>
                <span>Buildings</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-medium hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={activeLayers.roads}
                  onChange={(e) => setActiveLayers(prev => ({ ...prev, roads: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="w-2.5 h-2.5 rounded-xs bg-yellow-500 shrink-0"></span>
                <span>Roads</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-medium hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={activeLayers.openAreas}
                  onChange={(e) => setActiveLayers(prev => ({ ...prev, openAreas: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 shrink-0"></span>
                <span>Open Areas</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-medium hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={activeLayers.vegetation}
                  onChange={(e) => setActiveLayers(prev => ({ ...prev, vegetation: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="w-2.5 h-2.5 rounded-xs bg-purple-600 shrink-0"></span>
                <span>Vegetation</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-medium hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={activeLayers.issues}
                  onChange={(e) => setActiveLayers(prev => ({ ...prev, issues: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 shrink-0"></span>
                <span>Possible Issues</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: AI Explanation & Gemini Cadastral Advisory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">AI Analysis Summary</h2>
                  <p className="text-[11px] text-slate-500">Autonomous cadastral interpretation</p>
                </div>
              </div>

              <button
                onClick={handleAskGemini}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-xs transition-colors"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Advisory</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Summary Content */}
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                {aiAnalysis
                  ? aiAnalysis.summary
                  : 'The uploaded drone image contains multiple visible building footprints and parcel-like boundaries. The system identified 14 building structures and 6 parcel boundaries. One area shows a possible boundary overlap on the southern edge and should be reviewed by a certified surveyor.'}
              </p>

              {aiAnalysis && (
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950">
                    <span className="font-bold block text-[11px] text-blue-900 mb-0.5">Land-Use Pattern:</span>
                    <span>{aiAnalysis.landUseAssessment}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950">
                    <span className="font-bold block text-[11px] text-amber-900 mb-0.5">Topological Validation Analysis:</span>
                    <span>{aiAnalysis.validationAnalysis}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950">
                    <span className="font-bold block text-[11px] text-emerald-900 mb-0.5">Surveyor Field Recommendation:</span>
                    <span>{aiAnalysis.surveyorRecommendation}</span>
                  </div>
                </div>
              )}

              {/* Mandatory Human Verification Disclaimer */}
              <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Decision-Support Notice:</strong> AI outputs are advisory tools for preliminary cadastral digitization. All detected parcel boundaries require verification by licensed government revenue surveyors.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Cadastral Feature Cards (Section 6) */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Extracted Feature Catalog</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((feat, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow ${
                feat.warning ? 'border-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-sm"
                    style={{ backgroundColor: feat.color }}
                  />
                  <h3 className="text-xs font-bold text-slate-900">{feat.name}</h3>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${feat.badgeColor}`}>
                  {feat.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Detected</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">{feat.detected}</div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">AI Confidence</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">{feat.confidence}%</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-2.5 leading-snug">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
