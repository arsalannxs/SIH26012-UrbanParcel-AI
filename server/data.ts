/**
 * UrbanParcel AI - In-Memory Database Store & Seed Data
 * Matches Prisma schema models: User, DroneImage, Analysis, Parcel, CadastralFeature, Building, Road, ValidationResult, Report
 */

export interface ParcelModel {
  id: string;
  analysisId: string;
  parcelCode: string;
  wardNo: string;
  areaSqM: number;
  perimeterM: number;
  landUse: string;
  centroidLat: number;
  centroidLng: number;
  boundaryCoords: [number, number][]; // [lat, lng] array
  buildingCount: number;
  roadAccess: boolean;
  confidence: number;
  status: 'VALID' | 'NEEDS_REVIEW' | 'DISPUTED' | 'ENCROACHMENT_FLAGGED';
  notes: string;
}

export interface BuildingModel {
  id: string;
  parcelId: string;
  structureId: string;
  footprintSqM: number;
  stories: number;
  roofType: string;
  confidence: number;
  centroidLat: number;
  centroidLng: number;
  geometry: [number, number][];
}

export interface RoadModel {
  id: string;
  name: string;
  roadWidthM: number;
  surfaceType: string;
  lengthM: number;
  geometry: [number, number][];
  confidence: number;
}

export interface CadastralFeatureModel {
  id: string;
  analysisId: string;
  parcelId?: string;
  type: 'PARCEL_BOUNDARY' | 'BUILDING_FOOTPRINT' | 'ROAD' | 'OPEN_AREA' | 'VEGETATION' | 'WATER_BODY' | 'POSSIBLE_ENCROACHMENT';
  label: string;
  geometry: any;
  areaSqM?: number;
  lengthM?: number;
  confidence: number;
  status: string;
  color: string;
}

export interface ValidationResultModel {
  id: string;
  analysisId: string;
  parcelId: string;
  closedBoundaries: boolean;
  validCoordinates: boolean;
  noDuplicateParcels: boolean;
  overlapCount: number;
  overlapDescription?: string;
  buildingInsideParcel: boolean;
  roadConnectivity: boolean;
  selfIntersection: boolean;
  hasWarnings: boolean;
  surveyorNotes?: string;
  validatedAt: string;
}

export interface DroneImageModel {
  id: string;
  fileName: string;
  fileSize: number;
  resolutionGsd: number;
  flightAltitude: number;
  flightDate: string;
  locationName: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  imageUrl: string;
  thumbnailUrl?: string;
}

export interface AnalysisModel {
  id: string;
  droneImageId: string;
  status: 'PENDING' | 'UPLOADING' | 'PREPROCESSING' | 'DETECTING_FEATURES' | 'EXTRACTING_BOUNDARIES' | 'GENERATING_MAP' | 'COMPLETED' | 'FAILED';
  modelName: string;
  overallConfidence: number;
  parcelsCount: number;
  buildingsCount: number;
  roadsCount: number;
  featuresCount: number;
  issuesCount: number;
  aiSummary: string;
  processedAt: string;
  progressPercent: number;
}

export interface ReportModel {
  id: string;
  reportNumber: string;
  analysisId: string;
  parcelId: string;
  generatedAt: string;
  status: string;
  summary: string;
  dataSnapshot: any;
  recommendations: string;
}

// ----------------- SEED DATA -----------------

export const DEMO_DRONE_IMAGES: DroneImageModel[] = [
  {
    id: 'drone-img-01',
    fileName: 'Sector_4B_Urban_Ortho_GSD2.5cm.tif',
    fileSize: 48234400, // 48.2 MB
    resolutionGsd: 2.5,
    flightAltitude: 110,
    flightDate: '2026-09-18',
    locationName: 'Sector 4-B, Kharadi Urban Fringe, Pune, Maharashtra',
    minLat: 18.5520,
    maxLat: 18.5575,
    minLng: 73.9310,
    maxLng: 73.9380,
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'drone-img-02',
    fileName: 'Ward_12_MixedCommercial_Ortho_GSD3.0cm.tif',
    fileSize: 62450000, // 62.4 MB
    resolutionGsd: 3.0,
    flightAltitude: 120,
    flightDate: '2026-09-24',
    locationName: 'Ward 12, Bodakdev Urban Corridor, Ahmedabad, Gujarat',
    minLat: 23.0380,
    maxLat: 23.0440,
    minLng: 72.5080,
    maxLng: 72.5160,
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'drone-img-03',
    fileName: 'GramKanthal_Fringe_PlotSurvey_GSD2.0cm.tif',
    fileSize: 39120000, // 39.1 MB
    resolutionGsd: 2.0,
    flightAltitude: 95,
    flightDate: '2026-09-28',
    locationName: 'Varthur Peri-Urban Transit Zone, Bengaluru, Karnataka',
    minLat: 12.9420,
    maxLat: 12.9475,
    minLng: 77.7120,
    maxLng: 77.7190,
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80',
  }
];

