import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { DroneAnalysis } from './components/DroneAnalysis.tsx';
import { CadastralMap } from './components/CadastralMap.tsx';
import { FeatureExtraction } from './components/FeatureExtraction.tsx';
import { ValidationView } from './components/ValidationView.tsx';
import { ReportView } from './components/ReportView.tsx';
import { DemoGuideModal } from './components/DemoGuideModal.tsx';
import { api } from './services/api.ts';
import {
  DashboardStats,
  DroneImage,
  Parcel,
  CadastralFeature,
  ValidationResult,
  ValidationSummary,
  Report,
} from './types.ts';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [droneImages, setDroneImages] = useState<DroneImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<DroneImage | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>('parcel-001');
  const [features, setFeatures] = useState<CadastralFeature[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // Loading & error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data loading
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, imagesRes, parcelsRes, featuresRes, validationRes, reportsRes] =
        await Promise.all([
          api.getStats().catch(() => null),
          api.getDroneImages().catch(() => []),
          api.getParcels().catch(() => []),
          api.getFeatures().catch(() => []),
          api.getValidation().catch(() => ({ summary: null, results: [] })),
          api.getReports().catch(() => []),
        ]);

      if (statsRes) setStats(statsRes);
      if (imagesRes && imagesRes.length > 0) {
        setDroneImages(imagesRes);
        setSelectedImage(imagesRes[0]);
      }
      if (parcelsRes && parcelsRes.length > 0) {
        setParcels(parcelsRes);
        setSelectedParcelId(parcelsRes[0].id);
      }
      if (featuresRes) setFeatures(featuresRes);
      if (validationRes) {
        setValidationSummary(validationRes.summary);
        setValidationResults(validationRes.results);
      }
      if (reportsRes) setReports(reportsRes);
    } catch (err: any) {
      console.error('Failed to load application data', err);
      setError('Unable to connect to cadastral data services. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleNavigate = (tab: string, arg?: string) => {
    setCurrentTab(tab);
    if (tab === 'drone-analysis' && arg) {
      const found = droneImages.find(img => img.id === arg);
      if (found) setSelectedImage(found);
    } else if (tab === 'parcel-map' && arg) {
      setSelectedParcelId(arg);
    } else if (tab === 'reports' && arg) {
      setSelectedParcelId(arg);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshReports = async () => {
    try {
      const reps = await api.getReports();
      setReports(reps);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(!demoMode)}
        onOpenDemoGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">
              Initializing UrbanParcel AI Cadastral Engine...
            </p>
            <p className="text-xs text-slate-400">Loading spatial layers & GeoJSON geometry</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 max-w-xl mx-auto my-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h2 className="text-base font-bold">Cadastral Service Connection Issue</h2>
            <p className="text-xs text-rose-800">{error}</p>
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                stats={stats}
                droneImages={droneImages}
                onNavigate={handleNavigate}
                onStartDemo={() => setIsGuideOpen(true)}
              />
            )}

            {currentTab === 'drone-analysis' && (
              <DroneAnalysis
                droneImages={droneImages}
                selectedImage={selectedImage}
                onSelectImage={(img) => setSelectedImage(img)}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'parcel-map' && (
              <CadastralMap
                parcels={parcels}
                selectedParcelId={selectedParcelId}
                onSelectParcel={(id) => setSelectedParcelId(id)}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'features' && (
              <FeatureExtraction
                features={features}
                activeParcelCode={parcels.find(p => p.id === selectedParcelId)?.parcelCode || 'UP-MH-00124'}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'validation' && (
              <ValidationView
                summary={validationSummary}
                results={validationResults}
                onSelectParcelOnMap={(pId) => handleNavigate('parcel-map', pId)}
                onGenerateReport={(pId) => handleNavigate('reports', pId)}
              />
            )}

            {currentTab === 'reports' && (
              <ReportView
                parcels={parcels}
                selectedParcelId={selectedParcelId}
                onSelectParcel={(id) => setSelectedParcelId(id)}
                reports={reports}
                onRefreshReports={handleRefreshReports}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-bold text-slate-800">UrbanParcel AI</span> — AI-Powered Urban Parcel Mapping
            <p className="text-[11px] text-slate-400">
              Smart India Hackathon 2026 • Ministry of Rural Development • Department of Land Resources (DoLR)
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Problem Statement: SIH26012</span>
            <span>•</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-blue-600 hover:underline font-semibold"
            >
              Demo Walkthrough
            </button>
            <span>•</span>
            <span className="font-mono text-slate-400">v2.4.0</span>
          </div>
        </div>
      </footer>

      {/* SIH Demo Guide Modal */}
      <DemoGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
