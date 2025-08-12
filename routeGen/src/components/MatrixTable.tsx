import type { PostcodeData, MatrixTableProps } from "../types";

export default function MatrixTable({
  postcodes,
  durations,
  distances,
  prices,
}: MatrixTableProps) {
  if (!durations || !distances) return null;

  const tableStyle: React.CSSProperties = {
    borderCollapse: "separate",
    borderSpacing: "2px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginTop: "1rem",
    width: "100%",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#495057",
    color: "white",
    padding: "12px 8px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "14px",
    border: "1px solid #dee2e6",
  };

  const rowHeaderStyle: React.CSSProperties = {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "12px 8px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "14px",
    border: "1px solid #dee2e6",
  };

  const cellStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "10px 8px",
    textAlign: "center",
    fontSize: "12px",
    border: "1px solid #dee2e6",
    lineHeight: "1.4",
  };

  const diagonalCellStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: "#e9ecef",
    fontStyle: "italic",
    color: "#6c757d",
  };

  return (
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerStyle}>From \ To</th>
            {postcodes.map((pc: PostcodeData, i: number) => (
              <th key={i} style={headerStyle}>
                {pc.Postcode}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {postcodes.map((fromPc: PostcodeData, i: number) => (
            <tr key={i}>
              <td style={rowHeaderStyle}>
                <strong>{fromPc.Postcode}</strong>
              </td>
              {postcodes.map((_: PostcodeData, j: number) => (
                <td key={j} style={i === j ? diagonalCellStyle : cellStyle}>
                  {i === j ? (
                    "—"
                  ) : (
                    <>
                      <div style={{ fontWeight: "500", color: "#495057" }}>
                        {(durations[i][j] / 60).toFixed(1)} min
                      </div>
                      <div style={{ fontSize: "11px", color: "#6c757d" }}>
                        {(distances[i][j] / 1000).toFixed(1)} km
                      </div>
                      {prices && (
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#28a745",
                            marginTop: "2px",
                          }}
                        >
                          £{prices[i][j].toFixed(2)}
                        </div>
                      )}
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
