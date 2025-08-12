# Implementation Plan

- [x] 1. Install missing type dependencies and create core type definitions

  - Install @types/papaparse package to resolve papaparse type errors
  - Create types/index.ts file with core interfaces for PostcodeData, CostConfig, Coordinate, and MatrixData
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4_

- [x] 2. Fix MatrixTable component type issues

  - Add proper TypeScript interface for MatrixTableProps including prices prop
  - Update component parameters to use explicit types instead of implicit any
  - Fix component prop destructuring to match the interface
  - _Requirements: 3.1, 3.2, 1.4_

- [x] 3. Add proper typing to useGeocode hook

  - Define explicit parameter types for geocode function
  - Add proper error type handling for catch blocks
  - Create and export GeocodeHook interface for return type
  - _Requirements: 1.3, 4.1, 4.2_

- [x] 4. Add proper typing to useORSMatrix hook

  - Define explicit parameter types for fetchMatrix function
  - Add proper error type handling for API errors
  - Create and export ORSMatrixHook interface for return type
  - _Requirements: 1.3, 4.1, 4.2_

- [x] 5. Fix App component state and event handler types

  - Add proper typing for postcodes state using PostcodeData array type
  - Fix event handler parameter types for file upload and form inputs
  - Add explicit types for Papa.parse callback parameters
  - _Requirements: 1.1, 1.3, 3.3, 2.1_

- [x] 6. Fix utility function parameter types in App component

  - Add explicit parameter types for getTotalTrip function
  - Add explicit parameter types for calculatePrice function
  - Fix matrix mapping function parameter types
  - _Requirements: 1.3, 2.4_

- [x] 7. Update component imports and exports for type compatibility
  - Remove unused MatrixTableProps interface from App.tsx
  - Ensure all component prop passing matches defined interfaces
  - Verify type compatibility between components and hooks
  - _Requirements: 3.1, 3.2, 1.4_
