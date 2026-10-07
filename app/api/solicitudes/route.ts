import { NextRequest, NextResponse } from 'next/server';
import { leerDB, guardarDB } from '@/lib/db';
import type { BloqueHorario, Modalidad, Solicitud } from '@/lib/types';

const MODALIDADES: Array<Modalidad | 'cualquiera'> = [
  'presencial',
  'virtual',
  'ambos',
  'cualquiera',
];

type NuevaSolicitud = Omit<Solicitud, 'id' | 'creadaEn' | 'asignacionId'>;

type ValidacionSolicitud =
  | { ok: false; error: string }
  | { ok: true; solicitud: NuevaSolicitud };

function validarSolicitud(body: unknown): ValidacionSolicitud {
  const b = body as Record<string, unknown> | null;
  if (!b) return { ok: false, error: 'Cuerpo de la solicitud inválido.' };

  const { estudiante, materia, bloques, preferencias } = b;

  if (typeof estudiante !== 'string' || !estudiante.trim()) {
    return { ok: false, error: 'El nombre del estudiante es obligatorio.' };
  }
  if (typeof materia !== 'string' || !materia.trim()) {
    return { ok: false, error: 'La materia es obligatoria.' };
  }
  if (!Array.isArray(bloques) || bloques.length === 0) {
    return { ok: false, error: 'Debe registrar al menos un bloque de horario.' };
  }
  for (const bloque of bloques) {
    const x = bloque as Record<string, unknown>;
    if (
      typeof x?.inicio !== 'number' ||
      typeof x?.fin !== 'number' ||
      x.fin <= x.inicio
    ) {
      return { ok: false, error: 'Cada bloque debe tener una hora de inicio menor a la de fin.' };
    }
  }

  const p = (preferencias ?? {}) as Record<string, unknown>;
  const modalidad = typeof p.modalidad === 'string' ? p.modalidad : 'cualquiera';
  if (!MODALIDADES.includes(modalidad as (typeof MODALIDADES)[number])) {
    return { ok: false, error: 'Preferencia de modalidad inválida.' };
  }

  return {
    ok: true,
    solicitud: {
      estudiante: estudiante.trim(),
      materia: materia.trim(),
      bloques: bloques as BloqueHorario[],
      preferencias: {
        modalidad: modalidad as Modalidad | 'cualquiera',
        prefiereExperto: Boolean(p.prefiereExperto),
      },
    },
  };
}

export async function GET() {
  const db = await leerDB();
  return NextResponse.json(db.solicitudes);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const v = validarSolicitud(body);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 });
  }

  const db = await leerDB();
  const solicitud: Solicitud = {
    ...v.solicitud,
    id: `s-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    creadaEn: new Date().toISOString(),
    asignacionId: null,
  };
  db.solicitudes.push(solicitud);
  await guardarDB(db);

  return NextResponse.json(solicitud, { status: 201 });
}
