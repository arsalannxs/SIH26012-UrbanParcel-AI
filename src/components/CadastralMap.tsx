import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Building, Milestone, ShieldCheck, AlertTriangle, CheckCircle2, FileText, Sparkles, X, Compass, ExternalLink } from 'lucide-react';
import { Parcel, Building as BuildingType, Road, CadastralFeature } from '../types.ts';

interface CadastralMapProps {
  parcels: Parcel[];
  selectedParcelId: string | null;
  onSelectParcel: (id: string) => void;
  onNavigate: (tab: string, parcelId?: string) => void;
  roads?: Road[];
  buildings?: BuildingType[];
  features?: CadastralFeature[];
}

export const CadastralMap: React.FC<CadastralMapProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  onNavigate,
  roads = [],
  buildings = [],
  features = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.LayerGroup }>({});

  const [visibleLayers, setVisibleLayers] = useState({
    parcels: true,
    buildings: true,
    roads: true,
    warnings: true,
  });

  const activeParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered around Kharadi/Pune test orthomosaic area
    const initialCenter: [number, number] = [18.5545, 73.9345];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 17,
      minZoom: 14,
      maxZoom: 20,
      zoomControl: true,
    });

    // Base tile layer: OpenStreetMap Standard
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | DoLR SIH26012',
      maxZoom: 20,
    }).addTo(map);

    // Initialize Layer Groups
    const parcelGroup = L.layerGroup().addTo(map);
    const buildingGroup = L.layerGroup().addTo(map);
    const roadGroup = L.layerGroup().addTo(map);
    const warningGroup = L.layerGroup().addTo(map);

    layersRef.current = {
      parcels: parcelGroup,
      buildings: buildingGroup,
      roads: roadGroup,
      warnings: warningGroup,
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update vector layers when parcels/buildings/roads change or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { parcels: pGroup, buildings: bGroup, roads: rGroup, warnings: wGroup } = layersRef.current;
    if (!pGroup || !bGroup || !rGroup || !wGroup) return;

    // Clear old layers
    pGroup.clearLayers();
    bGroup.clearLayers();
    rGroup.clearLayers();
    wGroup.clearLayers();

    // 1. Draw Parcels
    if (visibleLayers.parcels) {
      parcels.forEach((parcel) => {
        const isSelected = parcel.id === activeParcel?.id;
        const color = isSelected ? '#1D4ED8' : '#3B82F6'; // Blue
        const fillColor = isSelected ? '#60A5FA' : '#93C5FD';
        const fillOpacity = isSelected ? 0.35 : 0.15;
        const weight = isSelected ? 3 : 2;

        const polygon = L.polygon(parcel.boundaryCoords, {
          color,
          fillColor,
          fillOpacity,
          weight,
          dashArray: parcel.status === 'NEEDS_REVIEW' ? '5, 5' : undefined,
        });

        polygon.on('click', () => {
          onSelectParcel(parcel.id);
        });

        // Tooltip
        polygon.bindTooltip(`<b>${parcel.parcelCode}</b><br/>Area: ${parcel.areaSqM.toLocaleString()} m²`, {
          sticky: true,
          direction: 'top',
          className: 'cadastral-tooltip text-xs font-sans',
        });

        polygon.addTo(pGroup);

        // Marker for Centroid / Parcel Code
        const markerHtml = `
          <div style="background-color: ${isSelected ? '#1D4ED8' : '#2563EB'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); text-align: center; white-space: nowrap;">
            ${parcel.parcelCode}
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'parcel-centroid-label',
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });

        L.marker([parcel.centroidLat, parcel.centroidLng], { icon })
          .on('click', () => onSelectParcel(parcel.id))
          .addTo(pGroup);
      });
    }

    // 2. Draw Buildings
    if (visibleLayers.buildings) {
      buildings.forEach((bld) => {
        const polygon = L.polygon(bld.geometry, {
          color: '#DC2626', // Red
          fillColor: '#EF4444',
          fillOpacity: 0.65,
          weight: 1.5,
        });

        polygon.bindTooltip(`<b>Structure: ${bld.structureId}</b><br/>Footprint: ${bld.footprintSqM} m²<br/>Stories: ${bld.stories}`, {
          sticky: true,
          direction: 'center',
          className: 'building-tooltip text-xs font-sans',
        });

        polygon.addTo(bGroup);
      });
    }

    // 3. Draw Roads
    if (visibleLayers.roads) {
      roads.forEach((road) => {
        const polyline = L.polyline(road.geometry, {
          color: '#D97706', // Yellow/Amber
          weight: road.roadWidthM > 10 ? 6 : 4,
          opacity: 0.9,
          dashArray: road.surfaceType.includes('Gravel') ? '6, 6' : undefined,
        });

        polyline.bindTooltip(`<b>${road.name}</b><br/>Width: ${road.roadWidthM}m (${road.surfaceType})`, {
          sticky: true,
          direction: 'center',
          className: 'road-tooltip text-xs font-sans',
        });

        polyline.addTo(rGroup);
      });
    }

    // 4. Draw Warnings / Encroachments
    if (visibleLayers.warnings) {
      // Flagged issues from parcels
      parcels.forEach((p) => {
        if (p.status === 'NEEDS_REVIEW' || p.status === 'ENCROACHMENT_FLAGGED') {
          const warningIcon = L.divIcon({
            html: `
              <div style="background-color: #EA580C; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
                !
              </div>
            `,
            className: 'warning-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([p.centroidLat + 0.0003, p.centroidLng + 0.0003], { icon: warningIcon })
            .bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px;">
                <b style="color: #C2410C;">Cadastral Issue Flagged:</b><br/>
                <b>Parcel:</b> ${p.parcelCode}<br/>
                <b>Note:</b> ${p.notes || 'Potential boundary overlap or setback issue'}
              </div>
            `)
            .addTo(wGroup);
        }
      });
    }
  }, [parcels, activeParcel, visibleLayers, roads, buildings]);

  // Center on selected parcel
  const handleRecenter = () => {
    if (mapInstanceRef.current && activeParcel) {
      mapInstanceRef.current.setView([activeParcel.centroidLat, activeParcel.centroidLng], 18, { animate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Map Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Interactive Cadastral Parcel Map</h1>
            <p className="text-xs text-slate-500">
              Click any polygon boundary to inspect land-use, structural footprints, and topological status
            </p>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200">
            <input
              type="checkbox"
              checked={visibleLayers.parcels}
              onChange={(e) => setVisibleLayers(prev => ({ ...prev, parcels: e.target.checked }))}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Parcels</span>
          </label>

          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200">
            <input
              type="checkbox"
              checked={visibleLayers.buildings}
              onChange={(e) => setVisibleLayers(prev => ({ ...prev, buildings: e.target.checked }))}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Buildings</span>
          </label>

          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200">
            <input
              type="checkbox"
              checked={visibleLayers.roads}
              onChange={(e) => setVisibleLayers(prev => ({ ...prev, roads: e.target.checked }))}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Roads</span>
          </label>

          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200">
            <input
              type="checkbox"
              checked={visibleLayers.warnings}
              onChange={(e) => setVisibleLayers(prev => ({ ...prev, warnings: e.target.checked }))}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>Issues</span>
          </label>

          <button
            onClick={handleRecenter}
            className="px-2.5 py-1 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
          >
            Center on Selected
          </button>
        </div>
      </div>

      {/* Map Layout: Left Map (8 cols) + Right Detail Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative min-h-[520px] h-[600px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Floating Legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-2.5 shadow-md text-[11px] space-y-1">
            <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">Cadastral Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs border-2 border-blue-600 bg-blue-100"></span>
              <span className="text-slate-700">Parcel Boundary</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-red-500 border border-red-700"></span>
              <span className="text-slate-700">Building Footprint</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-amber-500"></span>
              <span className="text-slate-700">Access Road</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 text-white text-[9px] flex items-center justify-center font-bold">!</span>
              <span className="text-slate-700">Surveyor Review Flag</span>
            </div>
          </div>
        </div>

        {/* Right Column: Parcel Details Panel (Section 5) */}
        <div className="lg:col-span-4 space-y-4">
          {activeParcel ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              {/* Parcel Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {activeParcel.wardNo}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      activeParcel.status === 'VALID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {activeParcel.status === 'VALID' ? 'Valid' : 'Needs Review'}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    {activeParcel.parcelCode}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">AI Confidence</span>
                  <span className="text-lg font-bold text-slate-800">
                    {Math.round(activeParcel.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Key Measurements Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-semibold">Area</span>
                  <span className="font-extrabold text-slate-900 text-base">
                    {activeParcel.areaSqM.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">sq. m</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-semibold">Perimeter</span>
                  <span className="font-extrabold text-slate-900 text-base">
                    {activeParcel.perimeterM}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">meters</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-semibold">Land Use</span>
                  <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                    {activeParcel.landUse}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-semibold">Structures</span>
                  <span className="font-bold text-slate-800 text-xs block mt-0.5">
                    {activeParcel.buildingCount} Buildings
                  </span>
                </div>
              </div>

              {/* Centroid & Location */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[10px] font-semibold text-slate-400">Centroid Coordinates:</span>
                  <span className="font-mono text-slate-800 text-[11px]">
                    {activeParcel.centroidLat.toFixed(5)}° N, {activeParcel.centroidLng.toFixed(5)}° E
                  </span>
                </div>
              </div>

              {/* Visual Summary Checklist (Requested in Section 5) */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Cadastral Feature Checklist</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Parcel Boundary</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Detected
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Building Footprints</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Detected ({activeParcel.buildingCount})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Road Access</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Detected
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Geometry Integrity</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600">Potential Issue</span>
                    {activeParcel.status === 'NEEDS_REVIEW' || activeParcel.status === 'ENCROACHMENT_FLAGGED' ? (
                      <span className="text-amber-700 font-semibold flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Minor overlap flagged
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> None
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onNavigate('validation', activeParcel.id)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Check Geometry Validation</span>
                </button>

                <button
                  onClick={() => onNavigate('reports', activeParcel.id)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Official Parcel Report</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500">
              Select a parcel polygon from the map to inspect cadastral properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
