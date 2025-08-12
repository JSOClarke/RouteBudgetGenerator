// Core type definitions for the RouteGen application

export interface Coordinate {
  longitude: number;
  latitude: number;
}

export interface PostcodeData {
  Postcode: string;
  coords: [number, number] | null;
  geocodeError: string | null;
  [key: string]: any; // Allow additional CSV columns
}

export interface CostConfig {
  fuelPrice: number;
  fuelConsumption: number;
  hourlyRate: number;
  overheadPerKm: number;
  profitMargin: number;
}

export interface MatrixData {
  durations: number[][] | null;
  distances: number[][] | null;
}

export interface TripTotals {
  durationMinutes: number;
  distanceKm: number;
}

export interface GeocodeHook {
  geocode: (query: string) => Promise<[number, number] | null>;
  loading: boolean;
  error: string | null;
}

export interface ORSMatrixHook {
  fetchMatrix: (coordinates: [number, number][]) => Promise<any>;
  loading: boolean;
  error: string | null;
  durationMatrix: number[][] | null;
  distanceMatrix: number[][] | null;
}

export interface MatrixTableProps {
  postcodes: PostcodeData[];
  durations: number[][] | null;
  distances: number[][] | null;
  prices?: number[][] | null;
}

export interface RouteTableProps {
  postcodes: PostcodeData[];
  durations: number[][] | null;
  distances: number[][] | null;
  prices: number[][] | null;
  optimizedOrder: number[];
}

export interface CostConfigurationProps {
  costConfig: CostConfig;
  setCostConfig: (config: CostConfig) => void;
}

export interface PostcodeUploadProps {
  postcodes: PostcodeData[];
  setPostcodes: (postcodes: PostcodeData[]) => void;
  loadingGeocode: boolean;
  setLoadingGeocode: (loading: boolean) => void;
  geocode: (query: string) => Promise<[number, number] | null>;
  coordinates: [number, number][];
  loadingMatrix: boolean;
  matrixError: string | null;
  onGenerateMatrix: () => void;
}

export interface RouteOptimizationProps {
  routeStrategy: string;
  setRouteStrategy: (strategy: string) => void;
  optimizedOrder: number[];
  postcodes: PostcodeData[];
  onOptimizeRoute: (strategy: string) => void;
}
