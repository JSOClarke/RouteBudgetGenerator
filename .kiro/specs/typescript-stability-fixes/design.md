# Design Document

## Overview

This design addresses TypeScript stability issues in the RouteGen application by implementing proper type definitions, interfaces, and component contracts. The approach focuses on minimal changes that eliminate compilation errors while maintaining existing functionality.

## Architecture

The solution follows a layered approach:

1. **Type Definitions Layer** - Core interfaces and types
2. **Component Layer** - Properly typed React components
3. **Hook Layer** - Type-safe custom hooks
4. **Utility Layer** - Typed helper functions

## Components and Interfaces

### Core Type Definitions

```typescript
// types/index.ts
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
```

### Component Props Interfaces

```typescript
// components/MatrixTable.tsx
export interface MatrixTableProps {
  postcodes: PostcodeData[];
  durations: number[][] | null;
  distances: number[][] | null;
  prices?: number[][] | null;
}
```

### Hook Return Types

```typescript
// hooks/useGeocode.tsx
export interface GeocodeHook {
  geocode: (query: string) => Promise<[number, number] | null>;
  loading: boolean;
  error: string | null;
}

// hooks/useORSMatrix.tsx
export interface ORSMatrixHook {
  fetchMatrix: (coordinates: [number, number][]) => Promise<any>;
  loading: boolean;
  error: string | null;
  durationMatrix: number[][] | null;
  distanceMatrix: number[][] | null;
}
```

## Data Models

### Postcode Processing Flow

1. **CSV Upload** - Parse with proper typing for Papa.parse results
2. **Geocoding** - Transform postcode strings to coordinate arrays
3. **Matrix Calculation** - Process coordinates into distance/duration matrices
4. **Price Calculation** - Generate cost matrix from distance/duration data

### State Management

- Use proper TypeScript generics for useState hooks
- Define explicit types for all state variables
- Ensure type compatibility between state updates and initial values

## Error Handling

### Error Type Definitions

```typescript
export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

export type GeocodeError = APIError | null;
export type MatrixError = APIError | null;
```

### Error Handling Strategy

1. **Type Guards** - Use proper type checking for error objects
2. **Error Boundaries** - Maintain existing error handling patterns
3. **API Errors** - Consistent error type handling across hooks
4. **User Feedback** - Type-safe error message display

## Testing Strategy

### Type Safety Validation

1. **Compilation Tests** - Ensure no TypeScript errors during build
2. **Interface Compliance** - Verify components accept correct prop types
3. **Hook Contracts** - Validate hook return types match interfaces
4. **Error Handling** - Test error type consistency

### Implementation Approach

1. **Incremental Typing** - Add types file by file to avoid breaking changes
2. **Backward Compatibility** - Maintain existing functionality while adding types
3. **Minimal Refactoring** - Focus on type additions rather than logic changes
4. **Dependency Management** - Add missing type packages without changing core dependencies