export const INITIAL_ANALYSES: AnalysisModel[] = [
  {
    id: 'analysis-sih-01',
    droneImageId: 'drone-img-01',
    status: 'COMPLETED',
    modelName: 'UrbanCadastre-Net v2.4 (GSD-ResNet)',
    overallConfidence: 0.94,
    parcelsCount: 6,
    buildingsCount: 14,
    roadsCount: 4,
    featuresCount: 38,
    issuesCount: 2,
    aiSummary: 'Drone orthomosaic analysis detected 6 distinct cadastral parcels with 14 concrete building footprints and 4 primary access lanes. Parcel UP-MH-00124 shows a 1.8m minor boundary overlap along the southern compound wall requiring field survey verification.',
    processedAt: '2026-09-18T14:32:00Z',
    progressPercent: 100,
  }
];

export const SEEDED_PARCELS: ParcelModel[] = [
  {
    id: 'parcel-001',
    analysisId: 'analysis-sih-01',
    parcelCode: 'UP-MH-00124',
    wardNo: 'Ward 14 (Kharadi East)',
    areaSqM: 1842,
    perimeterM: 184.6,
    landUse: 'Mixed Residential',
    centroidLat: 18.5542,
    centroidLng: 73.9340,
    boundaryCoords: [
      [18.5538, 73.9334],
      [18.5547, 73.9336],
      [18.5546, 73.9348],
      [18.5537, 73.9346],
      [18.5538, 73.9334],
    ],
    buildingCount: 3,
    roadAccess: true,
    confidence: 0.94,
    status: 'NEEDS_REVIEW',
    notes: 'Identified minor southern boundary overlap (1.8m) adjacent to unpaved lane. 3 concrete structures detected.',
  },
  {
    id: 'parcel-002',
    analysisId: 'analysis-sih-01',
    parcelCode: 'UP-MH-00125',
    wardNo: 'Ward 14 (Kharadi East)',
    areaSqM: 1210,
    perimeterM: 142.2,
    landUse: 'Residential',
    centroidLat: 18.5552,
    centroidLng: 73.9342,
    boundaryCoords: [
      [18.5548, 73.9337],
      [18.5557, 73.9339],
      [18.5556, 73.9348],
      [18.5547, 73.9346],
      [18.5548, 73.9337],
    ],
    buildingCount: 2,
    roadAccess: true,
    confidence: 0.97,
    status: 'VALID',
    notes: 'Geometry fully closed. Compound walls cleanly detected from drone shadow-cast analysis.',
  },
  {
    id: 'parcel-003',
    analysisId: 'analysis-sih-01',
    parcelCode: 'UP-MH-00126',
    wardNo: 'Ward 14 (Kharadi East)',
    areaSqM: 2450,
    perimeterM: 210.8,
    landUse: 'Commercial',
    centroidLat: 18.5544,
    centroidLng: 73.9358,
    boundaryCoords: [
      [18.5538, 73.9349],
      [18.5551, 73.9351],
      [18.5549, 73.9366],
      [18.5536, 73.9364],
      [18.5538, 73.9349],
    ],
    buildingCount: 4,
    roadAccess: true,
    confidence: 0.96,
    status: 'VALID',
    notes: 'Commercial shopping arcade with paved parking apron. Direct front road frontage of 28 meters.',
  },
  {
    id: 'parcel-004',
    analysisId: 'analysis-sih-01',
    parcelCode: 'UP-MH-00127',
    wardNo: 'Ward 14 (Kharadi East)',
    areaSqM: 980,
    perimeterM: 128.4,
    landUse: 'Residential',
    centroidLat: 18.5558,
    centroidLng: 73.9355,
    boundaryCoords: [
      [18.5553, 73.9350],
      [18.5562, 73.9352],
      [18.5561, 73.9361],
      [18.5552, 73.9359],
      [18.5553, 73.9350],
    ],
    buildingCount: 1,
    roadAccess: true,
    confidence: 0.93,
    status: 'VALID',
    notes: 'Single storey villa with garden buffer. Clear boundary fence extraction.',
  },
  {
    id: 'parcel-005',
    analysisId: 'analysis-sih-01',
    parcelCode: 'UP-MH-00128',
    wardNo: 'Ward 14 (Kharadi East)',
    areaSqM: 3120,
    perimeterM: 236.0,
    landUse: 'Open / Institutional',
    centroidLat: 18.5534,
    centroidLng: 73.9328,
    boundaryCoords: [
      [18.5526, 73.9320],
      [18.5541, 73.9323],
      [18.5539, 73.9335],
      [18.5524, 73.9332],
      [18.5526, 73.9320],
    ],
    buildingCount: 1,
    roadAccess: true,
    confidence: 0.91,
    status: 'ENCROACHMENT_FLAGGED',
    notes: 'Potential temporary structure erected over municipal setback margin on east edge.',
  },
  {
    id: 'parcel-006',
    analysisId: 'analysis-sih-01',
    parcelCode: 'UP-MH-00129',
    wardNo: 'Ward 14 (Kharadi East)',
    areaSqM: 1650,
    perimeterM: 168.0,
    landUse: 'Mixed Residential',
    centroidLat: 18.5561,
    centroidLng: 73.9338,
    boundaryCoords: [
      [18.5558, 73.9332],
      [18.5568, 73.9334],
      [18.5566, 73.9344],
      [18.5556, 73.9342],
      [18.5558, 73.9332],
    ],
    buildingCount: 3,
    roadAccess: true,
    confidence: 0.95,
    status: 'VALID',
    notes: 'Multi-family residential tenement with shared central courtyard.',
  }
];

