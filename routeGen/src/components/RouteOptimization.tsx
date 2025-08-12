import type { PostcodeData } from "../types";

interface RouteOptimizationProps {
  routeStrategy: string;
  setRouteStrategy: (strategy: string) => void;
  optimizedOrder: number[];
  postcodes: PostcodeData[];
  onOptimizeRoute: (strategy: string) => void;
}

export default function RouteOptimization({
  routeStrategy,
  setRouteStrategy,
  optimizedOrder,
  postcodes,
  onOptimizeRoute,
}: RouteOptimizationProps) {
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

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Route Optimization</h2>
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Optimization Strategy</label>
        <select
          value={routeStrategy}
          onChange={(e) => {
            setRouteStrategy(e.target.value);
            onOptimizeRoute(e.target.value);
          }}
          style={{
            ...inputStyle,
            marginTop: "0.5rem",
            cursor: "pointer",
          }}
        >
          <option value="original">Original Order (CSV sequence)</option>
          <option value="nearest">Nearest Neighbor (TSP approximation)</option>
          <option value="shortest">Shortest Distance First</option>
          <option value="fastest">Fastest Time First</option>
        </select>
      </div>

      <div style={{ fontSize: "0.875rem", color: "#718096" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Strategy Explanations:</strong>
        </div>
        <div style={{ marginBottom: "0.25rem" }}>
          • <strong>Original Order:</strong> Uses postcodes in CSV file order
        </div>
        <div style={{ marginBottom: "0.25rem" }}>
          • <strong>Nearest Neighbor:</strong> Always goes to closest unvisited
          location (good TSP approximation)
        </div>
        <div style={{ marginBottom: "0.25rem" }}>
          • <strong>Shortest Distance:</strong> Prioritizes shortest individual
          segments
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
  );
}
