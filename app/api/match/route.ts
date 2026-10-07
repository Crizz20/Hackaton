import { NextRequest, NextResponse } from 'next/server';
import { leerDB } from '@/lib/db';
import { evaluarSolicitud } from '@/lib/matching';
import type { PreferenciasEstudiante } from '@/lib/types';

/** Recomendación para una solicitud ya registrada. */
export async function GET(request: NextRequest) {
  const solicitudId = request.nextUrl.searchParams.get('solicitudId');
  if (!solicitudId) {
    return NextResponse.json({ error: 'Falta el parámetro solicitudId.' }, { status: 400 });
  }

  const db = await leerDB();
  const solicitud = db.solicitudes.find((s) => s.id === solicitudId);
  if (!solicitud) {
    return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });
  }

  const match = evaluarSolicitud(db.tutores, solicitud, db.asignaciones);
  const recomendado = match.recomendado;
  const tutor = recomendado
    ? db.tutores.find((t) => t.id === recomendado.tutorId) ?? null
    : null;
  const asignacion = db.asignaciones.find((a) => a.solicitudId === solicitudId) ?? null;

  return NextResponse.json({ solicitud, match, tutor, asignacion });
}

/** Evaluación en vivo (sin guardar) a partir de un cuerpo tipo solicitud. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const b = body as Record<string, unknown> | null;
  if (!b || typeof b.materia !== 'string' || !Array.isArray(b.bloques)) {
    return NextResponse.json(
      { error: 'Se requiere materia y bloques en el cuerpo.' },
      { status: 400 },
    );
  }

  const db = await leerDB();
  const match = evaluarSolicitud(db.tutores, {
    materia: b.materia,
    bloques: b.bloques,
    preferencias:
      (b.preferencias as PreferenciasEstudiante | undefined) ?? {
        modalidad: 'cualquiera',
        prefiereExperto: false,
      },
  }, db.asignaciones);

  return NextResponse.json({ match });
}
