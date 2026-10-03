import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Compass, FileImage, Layers, MapPin, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { DroneImage } from '../types.ts';

interface DroneAnalysisProps {
  droneImages: DroneImage[];
  selectedImage: DroneImage | null;
  onSelectImage: (img: DroneImage) => void;
  onNavigate: (tab: string) => void;
}

type Stage = 'idle' | 'uploading' | 'preprocessing' | 'detecting' | 'extracting' | 'generating' | 'completed';

export const DroneAnalysis: React.FC<DroneAnalysisProps> = ({
  droneImages,
  selectedImage,
  onSelectImage,
  onNavigate,
}) => {
  const currentImage = selectedImage || droneImages[0];
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [customFile, setCustomFile] = useState<{ name: string; size: string; preview: string } | null>(null);

  const stages: { key: Stage; label: string }[] = [
    { key: 'uploading', label: 'Uploading' },
    { key: 'preprocessing', label: 'Preprocessing' },
    { key: 'detecting', label: 'Detecting Features' },
    { key: 'extracting', label: 'Extracting Boundaries' },
    { key: 'generating', label: 'Generating Map' },
  ];

  const handleStartAnalysis = () => {
    setStage('uploading');
    setProgress(15);

    setTimeout(() => {
      setStage('preprocessing');
      setProgress(35);
    }, 400);

    setTimeout(() => {
      setStage('detecting');
      setProgress(60);
    }, 800);

    setTimeout(() => {
      setStage('extracting');
      setProgress(85);
    }, 1200);

    setTimeout(() => {
      setStage('generating');
      setProgress(95);
    }, 1600);

    setTimeout(() => {
      setStage('completed');
      setProgress(100);
    }, 2000);
  };

  const handleReset = () => {
    setStage('idle');
    setProgress(0);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const preview = URL.createObjectURL(file);
      setCustomFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        preview,
      });
      handleReset();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setCustomFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        preview,
      });
      handleReset();
    }
  };

  const activeName = customFile ? customFile.name : currentImage?.fileName;
  const activeGsd = customFile ? '2.5' : currentImage?.resolutionGsd;
  const activeSize = customFile ? customFile.size : `${((currentImage?.fileSize || 0) / 1024 / 1024).toFixed(1)} MB`;
  const activeImgUrl = customFile ? customFile.preview : currentImage?.imageUrl;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <Compass className="w-4 h-4" />
            <span>SIH26012 Feature Extraction Stage 1</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Drone Imagery Ingestion & AI Analysis</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload orthorectified drone surveys (.tif, .png, .jpg) or select an urban test sector to trigger automated feature extraction.
          </p>
        </div>

        {stage === 'completed' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Analyze Another Image</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Upload & Select Left, Preview & Status Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Demo Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Dropzone */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Upload Drone Flight Imagery</span>
            </h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <FileImage className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your drone orthomosaic
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports GeoTIFF, TIFF, JPG, PNG (Max 100MB)
              </p>

              <label className="mt-4 inline-block">
                <input
                  type="file"
                  accept="image/*,.tif,.tiff"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="px-4 py-2 rounded-lg text-xs font-semibold text-blue-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                  Browse Drone Files
                </span>
              </label>
            </div>
          </div>

          {/* Select Demo Image Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Or Select a Sample Drone Flight</h2>
              <span className="text-[11px] font-medium text-slate-500">SIH Test Set</span>
            </div>

            <div className="space-y-2.5">
              {droneImages.map((img) => {
                const isSelected = !customFile && currentImage?.id === img.id;
                return (
                  <button
                    key={img.id}
                    onClick={() => {
                      setCustomFile(null);
                      onSelectImage(img);
                      handleReset();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.fileName}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {img.fileName.split('_')[0]} Sector
                        </span>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          {img.resolutionGsd} cm GSD
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{img.locationName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Image Preview, Metadata & Analysis Trigger (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Drone Flight Preview & Metadata</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                stage === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : stage === 'idle'
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {stage === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Analysis Complete</span>
                  </>
                ) : stage === 'idle' ? (
                  <span>Ready for Processing</span>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Processing in Progress...</span>
                  </>
                )}
              </span>
            </div>

            {/* Image Preview Canvas */}
            <div className="h-64 sm:h-72 rounded-xl overflow-hidden relative border border-slate-200 bg-slate-950">
              <img
                src={activeImgUrl}
                alt="Selected Drone Orthomosaic"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

              {/* Watermark / Coordinates */}
              <div className="absolute bottom-3 left-3 text-white text-xs">
                <span className="font-semibold block">{activeName}</span>
                <span className="text-[11px] text-slate-300">
                  Orthorectified Aerial Survey • DoLR SIH26012 Dataset
                </span>
              </div>

              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded font-mono">
                GSD: {activeGsd} cm/px
              </div>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Name</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5" title={activeName}>
                  {activeName}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Resolution (GSD)</span>
                <span className="font-bold text-slate-800 block mt-0.5">{activeGsd} cm / pixel</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Image Size</span>
                <span className="font-bold text-slate-800 block mt-0.5">{activeSize}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Processing Status</span>
                <span className="font-bold text-slate-800 block mt-0.5 capitalize">
                  {stage === 'idle' ? 'Ready' : stage}
                </span>
              </div>
            </div>

            {/* Processing Steps Animation */}
            {stage !== 'idle' && stage !== 'completed' && (
              <div className="mt-5 p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    Running Cadastral Feature Extraction Pipeline...
                  </span>
                  <span>{progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-blue-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Breadcrumb Steps */}
                <div className="grid grid-cols-5 gap-1 text-center pt-2">
                  {stages.map((stg) => {
                    const isDone = progress >= (stg.key === 'uploading' ? 15 : stg.key === 'preprocessing' ? 35 : stg.key === 'detecting' ? 60 : stg.key === 'extracting' ? 85 : 95);
                    const isCurrent = stage === stg.key;
                    return (
                      <div key={stg.key} className="space-y-1">
                        <div
                          className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone
                              ? 'bg-blue-600 text-white'
                              : isCurrent
                              ? 'bg-blue-200 text-blue-900 animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? '✓' : '•'}
                        </div>
                        <span className={`text-[10px] block leading-tight ${isCurrent ? 'font-bold text-blue-800' : 'text-slate-500'}`}>
                          {stg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trigger Button or Completed State Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              {stage === 'idle' && (
                <button
                  onClick={handleStartAnalysis}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Image</span>
                </button>
              )}

              {stage === 'completed' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">Analysis Complete</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Successfully vectorized 6 cadastral parcel envelopes, 14 building footprints, and 4 access roads. 1 potential boundary overlap was detected for surveyor review.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => onNavigate('features')}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>View Feature Overlay</span>
                    </button>

                    <button
                      onClick={() => onNavigate('parcel-map')}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Open Parcel Map</span>
                    </button>

                    <button
                      onClick={() => onNavigate('validation')}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Check Validation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
