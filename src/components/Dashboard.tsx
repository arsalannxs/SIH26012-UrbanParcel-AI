import React from 'react';
import { ArrowRight, Compass, Layers, Building, Milestone, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, MapPin, FileCheck } from 'lucide-react';
import { DashboardStats, DroneImage } from '../types.ts';

interface DashboardProps {
  stats: DashboardStats | null;
  droneImages: DroneImage[];
  onNavigate: (tab: string, imageId?: string) => void;
  onStartDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  droneImages,
  onNavigate,
  onStartDemo,
}) => {
  const cards = [
    {
      title: 'Images Processed',
      value: stats?.imagesProcessed ?? 24,
      desc: 'High-res drone orthomosaics',
      icon: Compass,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Parcels Detected',
      value: stats?.parcelsDetected ?? 186,
      desc: 'Extracted polygon envelopes',
      icon: Layers,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Buildings Detected',
      value: stats?.buildingsDetected ?? 241,
      desc: 'Structural roof footprints',
      icon: Building,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      title: 'Roads Detected',
      value: stats?.roadsDetected ?? 48,
      desc: 'Access lane centerlines',
      icon: Milestone,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      title: 'Features Extracted',
      value: stats?.featuresExtracted ?? 512,
      desc: 'Total vector attributes',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Validation Issues',
      value: stats?.validationIssues ?? 7,
      desc: 'Requires field verification',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      warning: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH26012 • Ministry of Rural Development • DoLR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            UrbanParcel AI
          </h1>
          <p className="text-lg font-medium text-blue-700 mt-1">
            AI-Powered Urban Parcel Mapping from Drone Imagery
          </p>
          <p className="text-slate-600 mt-3 text-base leading-relaxed">
            Analyze drone imagery and automatically extract urban cadastral features using AI-assisted computer vision.
            Converts high-resolution aerial orthomosaics into structured parcel boundaries, building footprints, and topological land records.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('drone-analysis')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all text-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Start Drone Analysis</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('parcel-map')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Explore Parcel Map</span>
            </button>

            <button
              onClick={onStartDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors text-sm"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Quick 1-Click Judge Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Statistics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cadastral Intelligence Overview</h2>
            <p className="text-xs text-slate-500">Aggregate statistics from processed high-resolution urban drone flights</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Demo Dataset
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow ${card.border}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">{card.title}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">{card.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Workflow Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-2">Automated Cadastral Workflow</h2>
        <p className="text-xs text-slate-500 mb-6">
          A seamless 6-stage pipeline transforming raw drone sensor data into verifiable cadastral parcels
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: '1', title: 'Drone Image', desc: 'Orthomosaic upload or selection', icon: '📸' },
            { step: '2', title: 'AI Analysis', desc: 'ResNet semantic segmentation', icon: '⚡' },
            { step: '3', title: 'Feature Extraction', desc: 'Boundaries, roofs, lanes', icon: '📐' },
            { step: '4', title: 'Parcel Map', desc: 'Interactive 2D GIS rendering', icon: '🗺️' },
            { step: '5', title: 'Validation', desc: 'Topology & overlap checks', icon: '✅' },
            { step: '6', title: 'Report', desc: 'Official parcel intelligence file', icon: '📄' },
          ].map((item, i) => (
            <div
              key={i}
              className="relative p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/40 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{item.icon}</span>
                <span className="text-[11px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  Step {item.step}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available Drone Survey Datasets */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pre-Configured Urban Drone Flights</h2>
            <p className="text-xs text-slate-500">Select any representative drone flight to inspect extracted cadastral features</p>
          </div>
          <button
            onClick={() => onNavigate('drone-analysis')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Upload Custom Imagery →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {droneImages.map((img) => (
            <div
              key={img.id}
              className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group bg-white flex flex-col justify-between"
            >
              <div>
                <div className="h-36 overflow-hidden relative bg-slate-100">
                  <img
                    src={img.imageUrl}
                    alt={img.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
                    GSD: {img.resolutionGsd} cm/px
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {img.fileName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{img.locationName}</p>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Altitude:</span>
                      <span className="font-semibold text-slate-700">{img.flightAltitude}m AGL</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">File Size:</span>
                      <span className="font-semibold text-slate-700">{(img.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => onNavigate('drone-analysis', img.id)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Analyze Flight Imagery</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Prototype Disclaimer (Mandatory Requirement) */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Smart India Hackathon 2026 Prototype Notice: </span>
          This platform is an AI-assisted computer vision prototype built for demonstrative and decision-support purposes under Problem SIH26012.
          Extracted parcel boundaries and feature counts are simulated AI models and <span className="font-semibold">must NOT be treated as official cadastral or legal land records</span>.
          Statutory land verification requires physical ground-truthing by certified revenue surveyors using Electronic Total Stations (ETS) and RoR registries.
        </div>
      </div>
    </div>
  );
};
