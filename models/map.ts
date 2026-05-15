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

type LugarAgrupado = {
  lat: number;
  long: number;
  count: number;
  color: string;
};

// Función simplificada: Solo agrupa y devuelve un array normal
export function agruparLugares(lugares: any[]): LugarAgrupado[] {
  const agrupados = lugares.reduce((acc, lugar) => {
    const llave = `${lugar.lat},${lugar.long}`;

    if (!acc[llave]) {
      acc[llave] = {
        lat: Number(lugar.lat),
        long: Number(lugar.long),
        count: 0,
        color: lugar.color_categoria || '#cccccc', 
      };
    }

    acc[llave].count += 1;

    if (acc[llave].count > 1) {
      acc[llave].color = '#ff0000'; // Rojo si hay más de 1
    }

    return acc;
  }, {} as Record<string, LugarAgrupado>);

  return Object.values(agrupados);
}