export const SEEDED_BUILDINGS: BuildingModel[] = [
  {
    id: 'bld-01',
    parcelId: 'parcel-001',
    structureId: 'BLD-00124-A',
    footprintSqM: 340,
    stories: 3,
    roofType: 'Reinforced Concrete (Flat)',
    confidence: 0.97,
    centroidLat: 18.5541,
    centroidLng: 73.9339,
    geometry: [
      [18.55395, 73.93375],
      [18.55425, 73.93380],
      [18.55420, 73.93410],
      [18.55390, 73.93405],
      [18.55395, 73.93375],
    ]
  },
  {
    id: 'bld-02',
    parcelId: 'parcel-001',
    structureId: 'BLD-00124-B',
    footprintSqM: 195,
    stories: 2,
    roofType: 'Terracotta Tile Gable',
    confidence: 0.95,
    centroidLat: 18.5544,
    centroidLng: 73.9343,
    geometry: [
      [18.55430, 73.93418],
      [18.55455, 73.93422],
      [18.55450, 73.93448],
      [18.55425, 73.93444],
      [18.55430, 73.93418],
    ]
  },
  {
    id: 'bld-03',
    parcelId: 'parcel-001',
    structureId: 'BLD-00124-C (Outhouse)',
    footprintSqM: 65,
    stories: 1,
    roofType: 'Corrugated Metal Sheet',
    confidence: 0.91,
    centroidLat: 18.5538,
    centroidLng: 73.9344,
    geometry: [
      [18.55375, 73.93430],
      [18.55388, 73.93432],
      [18.55385, 73.93448],
      [18.55372, 73.93446],
      [18.55375, 73.93430],
    ]
  },
  {
    id: 'bld-04',
    parcelId: 'parcel-002',
    structureId: 'BLD-00125-A',
    footprintSqM: 280,
    stories: 2,
    roofType: 'Concrete Slab',
    confidence: 0.98,
    centroidLat: 18.5552,
    centroidLng: 73.9341,
    geometry: [
      [18.5550, 73.9339],
      [18.5554, 73.9340],
      [18.5553, 73.9343],
      [18.5549, 73.9342],
      [18.5550, 73.9339],
    ]
  },
  {
    id: 'bld-05',
    parcelId: 'parcel-003',
    structureId: 'BLD-00126-MAIN',
    footprintSqM: 780,
    stories: 4,
    roofType: 'Reinforced Flat Deck',
    confidence: 0.99,
    centroidLat: 18.5544,
    centroidLng: 73.9356,
    geometry: [
      [18.5541, 73.9352],
      [18.5548, 73.9354],
      [18.5546, 73.9362],
      [18.5539, 73.9360],
      [18.5541, 73.9352],
    ]
  }
];

