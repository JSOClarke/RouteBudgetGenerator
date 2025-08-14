import { useState, useEffect } from "react";
import { useGeocode } from "./hooks/useGeocode";
import { useORSMatrix } from "./hooks/useORSMatrix";
import Sidebar from "./components/Sidebar";
import CostConfiguration from "./components/CostConfiguration";
import PostcodeUpload from "./components/PostcodeUpload";
import RouteOptimization from "./components/RouteOptimization";
import RouteTable from "./components/RouteTable";
import MatrixTable from "./components/MatrixTable";
import type { PostcodeData, CostConfig } from "./types";

function App() {
  const [postcodes, setPostcodes] = useState<PostcodeData[]>([]);
  const [loadingGeocode, setLoadingGeocode] = useState<boolean>(false);
  const { geocode } = useGeocode();

  const [costConfig, setCostConfig] = useState<CostConfig>({
    fuelPrice: 1.55, // £/L
    fuelConsumption: 8, // L/100km
    hourlyRate: 15, // £/hour
    overheadPerKm: 0.05, // £
    profitMargin: 20, // %
  });

  const [routeStrategy, setRouteStrategy] = useState<string>("original");
  const [optimizedOrder, setOptimizedOrder] = useState<number[]>([]);
  const [showMatrixTable, setShowMatrixTable] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("cost-config");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    fetchMatrix,
    loading: loadingMatrix,
    error: matrixError,
    durationMatrix,
    distanceMatrix,
  } = useORSMatrix();

  // Extract coordinates for matrix call
  const coordinates = postcodes
    .filter(
      (p): p is PostcodeData & { coords: [number, number] } => p.coords !== null
    )
    .map((p) => p.coords);

  // Get matrix
  const handleGetMatrix = () => {
    fetchMatrix(coordinates);
    // Set default strategy to original and create initial route order
    setRouteStrategy("original");
    setOptimizedOrder(Array.from({ length: coordinates.length }, (_, i) => i));
  };

  // Route optimization algorithms
  const optimizeRoute = (strategy: string) => {
    if (!distanceMatrix || !durationMatrix) return;

    const n = distanceMatrix.length;
    if (n < 2) return;

    let order: number[] = [];

    switch (strategy) {
      case "nearest":
        order = nearestNeighborTSP(distanceMatrix);
        break;
      case "shortest":
        order = greedyShortestDistance(distanceMatrix);
        break;
      case "fastest":
        order = greedyFastestTime(durationMatrix);
        break;
      default:
        order = Array.from({ length: n }, (_, i) => i);
    }

    setOptimizedOrder(order);
  };

  // Nearest Neighbor TSP approximation
  const nearestNeighborTSP = (matrix: number[][]): number[] => {
    const n = matrix.length;
    const visited = new Array(n).fill(false);
    const route = [0]; // Start from first location
    visited[0] = true;

    for (let i = 1; i < n; i++) {
      let nearest = -1;
      let minDistance = Infinity;

      for (let j = 0; j < n; j++) {
        if (!visited[j] && matrix[route[route.length - 1]][j] < minDistance) {
          minDistance = matrix[route[route.length - 1]][j];
          nearest = j;
        }
      }

      if (nearest !== -1) {
        route.push(nearest);
        visited[nearest] = true;
      }
    }

    return route;
  };

  // Greedy shortest distance (not TSP, just shortest individual segments)
  const greedyShortestDistance = (matrix: number[][]): number[] => {
    const n = matrix.length;
    const edges: { from: number; to: number; distance: number }[] = [];

    // Create all edges
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        edges.push({ from: i, to: j, distance: matrix[i][j] });
      }
    }

    // Sort by distance
    edges.sort((a, b) => a.distance - b.distance);

    // Build route using shortest edges (simplified)
    const route = [0];
    const visited = new Set([0]);

    while (visited.size < n) {
      const current = route[route.length - 1];
      let nextNode = -1;
      let minDist = Infinity;

      for (let i = 0; i < n; i++) {
        if (!visited.has(i) && matrix[current][i] < minDist) {
          minDist = matrix[current][i];
          nextNode = i;
        }
      }

      if (nextNode !== -1) {
        route.push(nextNode);
        visited.add(nextNode);
      }
    }

    return route;
  };

  // Greedy fastest time
  const greedyFastestTime = (matrix: number[][]): number[] => {
    const n = matrix.length;
    const route = [0];
    const visited = new Set([0]);

    while (visited.size < n) {
      const current = route[route.length - 1];
      let nextNode = -1;
      let minTime = Infinity;

      for (let i = 0; i < n; i++) {
        if (!visited.has(i) && matrix[current][i] < minTime) {
          minTime = matrix[current][i];
          nextNode = i;
        }
      }

      if (nextNode !== -1) {
        route.push(nextNode);
        visited.add(nextNode);
      }
    }

    return route;
  };

  // Price calculation per route
  const calculatePrice = (distanceKm: number, durationHrs: number): number => {
    const {
      fuelPrice,
      fuelConsumption,
      hourlyRate,
      overheadPerKm,
      profitMargin,
    } = costConfig;
    const fuelCost = ((distanceKm * fuelConsumption) / 100) * fuelPrice;
    const labourCost = durationHrs * hourlyRate;
    const overheadCost = distanceKm * overheadPerKm;
    const baseCost = fuelCost + labourCost + overheadCost;
    return +(baseCost * (1 + profitMargin / 100)).toFixed(2);
  };

  // Generate prices matrix when data is available
  const pricesMatrix =
    distanceMatrix && durationMatrix
      ? distanceMatrix.map((row: number[], i: number) =>
          row.map((dist: number, j: number) => {
            const distanceKm = dist / 1000;
            const durationHrs = durationMatrix[i][j] / 3600;
            return calculatePrice(distanceKm, durationHrs);
          })
        )
      : null;

  const appStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "100vh",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f7fafc",
  };

  const mainContentStyle: React.CSSProperties = {
    marginLeft: isMobile ? "0" : "280px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: isMobile ? "1rem" : "2rem",
    paddingTop: isMobile ? "5rem" : "2rem", // Account for mobile toggle button
    color: "#2d3748",
    lineHeight: "1.6",
    minHeight: "100vh",
  };

  const contentContainerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.125rem",
    fontWeight: "500",
    color: "#2d3748",
    marginBottom: "1.5rem",
    margin: "0 0 1.5rem 0",
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "cost-config":
        return (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Cost Configuration</h2>
            <CostConfiguration
              costConfig={costConfig}
              setCostConfig={setCostConfig}
            />
          </div>
        );

      case "postcode-upload":
        return (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Postcode Upload</h2>
            <PostcodeUpload
              postcodes={postcodes}
              setPostcodes={setPostcodes}
              loadingGeocode={loadingGeocode}
              setLoadingGeocode={setLoadingGeocode}
              geocode={geocode}
              coordinates={coordinates}
              loadingMatrix={loadingMatrix}
              matrixError={matrixError}
              onGenerateMatrix={handleGetMatrix}
            />
          </div>
        );

      case "route-optimization":
        return distanceMatrix && durationMatrix ? (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Route Optimization</h2>
            <RouteOptimization
              routeStrategy={routeStrategy}
              setRouteStrategy={setRouteStrategy}
              optimizedOrder={optimizedOrder}
              postcodes={postcodes}
              onOptimizeRoute={optimizeRoute}
            />
          </div>
        ) : (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Route Optimization</h2>
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#718096",
                fontSize: "0.875rem",
                backgroundColor: "#f7fafc",
                borderRadius: "8px",
                border: "2px dashed #cbd5e0",
              }}
            >
              Please upload postcodes and generate the distance matrix first.
            </div>
          </div>
        );

      case "route-breakdown":
        return distanceMatrix &&
          durationMatrix &&
          pricesMatrix &&
          optimizedOrder.length > 0 ? (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Route Breakdown</h2>
            <RouteTable
              postcodes={postcodes}
              durations={durationMatrix}
              distances={distanceMatrix}
              prices={pricesMatrix}
              optimizedOrder={optimizedOrder}
            />
          </div>
        ) : (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Route Breakdown</h2>
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#718096",
                fontSize: "0.875rem",
                backgroundColor: "#f7fafc",
                borderRadius: "8px",
                border: "2px dashed #cbd5e0",
              }}
            >
              Please complete route optimization first to view the breakdown.
            </div>
          </div>
        );

      case "matrix-view":
        return distanceMatrix && durationMatrix ? (
          <div style={sectionStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={sectionTitleStyle}>Distance & Duration Matrix</h2>
              <button
                onClick={() => setShowMatrixTable(!showMatrixTable)}
                style={{
                  backgroundColor: showMatrixTable ? "#e53e3e" : "#4299e1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = showMatrixTable
                    ? "#c53030"
                    : "#3182ce";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = showMatrixTable
                    ? "#e53e3e"
                    : "#4299e1";
                }}
              >
                {showMatrixTable ? " Hide Matrix" : " Show Matrix"}
              </button>
            </div>

            {showMatrixTable && (
              <MatrixTable
                postcodes={postcodes}
                durations={durationMatrix}
                distances={distanceMatrix}
                prices={pricesMatrix}
              />
            )}

            {!showMatrixTable && (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "#718096",
                  fontSize: "0.875rem",
                  backgroundColor: "#f7fafc",
                  borderRadius: "8px",
                  border: "2px dashed #cbd5e0",
                }}
              >
                Matrix table is hidden. Click "Show Matrix" to view the full
                distance and duration matrix.
              </div>
            )}
          </div>
        ) : (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Distance & Duration Matrix</h2>
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#718096",
                fontSize: "0.875rem",
                backgroundColor: "#f7fafc",
                borderRadius: "8px",
                border: "2px dashed #cbd5e0",
              }}
            >
              Please upload postcodes and generate the matrix first.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={appStyle}>
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        hasData={postcodes.length > 0}
        hasMatrix={!!(distanceMatrix && durationMatrix)}
      />

      <main style={mainContentStyle}>
        <div style={contentContainerStyle}>{renderActiveSection()}</div>
      </main>
    </div>
  );
}

export default App;
