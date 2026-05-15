import { pool } from '../../../lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const query = `
    SELECT 
        c.id AS id_categoria,
        c.categoria AS nombre_categoria, 
        c.color AS color_categoria
    FROM categoria_lugar c
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      message: "exito",
      data: result.rows, 
    });

  } catch (error) {
    console.error("Error obteniendo lugares:", error);

    return NextResponse.json(
      { error: "Error interno del servidor al obtener los datos" },
      { status: 500 }
    );
  }
}