export const SEEDED_ROADS: RoadModel[] = [
  {
    id: 'road-01',
    name: 'Sector 4-B Main Arterial (18m Road)',
    roadWidthM: 18.0,
    surfaceType: 'Dense Bituminous Macadam (Asphalt)',
    lengthM: 480,
    geometry: [
      [18.5534, 73.9310],
      [18.5536, 73.9334],
      [18.5537, 73.9348],
      [18.5538, 73.9372],
    ],
    confidence: 0.98,
  },
  {
    id: 'road-02',
    name: 'North-South Secondary Access Lane (9m)',
    roadWidthM: 9.0,
    surfaceType: 'Concrete Paver Blocks',
    lengthM: 320,
    geometry: [
      [18.5535, 73.9348],
      [18.5548, 73.9349],
      [18.5565, 73.9350],
    ],
    confidence: 0.96,
  },
  {
    id: 'road-03',
    name: 'Internal Colony Sector Lane (6m)',
    roadWidthM: 6.0,
    surfaceType: 'Asphalt',
    lengthM: 210,
    geometry: [
      [18.5547, 73.9336],
      [18.5548, 73.9348],
    ],
    confidence: 0.93,
  },
  {
    id: 'road-04',
    name: 'East Fringe Unpaved Access Track (4.5m)',
    roadWidthM: 4.5,
    surfaceType: 'Compacted Murrum / Gravel',
    lengthM: 290,
    geometry: [
      [18.5536, 73.9365],
      [18.5562, 73.9367],
    ],
    confidence: 0.89,
  }
];

export const SEEDED_FEATURES: CadastralFeatureModel[] = [
  {
    id: 'feat-01',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-001',
    type: 'PARCEL_BOUNDARY',
    label: 'Cadastral Boundary - UP-MH-00124',
    geometry: { type: 'Polygon', coordinates: SEEDED_PARCELS[0].boundaryCoords },
    areaSqM: 1842,
    lengthM: 184.6,
    confidence: 0.94,
    status: 'Extracted',
    color: '#2563EB', // Blue
  },
  {
    id: 'feat-02',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-001',
    type: 'BUILDING_FOOTPRINT',
    label: 'Primary Residential Structure (BLD-00124-A)',
    geometry: { type: 'Polygon', coordinates: SEEDED_BUILDINGS[0].geometry },
    areaSqM: 340,
    confidence: 0.97,
    status: 'Extracted',
    color: '#EF4444', // Red
  },
  {
    id: 'feat-03',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-001',
    type: 'BUILDING_FOOTPRINT',
    label: 'Secondary Structure (BLD-00124-B)',
    geometry: { type: 'Polygon', coordinates: SEEDED_BUILDINGS[1].geometry },
    areaSqM: 195,
    confidence: 0.95,
    status: 'Extracted',
    color: '#EF4444', // Red
  },
  {
    id: 'feat-04',
    analysisId: 'analysis-sih-01',
    type: 'ROAD',
    label: 'Sector 4-B Main Arterial Road',
    geometry: { type: 'LineString', coordinates: SEEDED_ROADS[0].geometry },
    lengthM: 480,
    confidence: 0.98,
    status: 'Extracted',
    color: '#EAB308', // Yellow
  },
  {
    id: 'feat-05',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-001',
    type: 'OPEN_AREA',
    label: 'Internal Open Courtyard & Driveway',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [18.5540, 73.9341],
        [18.5544, 73.9341],
        [18.5543, 73.9344],
        [18.5539, 73.9343],
        [18.5540, 73.9341],
      ]
    },
    areaSqM: 420,
    confidence: 0.92,
    status: 'Extracted',
    color: '#10B981', // Green
  },
  {
    id: 'feat-06',
    analysisId: 'analysis-sih-01',
    type: 'VEGETATION',
    label: 'Perimeter Neem & Gulmohar Tree Canopy',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [18.5545, 73.9334],
        [18.5547, 73.9335],
        [18.5547, 73.9337],
        [18.5544, 73.9336],
        [18.5545, 73.9334],
      ]
    },
    areaSqM: 180,
    confidence: 0.88,
    status: 'Extracted',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'feat-07',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-001',
    type: 'POSSIBLE_ENCROACHMENT',
    label: 'Southern Boundary Overlap onto Public Lane Buffer',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [18.5537, 73.9342],
        [18.5538, 73.9342],
        [18.55378, 73.9346],
        [18.55368, 73.9346],
        [18.5537, 73.9342],
      ]
    },
    areaSqM: 28,
    confidence: 0.84,
    status: 'Flagged for Review',
    color: '#F97316', // Orange
  },
  {
    id: 'feat-08',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-005',
    type: 'POSSIBLE_ENCROACHMENT',
    label: 'Setback Projection into Municipal Right-of-Way',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [18.5525, 73.9331],
        [18.5527, 73.9331],
        [18.55268, 73.9334],
        [18.55248, 73.9334],
        [18.5525, 73.9331],
      ]
    },
    areaSqM: 42,
    confidence: 0.86,
    status: 'Flagged for Review',
    color: '#F97316', // Orange
  }
];

