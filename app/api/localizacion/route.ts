import { pool } from '../../../lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {lat, long} = body

    if (!lat || !long) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO localizacion (lat, long)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [lat, long]
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
