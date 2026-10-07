import { NextRequest, NextResponse } from 'next/server';
import { leerDB, guardarDB } from '@/lib/db';
import { COOKIE_ADMIN } from '@/lib/constantes';
import type { Tutor } from '@/lib/types';

const NIVELES = ['junior', 'intermedio', 'avanzado', 'experto'];
const MODALIDADES = ['presencial', 'virtual', 'ambos'];

function validarTutor(body: unknown) {
  const b = body as Record<string, unknown> | null;
  if (!b) return { ok: false, error: 'Cuerpo de la solicitud inválido.' };

  const { nombre, materias, bloques, aniosExperiencia, nivel, modalidad } = b;

  if (typeof nombre !== 'string' || !nombre.trim()) {
    return { ok: false, error: 'El nombre es obligatorio.' };
  }
  if (!Array.isArray(materias) || materias.length === 0) {
    return { ok: false, error: 'Debe registrar al menos una materia.' };
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
  if (typeof aniosExperiencia !== 'number' || aniosExperiencia < 0) {
    return { ok: false, error: 'Los años de experiencia deben ser un número mayor o igual a 0.' };
  }
  if (typeof nivel !== 'string' || !NIVELES.includes(nivel)) {
    return { ok: false, error: 'Nivel de experiencia inválido.' };
  }
  if (typeof modalidad !== 'string' || !MODALIDADES.includes(modalidad)) {
    return { ok: false, error: 'Modalidad inválida.' };
  }

  return {
    ok: true,
    tutor: {
      nombre: nombre.trim(),
      materias: (materias as string[])
        .map((m) => m.trim())
        .filter(Boolean),
      bloques,
      aniosExperiencia,
      nivel,
      modalidad,
    } as Omit<Tutor, 'id'>,
  };
}

export async function GET(req: NextRequest) {
  const db = await leerDB();
  const sesion = req.cookies.get(COOKIE_ADMIN)?.value;

  // Vista pública (estudiante): solo las materias para sugerencias,
  // sin exponer datos de los tutores.
  if (!sesion) {
    const materias = Array.from(
      new Set(db.tutores.flatMap((t) => t.materias.map((m) => m.trim()))),
    ).sort();
    return NextResponse.json({ materias });
  }

  // Vista coordinador: lista completa con carga actual.
  const tutores = db.tutores.map((t) => ({
    ...t,
  
    asignacionesActivas: db.asignaciones.filter((a) => a.tutorId === t.id).length,
  }));
  return NextResponse.json(tutores);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const v = validarTutor(body);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 });
  }

  const db = await leerDB();
  const tutor = {
  ...v.tutor,
  id: `t-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
} as Tutor;
  db.tutores.push(tutor);
  await guardarDB(db);

  return NextResponse.json(tutor, { status: 201 });
}