export const SEEDED_VALIDATIONS: ValidationResultModel[] = [
  {
    id: 'val-001',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-001',
    closedBoundaries: true,
    validCoordinates: true,
    noDuplicateParcels: true,
    overlapCount: 1,
    overlapDescription: 'Minor boundary overlap (1.8m width) on the southern compound wall extending toward public right-of-way.',
    buildingInsideParcel: true,
    roadConnectivity: true,
    selfIntersection: false,
    hasWarnings: true,
    surveyorNotes: 'Recommend physical ETS (Electronic Total Station) ground verification of south compound corner stone.',
    validatedAt: '2026-09-18T14:32:05Z',
  },
  {
    id: 'val-002',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-002',
    closedBoundaries: true,
    validCoordinates: true,
    noDuplicateParcels: true,
    overlapCount: 0,
    buildingInsideParcel: true,
    roadConnectivity: true,
    selfIntersection: false,
    hasWarnings: false,
    surveyorNotes: 'Parcel topology strictly satisfies polygon closure and clear setback thresholds.',
    validatedAt: '2026-09-18T14:32:05Z',
  },
  {
    id: 'val-003',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-003',
    closedBoundaries: true,
    validCoordinates: true,
    noDuplicateParcels: true,
    overlapCount: 0,
    buildingInsideParcel: true,
    roadConnectivity: true,
    selfIntersection: false,
    hasWarnings: false,
    surveyorNotes: 'Commercial plot boundaries match historical survey khasra plan with 98.4% geometric correlation.',
    validatedAt: '2026-09-18T14:32:05Z',
  },
  {
    id: 'val-004',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-004',
    closedBoundaries: true,
    validCoordinates: true,
    noDuplicateParcels: true,
    overlapCount: 0,
    buildingInsideParcel: true,
    roadConnectivity: true,
    selfIntersection: false,
    hasWarnings: false,
    surveyorNotes: 'Full topological integrity confirmed.',
    validatedAt: '2026-09-18T14:32:05Z',
  },
  {
    id: 'val-005',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-005',
    closedBoundaries: true,
    validCoordinates: true,
    noDuplicateParcels: true,
    overlapCount: 1,
    overlapDescription: 'Encroachment alert: Tin shed structure intersects municipal lane alignment buffer by 2.4 meters.',
    buildingInsideParcel: false,
    roadConnectivity: true,
    selfIntersection: false,
    hasWarnings: true,
    surveyorNotes: 'Structure extends outside designated plot boundary; requires municipal town planning notice.',
    validatedAt: '2026-09-18T14:32:05Z',
  },
  {
    id: 'val-006',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-006',
    closedBoundaries: true,
    validCoordinates: true,
    noDuplicateParcels: true,
    overlapCount: 0,
    buildingInsideParcel: true,
    roadConnectivity: true,
    selfIntersection: false,
    hasWarnings: false,
    surveyorNotes: 'Standard residential parcel. All internal buildings are strictly enclosed.',
    validatedAt: '2026-09-18T14:32:05Z',
  }
];

