import { NextRequest, NextResponse } from 'next/server';
import { leerDB, guardarDB } from '@/lib/db';
import { calcularRanking } from '@/lib/matching';
import type { Asignacion } from '@/lib/types';

/** Historial de asignaciones (más recientes primero). */
export async function GET() {
  const db = await leerDB();
  const asignaciones = [...db.asignaciones].sort((a, b) =>
    b.creadaEn.localeCompare(a.creadaEn),
  );
  return NextResponse.json(asignaciones);
}

/** Confirma la asignación de un tutor a una solicitud. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const b = body as Record<string, unknown> | null;
  const { solicitudId, tutorId } = b ?? {};

  if (typeof solicitudId !== 'string' || typeof tutorId !== 'string') {
    return NextResponse.json(
      { error: 'Se requieren solicitudId y tutorId.' },
      { status: 400 },
    );
  }

  const db = await leerDB();

  const solicitud = db.solicitudes.find((s) => s.id === solicitudId);
  if (!solicitud) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });
  }
  if (solicitud.asignacionId) {
    return NextResponse.json(
      { error: 'La solicitud ya tiene una asignación.' },
      { status: 409 },
    );
  }

  const tutor = db.tutores.find((t) => t.id === tutorId);
  if (!tutor) {
    return NextResponse.json({ error: 'Tutor no encontrado.' }, { status: 404 });
  }

  // Verifica compatibilidad real (materia + traslape de horario)
  const ranking = calcularRanking(db.tutores, solicitud, db.asignaciones);
  const resultado = ranking.find((r) => r.tutorId === tutorId);
  if (!resultado) {
    return NextResponse.json(
      { error: 'El tutor seleccionado no es compatible con esta solicitud (materia u horario).' },
      { status: 409 },
    );
  }

  const asignacion: Asignacion = {
    id: `a-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    solicitudId,
    tutorId,
    estudiante: solicitud.estudiante,
    materia: solicitud.materia,
    tutorNombre: tutor.nombre,
    score: resultado.scoreTotal,
    creadaEn: new Date().toISOString(),
  };

  db.asignaciones.push(asignacion);
  solicitud.asignacionId = asignacion.id;
  await guardarDB(db);

  return NextResponse.json(asignacion, { status: 201 });
}
