// Map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLES, MapStyleKey } from "../models/map";
import { useMapController } from "../controllers/useMapController";

export default function Map() {
  const { 
    mapContainer, selectedStyle, setSelectedStyle,
    isFormOpen, setIsFormOpen, selectedCoords, formLocationId,
    isLocationViewOpen, setIsLocationViewOpen, selectedLocationData,
    setSelectedLocationData, categorias, handleSubmitLugar
  } = useMapController();

  // Función para abrir el formulario desde el panel de Ver Localización
  const handleAgregarAqui = () => {
    if (!selectedLocationData) return;
    setIsLocationViewOpen(false); // Cerramos el panel de vista
    // Seteamos las coordenadas al punto exacto
    // (AQUÍ NECESITAS SETEAR EL ESTADO DE formLocationId en el Controlador, he añadido un truco abajo)
    setIsFormOpen(true); // Abrimos el formulario
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
      
      {/* Menu desplegable */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, background: "white", padding: "8px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value as MapStyleKey)} style={{ padding: "6px", borderRadius: "6px", color:"black" }}>
          {Object.keys(MAP_STYLES).map((style) => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>

      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* 1. PANEL DESLIZANTE: VER LOCALIZACIÓN (EL NUEVO) */}
      <div
        style={{
          ...bottomSheetStyle,
          transform: isLocationViewOpen ? "translateY(0)" : "translateY(100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#333" }}>Lugares registrados</h2>
          <button 
            onClick={() => {
              setIsLocationViewOpen(false);
              setSelectedLocationData(null);
            }} 
            style={closeButtonStyle}>
            ×
          </button>
        </div>

        {selectedLocationData && (
          <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#666" }}>
            ID Localización: #{selectedLocationData.id_localizacion}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "40vh", overflowY: "auto", marginBottom: "16px" }}>
          {selectedLocationData?.listaLugares.map((lugar) => (
            <div key={lugar.id} style={{ padding: "12px", border: "1px solid #eee", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
               <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: lugar.color_categoria || '#ccc' }} />
               <div>
                 <h4 style={{ margin: 0, color: "#333" }}>{lugar.nombre}</h4>
                 <span style={{ fontSize: "0.8rem", color: "#666" }}>{lugar.nombre_categoria}</span>
               </div>
            </div>
          ))}
        </div>

        {/* BOTÓN PARA AGREGAR NUEVO LUGAR A ESTA LOCALIZACIÓN */}
        <button onClick={handleAgregarAqui} style={primaryButtonStyle}>
          Agregar otro lugar a esta localización
        </button>
      </div>


      {/* 2. PANEL DESLIZANTE: AÑADIR LUGAR (EL ORIGINAL) */}
      <div
        style={{
          ...bottomSheetStyle,
          transform: isFormOpen ? "translateY(0)" : "translateY(100%)",
        }}
      >
        <div style={{ width: "40px", height: "4px", backgroundColor: "#e5e7eb", borderRadius: "4px", margin: "0 auto 20px auto" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#333" }}>
            {selectedLocationData && !isLocationViewOpen ? "Añadir a Localización Existente" : "Añadir Nueva Localización"}
          </h2>
          <button onClick={() => setIsFormOpen(false)} style={closeButtonStyle}>×</button>
        </div>

        {/* Info Visual para saber qué estamos guardando */}
        <div style={{ background: "#f0fdf4", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}>
          {selectedLocationData && !isLocationViewOpen ? (
             <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534" }}>
               Guardando en ID Localización: <strong>#{selectedLocationData.id_localizacion}</strong>
             </p>
          ) : (
             <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534" }}>
               Creando nueva localización... <br/>
               <small>Lat: {selectedCoords?.lat.toFixed(5)}, Long: {selectedCoords?.long.toFixed(5)}</small>
             </p>
          )}
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "12px" }} onSubmit={handleSubmitLugar}>
          
          {/* Añadido name="nombre" */}
          <input name="nombre" type="text" placeholder="Nombre del lugar" style={inputStyle} required />
          
          {/* El select ya tiene name="id_categoria" */}
          <select name="id_categoria" style={inputStyle} required defaultValue="">
            <option value="" disabled>Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.8rem", color: "#666" }}>Inicio</label>
              {/* Añadido name="hora_inicio" */}
              <input name="hora_inicio" type="time" style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.8rem", color: "#666" }}>Fin</label>
              {/* Añadido name="hora_fin" */}
              <input name="hora_fin" type="time" style={inputStyle} required />
            </div>
          </div>
          
          {/* Añadido name="notas" */}
          <textarea name="notas" placeholder="Notas u observaciones..." rows={3} style={{ ...inputStyle, resize: "none" }} />
          
          <button type="submit" style={primaryButtonStyle}>
            Guardar Lugar
          </button>
        </form>
      </div>

    </div>
  );
}

const bottomSheetStyle = {
  position: "absolute" as const,
  bottom: 0,
  left: 0,
  width: "100%",
  backgroundColor: "#ffffff", // Forzamos fondo blanco puro
  color: "#111827", // Forzamos texto general a gris oscuro/negro
  transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)", // Animación estilo "resorte" más natural
  borderTopLeftRadius: "28px",
  borderTopRightRadius: "28px",
  boxShadow: "0 -8px 30px rgba(0,0,0,0.12)", // Sombra más difuminada y elegante
  zIndex: 20,
  padding: "28px 24px 32px 24px", // Más espacio abajo para la barra de navegación del celular
  maxHeight: "85vh",
  overflowY: "auto" as const,
  display: "flex",
  flexDirection: "column" as const,
  boxSizing: "border-box" as const,
};

const inputStyle = {
  width: "100%", 
  padding: "14px 16px", // Más altura para que los dedos toquen fácil
  borderRadius: "12px", // Bordes más redondeados (Modern UI)
  border: "1px solid #e5e7eb", // Borde gris súper suave
  backgroundColor: "#f9fafb", // Fondo gris ultra claro (crea contraste)
  color: "#111827", // Texto siempre oscuro, sin importar el tema del OS
  fontSize: "1rem", 
  boxSizing: "border-box" as const,
  outline: "none", // Evita el borde azul raro en algunos navegadores
  transition: "border-color 0.2s, background-color 0.2s", // Animación suave al hacer click
};

const primaryButtonStyle = {
  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", // Gradiente sutil
  color: "#ffffff", 
  padding: "16px", // Botón más grande y fácil de presionar
  borderRadius: "14px", // Botón más redondeado
  border: "none", 
  fontWeight: "600", // Semi-bold en lugar de negrita pura
  fontSize: "1.05rem",
  marginTop: "16px", 
  cursor: "pointer", 
  width: "100%",
  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)", // Sombra que brilla del color del botón
  transition: "transform 0.1s, box-shadow 0.1s", // Efecto de hundirse al presionar
};

const closeButtonStyle = {
  background: "#f3f4f6", // Círculo gris de fondo
  border: "none", 
  width: "32px",
  height: "32px",
  borderRadius: "50%", // Botón redondo
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "1.2rem", 
  fontWeight: "bold", 
  color: "#6b7280", // X gris oscuro
  cursor: "pointer"
};