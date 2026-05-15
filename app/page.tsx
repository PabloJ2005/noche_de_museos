"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLES = {
  Streets:
    "https://tiles.versatiles.org/assets/styles/colorful/style.json",

  Minimal:
    "https://tiles.openfreemap.org/styles/positron",

  Dark:
    "https://tiles.openfreemap.org/styles/fiord",
};

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [selectedStyle, setSelectedStyle] =
    useState<keyof typeof MAP_STYLES>("Streets");

  // Crear mapa
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[selectedStyle],
      center: [-68.15, -16.5],
      zoom: 13,
    });
    map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },

      trackUserLocation: true,
    }),
    "top-right"
  );

    // Controles de zoom
    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );


    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Cambiar estilo dinámicamente
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.setStyle(MAP_STYLES[selectedStyle]);
  }, [selectedStyle]);

  return (
    <div style={{ position: "relative" }}>
      {/* Menu desplegable */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          background: "white",
          padding: "8px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <select
          value={selectedStyle}
          onChange={(e) =>
            setSelectedStyle(
              e.target.value as keyof typeof MAP_STYLES
            )
          }
          style={{
            padding: "6px",
            borderRadius: "6px",
          }}
        >
          {Object.keys(MAP_STYLES).map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      {/* Mapa */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100vh",
        }}
      />
    </div>
  );
}