export const SEEDED_REPORTS: ReportModel[] = [
  {
    id: 'rep-001',
    reportNumber: 'UPAR-2026-0041',
    analysisId: 'analysis-sih-01',
    parcelId: 'parcel-001',
    generatedAt: '2026-09-18T14:35:10Z',
    status: 'Ready for Review',
    summary: 'Automated Cadastral Assessment for Parcel UP-MH-00124 generated from 2.5cm GSD high-resolution drone orthomosaic. The plot has a calculated polygon area of 1,842 sq.m and perimeter of 184.6m with 3 recognized permanent and semi-permanent structures.',
    dataSnapshot: {
      parcelCode: 'UP-MH-00124',
      ward: 'Ward 14 (Kharadi East)',
      areaSqM: 1842,
      perimeterM: 184.6,
      landUse: 'Mixed Residential',
      buildingCount: 3,
      roadAccess: 'Yes (Direct frontage to 9m Access Lane)',
      aiConfidence: '94%',
      validationStatus: 'Needs Review',
      issues: ['Southern boundary overlap (1.8m) on compound wall edge']
    },
    recommendations: 'Conduct a targeted physical field check with GPS rover on the southern fence marker. Notify Department of Land Resources nodal surveyor prior to official digitization sync.'
  }
];

// In-Memory Repository
class CadastralDatabase {
  droneImages: DroneImageModel[] = [...DEMO_DRONE_IMAGES];
  analyses: AnalysisModel[] = [...INITIAL_ANALYSES];
  parcels: ParcelModel[] = [...SEEDED_PARCELS];
  buildings: BuildingModel[] = [...SEEDED_BUILDINGS];
  roads: RoadModel[] = [...SEEDED_ROADS];
  features: CadastralFeatureModel[] = [...SEEDED_FEATURES];
  validations: ValidationResultModel[] = [...SEEDED_VALIDATIONS];
  reports: ReportModel[] = [...SEEDED_REPORTS];

  // Helper methods
  getAllParcels() {
    return this.parcels;
  }

  getParcelById(id: string) {
    return this.parcels.find(p => p.id === id || p.parcelCode === id);
  }

  getBuildingsByParcel(parcelId: string) {
    return this.buildings.filter(b => b.parcelId === parcelId);
  }

  getValidationByParcel(parcelId: string) {
    return this.validations.find(v => v.parcelId === parcelId);
  }

  getFeatures(filterType?: string) {
    if (!filterType) return this.features;
    return this.features.filter(f => f.type === filterType);
  }

  createReport(parcelId: string, customSummary?: string, customRecs?: string): ReportModel {
    const parcel = this.getParcelById(parcelId);
    if (!parcel) throw new Error('Parcel not found');
    const val = this.getValidationByParcel(parcel.id);
    const blds = this.getBuildingsByParcel(parcel.id);

    const reportNum = `UPAR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: ReportModel = {
      id: `rep-${Date.now()}`,
      reportNumber: reportNum,
      analysisId: parcel.analysisId,
      parcelId: parcel.id,
      generatedAt: new Date().toISOString(),
      status: 'Generated',
      summary: customSummary || `Automated AI Cadastral Feature Extraction for Parcel ${parcel.parcelCode}. Extracted total polygon area of ${parcel.areaSqM.toLocaleString()} sq.m with ${parcel.buildingCount} detected structures and ${Math.round(parcel.confidence * 100)}% model confidence score.`,
      dataSnapshot: {
        parcelCode: parcel.parcelCode,
        ward: parcel.wardNo,
        areaSqM: parcel.areaSqM,
        perimeterM: parcel.perimeterM,
        landUse: parcel.landUse,
        buildingCount: parcel.buildingCount,
        roadAccess: parcel.roadAccess ? 'Yes (Connected)' : 'No Dedicated Access',
        aiConfidence: `${Math.round(parcel.confidence * 100)}%`,
        validationStatus: val?.hasWarnings ? 'Warnings Flagged' : 'Topologically Valid',
        issues: val?.overlapDescription ? [val.overlapDescription] : [],
        buildings: blds.map(b => ({ structureId: b.structureId, areaSqM: b.footprintSqM, stories: b.stories, roofType: b.roofType }))
      },
      recommendations: customRecs || (val?.hasWarnings
        ? 'Field surveyor inspection advised before finalizing land record attribute updates. Check perimeter GPS coordinates.'
        : 'Geometry conforms to Department of Land Resources cadastral standards. Ready for surveyor sign-off.')
    };

    this.reports.unshift(newReport);
    return newReport;
  }
}

export const db = new CadastralDatabase();
