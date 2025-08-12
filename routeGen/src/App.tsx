import React, { useState } from "react";
import Papa from "papaparse";
import { useGeocode } from "./hooks/useGeocode";
import { useORSMatrix } from "./hooks/useORSMatrix";
import MatrixTable from "./components/MatrixTable";

interface MatrixTableProps {
  postcodes: any;
  durations: any;
  distances: any;
  prices?: any;
}

function App() {
  const [postcodes, setPostcodes] = useState([]);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const { geocode } = useGeocode();

  const [costConfig, setCostConfig] = useState({
    fuelPrice: 1.55, // £/L
    fuelConsumption: 8, // L/100km
    hourlyRate: 15, // £/hour
    overheadPerKm: 0.05, // £
    profitMargin: 20, // %
  });

  const {
    fetchMatrix,
    loading: loadingMatrix,
    error: matrixError,
    durationMatrix,
    distanceMatrix,
  } = useORSMatrix();

  // Upload, parse CSV, and geocode automatically
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rawData = results.data.map((item) => ({
          ...item,
          coords: null,
          geocodeError: null,
        }));
        setPostcodes(rawData);

        // Start silent geocoding
        setLoadingGeocode(true);
        const updated = [];
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
            updated.push({ ...item, coords: null, geocodeError: err.message });
          }
        }
        setPostcodes(updated);
        setLoadingGeocode(false);
      },
      error: (err) => console.error("CSV parse error:", err),
    });
  };

  // Extract coordinates for matrix call
  const coordinates = postcodes
    .filter((p) => p.coords !== null)
    .map((p) => p.coords);

  // Get matrix
  const handleGetMatrix = () => {
    fetchMatrix(coordinates);
  };

  // Calculate total trip duration and distance (in order given)
  const getTotalTrip = (durations, distances, orderLength) => {
    if (!durations || !distances) return null;
    let totalDurationSeconds = 0;
    let totalDistanceMeters = 0;

    for (let i = 0; i < orderLength - 1; i++) {
      totalDurationSeconds += durations[i][i + 1];
      totalDistanceMeters += distances[i][i + 1];
    }

    return {
      durationMinutes: +(totalDurationSeconds / 60).toFixed(2),
      distanceKm: +(totalDistanceMeters / 1000).toFixed(2),
    };
  };

  // Price calculation per route
  const calculatePrice = (distanceKm, durationHrs) => {
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
      ? distanceMatrix.map((row, i) =>
          row.map((dist, j) => {
            const distanceKm = dist / 1000;
            const durationHrs = durationMatrix[i][j] / 3600;
            return calculatePrice(distanceKm, durationHrs);
          })
        )
      : null;

  const totals = getTotalTrip(
    durationMatrix,
    distanceMatrix,
    coordinates.length
  );

  return (
    <div>
      <h2>Postcode Matrix Planner</h2>

      {/* Cost config form */}
      <div
        style={{
          marginBottom: "1rem",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <h3>Cost Settings</h3>
        {Object.entries(costConfig).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <label style={{ textTransform: "capitalize", marginRight: "8px" }}>
              {key.replace(/([A-Z])/g, " $1")}:
            </label>
            <input
              type="number"
              value={value}
              step="0.01"
              onChange={(e) =>
                setCostConfig({
                  ...costConfig,
                  [key]: parseFloat(e.target.value),
                })
              }
            />
          </div>
        ))}
      </div>

      <input type="file" accept=".csv" onChange={handleFileUpload} />

      <button
        onClick={handleGetMatrix}
        disabled={loadingMatrix || loadingGeocode || coordinates.length < 2}
      >
        {loadingMatrix
          ? "Loading Matrix..."
          : loadingGeocode
          ? "Geocoding..."
          : "Get Distance & Duration Matrix"}
      </button>

      {matrixError && (
        <p style={{ color: "red" }}>Matrix API Error: {matrixError}</p>
      )}

      {totals && (
        <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
          Total Trip Duration: {totals.durationMinutes} minutes <br />
          Total Trip Distance: {totals.distanceKm} km
        </div>
      )}

      <MatrixTable
        postcodes={postcodes}
        durations={durationMatrix}
        distances={distanceMatrix}
        prices={pricesMatrix} // Pass prices to table
      />
    </div>
  );
}

export default App;
