import { NextResponse } from 'next/server';
import { crearSeed } from '@/lib/seed';
import { guardarDB } from '@/lib/db';

/** Restablece la base de datos a los datos de ejemplo del seed. */
export async function POST() {
  const db = crearSeed();
  await guardarDB(db);
  return NextResponse.json({
    mensaje: 'Datos restablecidos al seed de ejemplo.',
    totales: {
      tutores: db.tutores.length,
      solicitudes: db.solicitudes.length,
      asignaciones: db.asignaciones.length,
    },
  });
}
