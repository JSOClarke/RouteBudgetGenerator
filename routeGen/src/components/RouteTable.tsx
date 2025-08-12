import type { RouteTableProps } from "../types";

export default function RouteTable({
  postcodes,
  durations,
  distances,
  prices,
  optimizedOrder,
}: RouteTableProps) {
  if (!durations || !distances || !prices || optimizedOrder.length === 0) {
    return null;
  }

  const order =
    optimizedOrder.length > 0
      ? optimizedOrder
      : Array.from({ length: postcodes.length }, (_, i) => i);

  // Calculate route legs
  const routeLegs = [];
  let cumulativeDistance = 0;
  let cumulativeDuration = 0;
  let cumulativeCost = 0;

  for (let i = 0; i < order.length - 1; i++) {
    const fromIndex = order[i];
    const toIndex = order[i + 1];
    const distance = distances[fromIndex][toIndex] / 1000; // Convert to km
    const duration = durations[fromIndex][toIndex] / 60; // Convert to minutes
    const cost = prices[fromIndex][toIndex];

    cumulativeDistance += distance;
    cumulativeDuration += duration;
    cumulativeCost += cost;

    routeLegs.push({
      step: i + 1,
      from: postcodes[fromIndex]?.Postcode || `Location ${fromIndex + 1}`,
      to: postcodes[toIndex]?.Postcode || `Location ${toIndex + 1}`,
      distance: distance,
      duration: duration,
      cost: cost,
      cumulativeDistance: cumulativeDistance,
      cumulativeDuration: cumulativeDuration,
      cumulativeCost: cumulativeCost,
    });
  }

  const tableStyle: React.CSSProperties = {
    borderCollapse: "separate",
    borderSpacing: "1px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    fontSize: "0.875rem",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#495057",
    color: "white",
    padding: "12px 8px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "0.8rem",
    border: "1px solid #dee2e6",
  };

  const cellStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "10px 8px",
    textAlign: "center",
    fontSize: "0.8rem",
    border: "1px solid #dee2e6",
    lineHeight: "1.4",
  };

  const routeCellStyle: React.CSSProperties = {
    ...cellStyle,
    textAlign: "left",
    fontWeight: "500",
  };

  const numberCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontFamily: "monospace",
  };

  const totalRowStyle: React.CSSProperties = {
    backgroundColor: "#e9ecef",
    fontWeight: "600",
    color: "#495057",
  };

  return (
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerStyle}>Step</th>
            <th style={headerStyle}>Route</th>
            <th style={headerStyle}>Distance (km)</th>
            <th style={headerStyle}>Duration (min)</th>
            <th style={headerStyle}>Cost (£)</th>
            <th style={headerStyle}>Total Distance</th>
            <th style={headerStyle}>Total Duration</th>
            <th style={headerStyle}>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {routeLegs.map((leg, index) => (
            <tr key={index}>
              <td style={cellStyle}>{leg.step}</td>
              <td style={routeCellStyle}>
                <span style={{ color: "#4a5568" }}>{leg.from}</span>
                <span style={{ margin: "0 8px", color: "#718096" }}>→</span>
                <span style={{ color: "#4a5568" }}>{leg.to}</span>
              </td>
              <td style={numberCellStyle}>{leg.distance.toFixed(1)}</td>
              <td style={numberCellStyle}>{leg.duration.toFixed(1)}</td>
              <td style={numberCellStyle}>£{leg.cost.toFixed(2)}</td>
              <td
                style={{
                  ...numberCellStyle,
                  color: "#2d3748",
                  fontWeight: "500",
                }}
              >
                {leg.cumulativeDistance.toFixed(1)}
              </td>
              <td
                style={{
                  ...numberCellStyle,
                  color: "#2d3748",
                  fontWeight: "500",
                }}
              >
                {leg.cumulativeDuration.toFixed(1)}
              </td>
              <td
                style={{
                  ...numberCellStyle,
                  color: "#28a745",
                  fontWeight: "600",
                }}
              >
                £{leg.cumulativeCost.toFixed(2)}
              </td>
            </tr>
          ))}
          <tr style={totalRowStyle}>
            <td style={{ ...cellStyle, ...totalRowStyle }} colSpan={2}>
              <strong>TOTAL TRIP</strong>
            </td>
            <td style={{ ...numberCellStyle, ...totalRowStyle }}>
              <strong>{cumulativeDistance.toFixed(1)}</strong>
            </td>
            <td style={{ ...numberCellStyle, ...totalRowStyle }}>
              <strong>{cumulativeDuration.toFixed(1)}</strong>
            </td>
            <td
              style={{ ...numberCellStyle, ...totalRowStyle, color: "#28a745" }}
            >
              <strong>£{cumulativeCost.toFixed(2)}</strong>
            </td>
            <td style={{ ...cellStyle, ...totalRowStyle }} colSpan={3}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
