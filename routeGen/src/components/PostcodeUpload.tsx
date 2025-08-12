import Papa from "papaparse";
import type { PostcodeData } from "../types";

interface PostcodeUploadProps {
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

export default function PostcodeUpload({
  postcodes,
  setPostcodes,
  loadingGeocode,
  setLoadingGeocode,
  geocode,
  coordinates,
  loadingMatrix,
  matrixError,
  onGenerateMatrix,
}: PostcodeUploadProps) {
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
          📋 Required CSV Format
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
          onClick={onGenerateMatrix}
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
            ? "📍 Geocoding..."
            : "🚀 Generate Matrix"}
        </button>
      </div>

      {matrixError && <div style={errorStyle}>⚠️ {matrixError}</div>}
    </div>
  );
}
