import { pool } from '../../../lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {id_categoria, id_localizacion, nombre, hora_inicio, hora_fin, notas} = body

    if (!id_localizacion || !id_localizacion || !nombre) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO lugar (id_categoria, id_localizacion, nombre, hora_inicio, hora_fin, notas)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_categoria, id_localizacion, nombre, hora_inicio, hora_fin, notas]
    )

    return NextResponse.json({
      message: "exito",
      data: result.rows[0], 
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}
export async function GET() {
  try {
    const query = `
    SELECT 
        l.id,
        l.nombre,
        c.categoria AS nombre_categoria, 
        c.color AS color_categoria,
        loc.lat, 
        loc.long,
        loc.id AS id_localizacion
    FROM lugar l
    LEFT JOIN categoria_lugar c ON l.id_categoria = c.id
    LEFT JOIN localizacion loc ON l.id_localizacion = loc.id
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