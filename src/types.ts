export interface DroneImage {
  id: string;
  fileName: string;
  fileSize: number;
  resolutionGsd: number; // cm/pixel
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

export interface Building {
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

export interface Road {
  id: string;
  name: string;
  roadWidthM: number;
  surfaceType: string;
  lengthM: number;
  geometry: [number, number][];
  confidence: number;
}

export interface Parcel {
  id: string;
  analysisId: string;
  parcelCode: string;
  wardNo: string;
  areaSqM: number;
  perimeterM: number;
  landUse: string;
  centroidLat: number;
  centroidLng: number;
  boundaryCoords: [number, number][];
  buildingCount: number;
  roadAccess: boolean;
  confidence: number;
  status: 'VALID' | 'NEEDS_REVIEW' | 'DISPUTED' | 'ENCROACHMENT_FLAGGED';
  notes: string;
  buildings?: Building[];
  validation?: ValidationResult;
  features?: CadastralFeature[];
}

export interface CadastralFeature {
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

export interface ValidationResult {
  id: string;
  analysisId: string;
  parcelId: string;
  parcelCode?: string;
  landUse?: string;
  areaSqM?: number;
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

export interface ValidationSummary {
  totalValidated: number;
  validParcels: number;
  flaggedIssues: number;
  closedBoundariesPassed: number;
  validCoordinatesPassed: number;
  noDuplicateParcelsPassed: number;
  buildingEnclosurePassed: number;
  roadConnectivityPassed: number;
}

export interface Report {
  id: string;
  reportNumber: string;
  analysisId: string;
  parcelId: string;
  generatedAt: string;
  status: string;
  summary: string;
  dataSnapshot: {
    parcelCode: string;
    ward: string;
    areaSqM: number;
    perimeterM: number;
    landUse: string;
    buildingCount: number;
    roadAccess: string;
    aiConfidence: string;
    validationStatus: string;
    issues?: string[];
    buildings?: { structureId: string; areaSqM: number; stories: number; roofType: string }[];
  };
  recommendations: string;
}

export interface DashboardStats {
  imagesProcessed: number;
  parcelsDetected: number;
  buildingsDetected: number;
  roadsDetected: number;
  featuresExtracted: number;
  validationIssues: number;
  datasetType: string;
  activeDroneImagesCount: number;
  activeParcelsCount: number;
}

export interface AiExplanationResponse {
  summary: string;
  landUseAssessment: string;
  validationAnalysis: string;
  surveyorRecommendation: string;
  disclaimer: string;
}
