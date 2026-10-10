export type PageId =
  | 'home'
  | 'analysis'
  | 'map'
  | 'infrastructure'
  | 'connectivity'
  | 'ai'
  | 'report'
  | 'datasources'
  | 'limitations';

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface UserAreaSelection {
  name: string;
  bbox: BoundingBox;
  center: [number, number];
  zoom: number;
  polygon?: [number, number][];
}

export interface SatelliteMetadata {
  platform: string;
  sensorType: string;
  acquisitionDate: string;
  orbitPass: string;
  relativeOrbit: string | number;
  polarization: string;
  resolutionMeters: number;
  cloudCoverPercent?: number;
  processingPipeline: string[];
}

export interface FloodPolygonFeature {
  id: string;
  type: 'flood' | 'debris' | 'uncertain';
  coordinates: [number, number][]; // LatLng points
  areaHectares: number;
  confidenceScore: number;
  sarBackscatterDiffDb: number;
  notes: string;
}

export interface FloodDetectionSummary {
  totalAnalyzedAreaKm2: number;
  floodedAreaKm2: number;
  debrisAreaKm2: number;
  normalLandAreaKm2: number;
  uncertainAreaKm2: number;
  meanBackscatterDropDb: number;
  sarConfidencePercent: number;
  opticalCloudStatus: string;
  polygons: FloodPolygonFeature[];
}

export type ImpactStatus = 'Potentially affected' | 'Possible damage' | 'Clear';

export interface InfrastructureFeature {
  id: string;
  name: string;
  type: 'road' | 'bridge' | 'building';
  coordinates: [number, number] | [number, number][];
  locationDescription: string;
  overlapDegree: 'High' | 'Medium' | 'Low' | 'None';
  confidencePercent: number;
  status: ImpactStatus;
  notes: string;
  whyExplanation: string;
}

export interface SettlementConnectivity {
  id: string;
  name: string;
  coordinates: [number, number];
  populationEstimate: number;
  elevationMeters: number;
  nearestTownOrHospital: string;
  normalDistanceKm: number;
  currentEstimatedRouteKm: number | null;
  connectivityStatus: 'CONNECTED' | 'POSSIBLY CUT OFF' | 'NO ROUTE FOUND';
  affectedRoadSegmentsCount: number;
  alternativeRouteAvailable: boolean;
  routingAnalysisNote: string;
  whyExplanation: string;
  normalPath: [number, number][];
  affectedPath: [number, number][] | null;
}

export interface FlowPathPoint {
  coordinates: [number, number];
  elevationMeters: number;
  distanceFromSourceKm: number;
  slopeDegrees: number;
}

export interface FlowPathResult {
  startPoint: {
    name: string;
    coordinates: [number, number];
    elevationMeters: number;
  };
  totalLengthKm: number;
  totalElevationDropMeters: number;
  points: FlowPathPoint[];
  settlementsAlongPath: Array<{
    name: string;
    distanceAlongPathKm: number;
    hazardLevel: 'High' | 'Medium' | 'Low';
  }>;
  disclaimer: string;
}

export interface AISegmentationResult {
  architecture: string;
  backbone: string;
  datasetUsed: string;
  iouScore: number;
  precisionScore: number;
  recallScore: number;
  f1Score: number;
  accuracy: number;
  himalayanSceneNote: string;
}

export interface VerifiedGeographicArea {
  officialName: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  boundaryPolygon: [number, number][];
  bbox: BoundingBox;
}

export interface DataSourceProvenance {
  verifiedArea: string;
  state: string;
  country: string;
  requestedFloodDate: string;
  satelliteDataDate: string;
  source: string;
  coverageStatus: 'Verified Complete' | 'Partial' | 'Insufficient';
  confidenceText: string;
  floodDetectionStatus: 'FLOOD_DETECTED' | 'NO_FLOOD_DETECTED' | 'INSUFFICIENT_DATA';
}

export interface AnalysisRunData {
  id: string;
  areaName: string;
  verifiedArea?: VerifiedGeographicArea;
  bbox: BoundingBox;
  center: [number, number];
  zoom: number;
  floodDate: string;
  analyzedAt: string;
  status: 'idle' | 'processing' | 'completed' | 'failed' | 'no_data';
  currentStep: number;
  stepMessage: string;
  errorMessage?: string;
  errorReason?: string;
  satelliteMetadata: {
    beforeImage: SatelliteMetadata;
    afterImage: SatelliteMetadata;
    opticalStatusNote: string;
  };
  floodSummary: FloodDetectionSummary;
  infrastructure: InfrastructureFeature[];
  settlements: SettlementConnectivity[];
  flowPath?: FlowPathResult;
  aiSegmentation: AISegmentationResult;
  provenance: DataSourceProvenance;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
