// Core type definitions for RouteGen application

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

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

export type GeocodeError = APIError | null;
export type MatrixError = APIError | null;
