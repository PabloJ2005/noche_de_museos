// map.model.ts

export const MAP_STYLES = {
  Streets: "https://tiles.versatiles.org/assets/styles/colorful/style.json",
  Minimal: "https://tiles.openfreemap.org/styles/positron",
  Dark: "https://tiles.openfreemap.org/styles/fiord",
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export const INITIAL_MAP_CONFIG = {
  center: [-68.15, -16.5] as [number, number],
  zoom: 13,
};

export type Categoria = {
  id_categoria: number;
  nombre_categoria: string;
  color_categoria: string;
};

// 1. Añadimos el array de lugares completos
export type LugarAgrupado = {
  id_localizacion: number;
  lat: number;
  long: number;
  count: number;
  color: string;
  listaLugares: any[]; // <-- AQUÍ
};

export function agruparLugares(lugares: any[]): LugarAgrupado[] {
  const agrupados = lugares.reduce((acc, lugar) => {
    const llave = `${lugar.lat},${lugar.long}`;

    if (!acc[llave]) {
      acc[llave] = {
        id_localizacion: lugar.id_localizacion,
        lat: Number(lugar.lat),
        long: Number(lugar.long),
        count: 0,
        color: lugar.color_categoria || '#cccccc',
        listaLugares: [], // <-- Inicializamos el array vacío
      };
    }

    acc[llave].count += 1;
    acc[llave].listaLugares.push(lugar); // <-- Guardamos el lugar completo

    if (acc[llave].count > 1) {
      acc[llave].color = '#ff0000';
    }

    return acc;
  }, {} as Record<string, LugarAgrupado>);

  return Object.values(agrupados);
}