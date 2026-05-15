// useMapController.ts
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLES, MapStyleKey, INITIAL_MAP_CONFIG, agruparLugares, LugarAgrupado, Categoria } from "../models/map";

export function useMapController() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedStyle, setSelectedStyle] = useState<MapStyleKey>("Streets");
  
  // ESTADOS DEL FORMULARIO DE "AÑADIR LUGAR"
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; long: number } | null>(null);
  const [formLocationId, setFormLocationId] = useState<number | null>(null); // Null si es nuevo, Número si ya existe

  // ESTADOS DEL PANEL DE "VER LOCALIZACIÓN"
  const [isLocationViewOpen, setIsLocationViewOpen] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState<LugarAgrupado | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    async function cargarCategorias() {
      try {
        const response = await fetch('/api/categoria');
        if (response.ok) {
          const json = await response.json();
          setCategorias(json.data || []);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    }
    cargarCategorias();
  }, []);

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
          el.style.cursor = 'pointer';

          if (lugar.count > 1) {
            el.innerText = lugar.count.toString();
          }

          // EVENTO CLICK DEL MARCADOR: Abre el panel de Ver Localización
          el.addEventListener('click', (e) => {
            e.stopPropagation(); 
            setSelectedLocationData(lugar); // Cargamos los datos
            setIsFormOpen(false); // Cerramos el otro panel si estaba abierto
            setIsLocationViewOpen(true); // Abrimos este panel
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([lugar.long, lugar.lat]) // <-- CUIDADO AQUI (Asegurate que se mantenga correcto según tu BD)
            .addTo(map);
            
          markersRef.current.push(marker);
        }

      } catch (error) {
        console.error("Error cargando puntos:", error);
      }
    });

    // EVENTO CLICK DEL MAPA: Abre el formulario para una NUEVA localización
    map.on('click', (e) => {
      setIsLocationViewOpen(false); // Cerramos el panel de Ver Localización
      setFormLocationId(null); // Reiniciamos el ID a null (porque es nuevo)
      setSelectedCoords({ lat: e.lngLat.lat, long: e.lngLat.lng });
      setIsFormOpen(true);
      setSelectedLocationData(null);
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

  const handleSubmitLugar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Extraemos todos los datos del formulario usando FormData
    const formData = new FormData(e.currentTarget);
    const datosLugar = {
      nombre: formData.get("nombre") as string,
      id_categoria: formData.get("id_categoria") as string,
      hora_inicio: formData.get("hora_inicio") as string,
      hora_fin: formData.get("hora_fin") as string,
      notas: formData.get("notas") as string,
    };

    try {
      let idLocalizacionFinal = selectedLocationData?.id_localizacion; // Null si no existe

      // 2. Si NO hay ID de localización, pero hay coordenadas, CREAMOS la localización primero
      if (!idLocalizacionFinal && selectedCoords) {
        // Asumiendo que tienes un POST en /api/localizacion
        const resLocalizacion = await fetch('/api/localizacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: selectedCoords.lat.toString(),
            long: selectedCoords.long.toString()
          })
        });

        if (!resLocalizacion.ok) throw new Error("Error al crear la localización");
        
        const dataLocalizacion = await resLocalizacion.json();
        idLocalizacionFinal = dataLocalizacion.data.id; // Asegúrate de que tu API devuelve el nuevo ID aquí
      }

      // 3. Si por alguna razón no pudimos obtener el ID, cancelamos
      if (!idLocalizacionFinal) throw new Error("No se pudo obtener el ID de la localización");

      // 4. CREAMOS EL LUGAR relacionándolo con la localización
      const resLugar = await fetch('/api/lugar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datosLugar,
          id_localizacion: idLocalizacionFinal // Añadimos el ID que conseguimos
        })
      });

      if (!resLugar.ok) throw new Error("Error al crear el lugar");

      // 5. ¡Éxito! Cerramos el formulario, limpiamos memoria y (opcional) recargamos la página
      setIsFormOpen(false);
      setSelectedLocationData(null);
      alert("¡Lugar guardado con éxito!");
      
      // La forma más fácil de ver el nuevo lugar es recargar la pantalla
      // En una app avanzada podrías inyectar el punto directo al mapa sin recargar
      window.location.reload(); 

    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar los datos.");
    }
  };

  // Exportamos los estados
  return {
    mapContainer,
    selectedStyle,
    setSelectedStyle,
    // Panel Formulario
    isFormOpen,
    setIsFormOpen,
    selectedCoords,
    formLocationId,
    // Panel Ver Localización
    isLocationViewOpen,
    setIsLocationViewOpen,
    selectedLocationData,
    setSelectedLocationData,
    categorias,
    handleSubmitLugar
  };
}