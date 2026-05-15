// Map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLES, MapStyleKey } from "../models/map";
import { useMapController } from "../controllers/useMapController";

export default function Map() {
  const { 
    mapContainer, 
    selectedStyle, 
    setSelectedStyle,
    isFormOpen,      // <-- Importamos
    setIsFormOpen,   // <-- Importamos
    selectedCoords   // <-- Importamos
  } = useMapController();

  return (
    // Es importante que el overflow sea "hidden" aquí para que el formulario se oculte bien al bajar
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
      
      {/* Menu desplegable de estilos (se queda igual) */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, background: "white", padding: "8px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value as MapStyleKey)}
          style={{ padding: "6px", borderRadius: "6px" }}
        >
          {Object.keys(MAP_STYLES).map((style) => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>

      {/* Contenedor del Mapa */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* FORMULARIO DESLIZANTE (Bottom Sheet) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "white",
          // La magia está aquí: Si isFormOpen es true, sube a la posición 0. Si es false, se esconde al 100% hacia abajo
          transform: isFormOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Transición suave tipo Android
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
          zIndex: 20,
          padding: "24px",
          maxHeight: "80vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        {/* Encabezado del panel */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#333" }}>Añadir Lugar</h2>
          <button 
            onClick={() => setIsFormOpen(false)}
            style={{ background: "none", border: "none", fontSize: "1.5rem", fontWeight: "bold", color: "#888", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {/* Coordenadas capturadas (Solo lectura) */}
        {selectedCoords && (
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
            Lat: {selectedCoords.lat.toFixed(5)}, Long: {selectedCoords.long.toFixed(5)}
          </p>
        )}

        {/* Campos del Formulario */}
        <form style={{ display: "flex", flexDirection: "column", gap: "12px" }} onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Nombre del lugar" style={inputStyle} required />
          
          <select style={inputStyle} required defaultValue="">
            <option value="" disabled>Selecciona una categoría</option>
            <option value="1">Comida</option>
            <option value="2">Teatro</option>
            <option value="3">Música</option>
          </select>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.8rem", color: "#666" }}>Hora de Inicio</label>
              <input type="time" style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.8rem", color: "#666" }}>Hora de Fin</label>
              <input type="time" style={inputStyle} required />
            </div>
          </div>

          <textarea placeholder="Notas u observaciones..." rows={3} style={{ ...inputStyle, resize: "none" }} />

          <button 
            type="submit" 
            style={{ background: "#2563EB", color: "white", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", marginTop: "10px", cursor: "pointer" }}
          >
            Guardar Lugar
          </button>
        </form>
      </div>
    </div>
  );
}

// Un pequeño estilo reutilizable para los inputs
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  boxSizing: "border-box" as const,
};