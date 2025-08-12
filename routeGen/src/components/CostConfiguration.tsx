import type { CostConfig } from "../types";

interface CostConfigurationProps {
  costConfig: CostConfig;
  setCostConfig: (config: CostConfig) => void;
}

export default function CostConfiguration({
  costConfig,
  setCostConfig,
}: CostConfigurationProps) {
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

  return (
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
  );
}
