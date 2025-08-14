import React, { useState, useEffect } from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  hasData: boolean;
  hasMatrix: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  hasData,
  hasMatrix,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false); // Reset mobile menu state on desktop
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarStyle: React.CSSProperties = {
    width: "280px",
    height: "100vh",
    position: "fixed",
    left: isMobile ? (isOpen ? "0" : "-280px") : "0",
    top: "0",
    backgroundColor: "white",
    color: "#2d3748",
    padding: "2rem 0",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    overflowY: "auto",
    borderRight: "1px solid #e2e8f0",
    transition: "left 0.3s ease-in-out",
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    display: isMobile && isOpen ? "block" : "none",
  };

  const mobileToggleStyle: React.CSSProperties = {
    position: "fixed",
    top: "1rem",
    left: "1rem",
    zIndex: 1001,
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem",
    fontSize: "1.25rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    display: isMobile ? "block" : "none",
    transition: "all 0.2s",
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#4299e1",
    marginBottom: "2rem",
    padding: "0 2rem",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "1rem",
  };

  const navItemStyle: React.CSSProperties = {
    display: "block",
    padding: "0.75rem 2rem",
    color: "#718096",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    borderLeft: "3px solid transparent",
  };

  const activeNavItemStyle: React.CSSProperties = {
    ...navItemStyle,
    color: "#4299e1",
    backgroundColor: "#ebf8ff",
    borderLeftColor: "#4299e1",
  };

  const disabledNavItemStyle: React.CSSProperties = {
    ...navItemStyle,
    color: "#cbd5e0",
    cursor: "not-allowed",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "1rem 2rem 0.5rem",
    marginTop: "1rem",
  };

  const navigationItems = [
    {
      id: "setup",
      label: "⚙️ Setup",
      items: [
        { id: "cost-config", label: "Cost Configuration", enabled: true },
        { id: "postcode-upload", label: "Postcode Upload", enabled: true },
      ],
    },
    {
      id: "analysis",
      label: "📊 Analysis",
      items: [
        {
          id: "route-optimization",
          label: "Route Optimization",
          enabled: hasMatrix,
        },
        { id: "route-breakdown", label: "Route Breakdown", enabled: hasMatrix },
        { id: "matrix-view", label: "Distance Matrix", enabled: hasMatrix },
      ],
    },
  ];

  const handleNavItemClick = (itemId: string) => {
    onSectionChange(itemId);
    if (isMobile) {
      setIsOpen(false); // Close sidebar on mobile after selection
    }
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        style={mobileToggleStyle}
        onClick={() => setIsOpen(!isOpen)}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#3182ce";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#4299e1";
        }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay for mobile */}
      <div style={overlayStyle} onClick={() => setIsOpen(false)} />

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={logoStyle}>JRDN OpenSource Route Planner</div>

        <nav>
          {navigationItems.map((section) => (
            <div key={section.id}>
              <div style={sectionHeaderStyle}>{section.label}</div>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  style={
                    !item.enabled
                      ? disabledNavItemStyle
                      : activeSection === item.id
                      ? activeNavItemStyle
                      : navItemStyle
                  }
                  onClick={() => item.enabled && handleNavItemClick(item.id)}
                  onMouseOver={(e) => {
                    if (item.enabled && activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = "#f7fafc";
                      e.currentTarget.style.color = "#4299e1";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (item.enabled && activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#718096";
                    }
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "2rem",
            right: "2rem",
            fontSize: "0.75rem",
            color: "#718096",
            textAlign: "center",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "1rem",
          }}
        >
          {hasData && (
            <div style={{ marginBottom: "0.5rem" }}>
              {hasData ? "Data loaded" : "No data"}
            </div>
          )}
          {hasMatrix && <div> Matrix generated</div>}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
