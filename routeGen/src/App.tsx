import { useState } from "react";
import Papa from "papaparse";
import { useGeocode } from "./hooks/useGeocode";
import { useORSMatrix } from "./hooks/useORSMatrix";
import MatrixTable from "./components/MatrixTable";
import RouteTable from "./components/RouteTable";
import type { PostcodeData, CostConfig, TripTotals } from "./types";

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

  // Cost configuration tooltips with explanations and averages
  const costConfigTooltips = {
    fuelPrice: {
      description: "Current fuel price per litre",
      average: "UK average: £1.40-£1.60",
      unit: "£/L",
    },
    fuelConsumption: {
      description: "Vehicle fuel consumption rate",
      average: "Van average: 7-10 L/100km",
      unit: "L/100km",
    },
    hourlyRate: {
      description: "Driver hourly wage including benefits",
      average: "UK average: £12-£18/hour",
      unit: "£/hour",
    },
    overheadPerKm: {
      description:
        "Vehicle overhead costs (insurance, maintenance, depreciation)",
      average: "Typical range: £0.03-£0.08/km",
      unit: "£/km",
    },
    profitMargin: {
      description: "Business profit margin on top of costs",
      average: "Industry standard: 15-25%",
      unit: "%",
    },
  };

  const {
    fetchMatrix,
    loading: loadingMatrix,
    error: matrixError,
    durationMatrix,
    distanceMatrix,
  } = useORSMatrix();

  // Upload, parse CSV, and geocode automatically
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<any>) => {
        const rawData: PostcodeData[] = results.data.map((item: any) => ({
          ...item,
          coords: null as [number, number] | null,
          geocodeError: null as string | null,
        }));
        setPostcodes(rawData);

        // Start silent geocoding
        setLoadingGeocode(true);
        const updated: PostcodeData[] = [];
        for (const item of rawData) {
          if (!item.Postcode) {
            updated.push({
              ...item,
              coords: null,
              geocodeError: "No postcode",
            });
            continue;
          }
          try {
            const coords = await geocode(item.Postcode);
            updated.push({
              ...item,
              coords,
              geocodeError: coords ? null : "Not found",
            });
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : "Unknown error";
            updated.push({ ...item, coords: null, geocodeError: errorMessage });
          }
        }
        setPostcodes(updated);
        setLoadingGeocode(false);
      },
      error: (err: Error) => console.error("CSV parse error:", err),
    });
  };

  // Extract coordinates for matrix call
  const coordinates = postcodes
    .filter(
      (p): p is PostcodeData & { coords: [number, number] } => p.coords !== null
    )
    .map((p) => p.coords);

  // Get matrix
  const handleGetMatrix = () => {
    fetchMatrix(coordinates);
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

  const containerStyle: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#2d3748",
    lineHeight: "1.6",
  };

  const headerStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "300",
    color: "#1a202c",
    marginBottom: "3rem",
    textAlign: "center",
    letterSpacing: "-0.025em",
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    marginBottom: "2rem",
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

  const configGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  };

  const inputGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#4a5568",
    textTransform: "capitalize",
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.75rem",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "0.875rem",
    transition: "border-color 0.2s",
    outline: "none",
  };

  const fileInputStyle: React.CSSProperties = {
    padding: "1rem",
    border: "2px dashed #cbd5e0",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s",
    backgroundColor: "#f7fafc",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.875rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    disabled: loadingMatrix || loadingGeocode || coordinates.length < 2,
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#a0aec0",
    cursor: "not-allowed",
  };

  const errorStyle: React.CSSProperties = {
    color: "#e53e3e",
    fontSize: "0.875rem",
    padding: "0.75rem",
    backgroundColor: "#fed7d7",
    border: "1px solid #feb2b2",
    borderRadius: "6px",
    marginTop: "1rem",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Route Matrix Planner</h1>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Cost Configuration</h2>
        <div style={configGridStyle}>
          {Object.entries(costConfig).map(([key, value]: [string, number]) => {
            const tooltip =
              costConfigTooltips[key as keyof typeof costConfigTooltips];
            return (
              <div key={key} style={inputGroupStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <label style={labelStyle}>
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      cursor: "help",
                    }}
                    title={`${tooltip.description}\n${tooltip.average}`}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#718096",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "500",
                      }}
                    >
                      ?
                    </span>
                  </div>
                </div>
                <input
                  type="number"
                  value={value}
                  step="0.01"
                  style={inputStyle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCostConfig({
                      ...costConfig,
                      [key]: parseFloat(e.target.value),
                    })
                  }
                />
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#718096",
                    marginTop: "0.25rem",
                  }}
                >
                  {tooltip.description}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#4a5568",
                    fontWeight: "500",
                  }}
                >
                  {tooltip.average}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Upload Postcodes</h2>

        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            backgroundColor: "#f0f9ff",
            borderRadius: "6px",
            border: "1px solid #bfdbfe",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              marginBottom: "0.5rem",
              color: "#1e40af",
            }}
          >
            � Requir ed CSV Format
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#374151",
              marginBottom: "0.75rem",
            }}
          >
            Your CSV file must have a column named <strong>"Postcode"</strong>{" "}
            containing UK postcodes. Additional columns are allowed.
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "0.75rem",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ color: "#6b7280", marginBottom: "0.25rem" }}>
              Example CSV content:
            </div>
            <div>Postcode,Customer,Address</div>
            <div>SW1A 1AA,Customer A,Buckingham Palace</div>
            <div>E1 6AN,Customer B,Tower of London</div>
            <div>W1A 0AX,Customer C,BBC Broadcasting House</div>
          </div>
        </div>

        <div style={fileInputStyle}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="csv-upload"
          />
          <label htmlFor="csv-upload" style={{ cursor: "pointer" }}>
            📁 Choose CSV file with postcodes
          </label>
        </div>

        {postcodes.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.875rem",
              color: "#718096",
            }}
          >
            {postcodes.length} postcodes loaded
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={handleGetMatrix}
            disabled={loadingMatrix || loadingGeocode || coordinates.length < 2}
            style={
              loadingMatrix || loadingGeocode || coordinates.length < 2
                ? disabledButtonStyle
                : buttonStyle
            }
            onMouseOver={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#3182ce";
              }
            }}
            onMouseOut={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#4299e1";
              }
            }}
          >
            {loadingMatrix
              ? "⏳ Loading Matrix..."
              : loadingGeocode
              ? "� Geoacoding..."
              : "🚀 Generate Matrix"}
          </button>
        </div>

        {matrixError && <div style={errorStyle}>⚠️ {matrixError}</div>}
      </div>

      {distanceMatrix && durationMatrix && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Route Optimization</h2>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Optimization Strategy</label>
            <select
              value={routeStrategy}
              onChange={(e) => {
                setRouteStrategy(e.target.value);
                optimizeRoute(e.target.value);
              }}
              style={{
                ...inputStyle,
                marginTop: "0.5rem",
                cursor: "pointer",
              }}
            >
              <option value="original">Original Order (CSV sequence)</option>
              <option value="nearest">
                Nearest Neighbor (TSP approximation)
              </option>
              <option value="shortest">Shortest Distance First</option>
              <option value="fastest">Fastest Time First</option>
            </select>
          </div>

          <div style={{ fontSize: "0.875rem", color: "#718096" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Strategy Explanations:</strong>
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              • <strong>Original Order:</strong> Uses postcodes in CSV file
              order
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              • <strong>Nearest Neighbor:</strong> Always goes to closest
              unvisited location (good TSP approximation)
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              • <strong>Shortest Distance:</strong> Prioritizes shortest
              individual segments
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              • <strong>Fastest Time:</strong> Prioritizes quickest individual
              segments
            </div>
          </div>

          {optimizedOrder.length > 0 && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#f0f9ff",
                borderRadius: "6px",
                border: "1px solid #bfdbfe",
              }}
            >
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                }}
              >
                Optimized Route Order:
              </div>
              <div style={{ fontSize: "0.875rem", color: "#374151" }}>
                {optimizedOrder.map((index, i) => (
                  <span key={index}>
                    {postcodes[index]?.Postcode}
                    {i < optimizedOrder.length - 1 ? " → " : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {distanceMatrix &&
        durationMatrix &&
        pricesMatrix &&
        optimizedOrder.length > 0 && (
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
        )}

      {distanceMatrix && durationMatrix && (
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
              {showMatrixTable ? "🙈 Hide Matrix" : "👁️ Show Matrix"}
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
      )}
    </div>
  );
}

export default App;
