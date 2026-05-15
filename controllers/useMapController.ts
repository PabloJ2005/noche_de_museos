// useMapController.ts
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLES, MapStyleKey, INITIAL_MAP_CONFIG, agruparLugares } from "../models/map";

export function useMapController() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedStyle, setSelectedStyle] = useState<MapStyleKey>("Streets");
  
  // NUEVOS ESTADOS PARA EL FORMULARIO
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; long: number } | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.Streets,
      center: INITIAL_MAP_CONFIG.center,
      zoom: INITIAL_MAP_CONFIG.zoom,
    });

    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", async () => {
      map.resize();

      try {
        const response = await fetch('/api/lugar'); 
        if (!response.ok) throw new Error("Error al obtener lugares");
        const json = await response.json();

        const lugaresAgrupados = agruparLugares(json.data || []);

        for (const lugar of lugaresAgrupados) {
          const el = document.createElement('div');
          el.style.backgroundColor = lugar.color;
          el.style.width = lugar.count > 1 ? '28px' : '20px';
          el.style.height = lugar.count > 1 ? '28px' : '20px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          el.style.display = 'flex';
          el.style.justifyContent = 'center';
          el.style.alignItems = 'center';
          el.style.color = 'white';
          el.style.fontWeight = 'bold';
          el.style.fontSize = '12px';

          if (lugar.count > 1) {
            el.innerText = lugar.count.toString();
          }

          // EVITAR QUE AL TOCAR UNA BURBUJA SE ABRA EL FORMULARIO DEL MAPA
          el.addEventListener('click', (e) => {
            e.stopPropagation(); 
            // Aquí en el futuro podrías abrir un modal para ver los detalles del lugar
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([lugar.lat, lugar.long]) // <-- Mantén aquí la corrección que hicimos antes
            .addTo(map);
            
          markersRef.current.push(marker);
        }

      } catch (error) {
        console.error("Error cargando puntos:", error);
      }
    });

    // EVENTO CLICK DEL MAPA (Solo funciona si es un toque rápido, ignora drags)
    map.on('click', (e) => {
      // Obtenemos lat y long del punto exacto donde se tocó
      const { lat, lng } = e.lngLat;
      
      setSelectedCoords({ lat: lat, long: lng });
      setIsFormOpen(true); // Abrimos el formulario deslizante
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(MAP_STYLES[selectedStyle]);
  }, [selectedStyle]);

  // Exportamos los nuevos estados a la vista
  return {
    mapContainer,
    selectedStyle,
    setSelectedStyle,
    isFormOpen,
    setIsFormOpen,
    selectedCoords,
  };
}