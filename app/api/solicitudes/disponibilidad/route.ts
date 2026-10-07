import { NextRequest, NextResponse } from 'next/server';
import { leerDB } from '@/lib/db';
import { calcularAlternativas } from '@/lib/alternativas';
import { calcularSolapaje } from '@/lib/matching';
import type { BloqueHorario, DisponibilidadRespuesta } from '@/lib/types';

/**
 * Endpoint público (estudiante): verifica si hay tutores que dominen la
 * materia con traslape de horario. Si no los hay, devuelve horarios
 * alternativos cercanos (sin nombres de tutores).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const b = body as Record<string, unknown> | null;

  const bloquesOk =
    Array.isArray(b?.bloques) &&
    (b?.bloques as unknown[]).every(
      (x) =>
        typeof (x as Record<string, unknown>)?.inicio === 'number' &&
        typeof (x as Record<string, unknown>)?.fin === 'number',
    );

  if (!b || typeof b.materia !== 'string' || !b.materia.trim() || !bloquesOk) {
    return NextResponse.json(
      { error: 'Se requiere materia y al menos un bloque de horario válido.' },
      { status: 400 },
    );
  }

  const bloques = b.bloques as BloqueHorario[];
  const materia = (b.materia as string).trim();

  const db = await leerDB();
  const tutoresMateria = db.tutores.filter((t) =>
    t.materias.some((m) => m.trim().toLowerCase() === materia.toLowerCase()),
  );

  // Caso 1: ningún tutor domina la materia.
  if (tutoresMateria.length === 0) {
    const respuesta: DisponibilidadRespuesta = {
      disponible: false,
      motivo: 'sin-materia',
      alternativas: [],
    };
    return NextResponse.json(respuesta);
  }

  // Caso 2: hay tutores con traslape de horario.
  const haySolapaje = tutoresMateria.some(
    (t) => calcularSolapaje(t.bloques, bloques).horas > 0,
  );
  if (haySolapaje) {
    const respuesta: DisponibilidadRespuesta = {
      disponible: true,
      alternativas: [],
    };
    return NextResponse.json(respuesta);
  }

  // Caso 3: hay tutores para la materia, pero no en ese horario.
  const alternativas = calcularAlternativas(db.tutores, materia, bloques);
  const respuesta: DisponibilidadRespuesta = {
    disponible: false,
    motivo: 'sin-horario',
    alternativas,
  };
  return NextResponse.json(respuesta);
}
