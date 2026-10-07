import type {
  Asignacion,
  BloqueHorario,
  MatchResultado,
  PreferenciasEstudiante,
  ResultadoMatch,
  Solicitud,
  Tutor,
} from './types';

/**
 * PESOS DEL ALGORITMO (deben sumar 100). Ajustables aquí.
 * - horario: % de traslape entre la disponibilidad del estudiante y del tutor.
 * - experiencia: años de experiencia del tutor (más años => más peso).
 * - preferencias: cumple la modalidad preferida y/o preferencia por tutor experto.
 * - carga: balanceo de carga (penaliza tutores con muchas asignaciones activas).
 * La materia NO puntúa: es un filtro obligatorio (sin materia no hay matching).
 */
export const WEIGHTS = {
  horario: 35,
  experiencia: 25,
  preferencias: 20,
  carga: 20,
} as const;

export const CONFIG = {
  aniosParaScoreMaximo: 5, // años que equivalen a 100 puntos de experiencia
  aniosParaExperto: 3, // umbral para considerar "experto" en preferencias
  cargaMaxima: 5, // asignaciones activas que saturan a un tutor
} as const;

export interface Solapaje {
  horas: number;
  bloques: number;
}

/** Calcula el traslape total (en horas y bloques) entre dos disponibilidades. */
export function calcularSolapaje(
  a: BloqueHorario[],
  b: BloqueHorario[],
): Solapaje {
  let horas = 0;
  let bloques = 0;
  for (const ba of a) {
    for (const bb of b) {
      if (ba.dia !== bb.dia) continue;
      const inicio = Math.max(ba.inicio, bb.inicio);
      const fin = Math.min(ba.fin, bb.fin);
      if (fin > inicio) {
        horas += fin - inicio;
        bloques += 1;
      }
    }
  }
  return { horas, bloques };
}

function horasTotales(bloques: BloqueHorario[]): number {
  return bloques.reduce((acc, b) => acc + Math.max(0, b.fin - b.inicio), 0);
}

export function descripcionHorarios(bloques: BloqueHorario[]): string {
  if (bloques.length === 0) return 'sin horario definido';
  return bloques
    .map((b) => `${b.dia} ${b.inicio}:00–${b.fin}:00`)
    .join(', ');
}

/** Experiencia: 0 años => 0 pts, CONFIG.aniosParaScoreMaximo años => 100 pts (lineal). */
export function scoreExperiencia(anios: number): number {
  return Math.min(
    100,
    Math.round((Math.max(0, anios) / CONFIG.aniosParaScoreMaximo) * 100),
  );
}

/**
 * Preferencias: promedio del cumplimiento de cada preferencia activa.
 * Si el estudiante no define preferencias, el puntaje es neutro (100).
 */
export function scorePreferencias(
  tutor: Tutor,
  pref: PreferenciasEstudiante,
): number {
  let puntos = 0;
  let criterios = 0;

  if (pref.modalidad && pref.modalidad !== 'cualquiera') {
    criterios += 1;
    const coincide =
      tutor.modalidad === 'ambos' || tutor.modalidad === pref.modalidad;
    puntos += coincide ? 100 : 0;
  }

  if (pref.prefiereExperto) {
    criterios += 1;
    puntos +=
      tutor.aniosExperiencia >= CONFIG.aniosParaExperto
        ? 100
        : Math.round(
            (tutor.aniosExperiencia / CONFIG.aniosParaExperto) * 100,
          );
  }

  return criterios === 0 ? 100 : Math.round(puntos / criterios);
}

/** Balanceo de carga: 100 sin asignaciones, decrece hasta 0 en CONFIG.cargaMaxima. */
export function scoreCarga(asignacionesActivas: number): number {
  const factor = Math.min(1, asignacionesActivas / CONFIG.cargaMaxima);
  return Math.round(100 - factor * 100);
}

/**
 * Calcula el ranking de tutores compatibles con desglose por criterio.
 * Filtros obligatorios: materia y traslape de horario.
 */
export function calcularRanking(
  tutores: Tutor[],
  solicitud: Pick<Solicitud, 'materia' | 'bloques' | 'preferencias'>,
  asignaciones: Asignacion[],
): ResultadoMatch[] {
  const materia = solicitud.materia.trim().toLowerCase();
  const totalHorasEstudiante = horasTotales(solicitud.bloques);

  return tutores
    .filter((t) =>
      t.materias.some((m) => m.trim().toLowerCase() === materia),
    )
    .map((tutor) => {
      const solapaje = calcularSolapaje(tutor.bloques, solicitud.bloques);
      const carga = asignaciones.filter((a) => a.tutorId === tutor.id).length;

      const desglose: ResultadoMatch['desglose'] = {
        horario:
          totalHorasEstudiante > 0
            ? Math.min(
                100,
                Math.round((solapaje.horas / totalHorasEstudiante) * 100),
              )
            : 0,
        experiencia: scoreExperiencia(tutor.aniosExperiencia),
        preferencias: scorePreferencias(tutor, solicitud.preferencias),
        carga: scoreCarga(carga),
      };

      const scoreTotal = Math.round(
        (WEIGHTS.horario * desglose.horario +
          WEIGHTS.experiencia * desglose.experiencia +
          WEIGHTS.preferencias * desglose.preferencias +
          WEIGHTS.carga * desglose.carga) /
          100,
      );

      return {
        tutorId: tutor.id,
        tutorNombre: tutor.nombre,
        scoreTotal,
        desglose,
        traslapeHoras: solapaje.horas,
        traslapeBloques: solapaje.bloques,
        asignacionesActivas: carga,
      };
    })
    .filter((r) => r.traslapeHoras > 0)
    .sort(
      (a, b) =>
        b.scoreTotal - a.scoreTotal ||
        b.desglose.experiencia - a.desglose.experiencia ||
        a.asignacionesActivas - b.asignacionesActivas ||
        a.tutorNombre.localeCompare(b.tutorNombre),
    );
}

function construirJustificacion(
  tutor: Tutor,
  resultado: ResultadoMatch,
  materia: string,
  pref: PreferenciasEstudiante,
): string {
  const partes: string[] = [];
  partes.push(`domina ${materia}`);
  partes.push(
    `tiene ${tutor.aniosExperiencia} año(s) de experiencia (nivel ${tutor.nivel})`,
  );
  partes.push(
    `coincide contigo en ${resultado.traslapeBloques} bloque(s) (${resultado.traslapeHoras} h de traslape)`,
  );

  if (pref.modalidad && pref.modalidad !== 'cualquiera') {
    const cumple =
      tutor.modalidad === 'ambos' || tutor.modalidad === pref.modalidad;
    partes.push(
      cumple
        ? `cumple tu preferencia de modalidad ${pref.modalidad}`
        : `su modalidad (${tutor.modalidad}) no coincide exactamente con tu preferencia (${pref.modalidad})`,
    );
  } else {
    partes.push(
      `ofrece clases ${
        tutor.modalidad === 'ambos'
          ? 'presenciales y virtuales'
          : tutor.modalidad === 'presencial'
            ? 'presenciales'
            : 'virtuales'
      }`,
    );
  }

  partes.push(
    resultado.asignacionesActivas === 0
      ? 'no tiene asignaciones activas'
      : `lleva ${resultado.asignacionesActivas} asignación(es) activa(s)`,
  );

  return `Se seleccionó a ${tutor.nombre} porque ${partes.join(
    ', ',
  )}. Puntuación total: ${resultado.scoreTotal}/100.`;
}

/**
 * Evalúa una solicitud contra el pool de tutores y devuelve:
 * - ranking completo con desglose,
 * - recomendado (mayor score),
 * - justificación en lenguaje natural,
 * - motivoRechazo cuando no hay compatibles (con sugerencias).
 */
export function evaluarSolicitud(
  tutores: Tutor[],
  solicitud: Pick<Solicitud, 'materia' | 'bloques' | 'preferencias'>,
  asignaciones: Asignacion[],
): MatchResultado {
  if (tutores.length === 0) {
    return {
      ranking: [],
      recomendado: null,
      justificacion: '',
      motivoRechazo:
        'Aún no hay tutores registrados. Registra al menos un tutor antes de crear una solicitud.',
    };
  }

  const ranking = calcularRanking(tutores, solicitud, asignaciones);
  const conMateria = tutores.filter((t) =>
    t.materias.some(
      (m) => m.trim().toLowerCase() === solicitud.materia.trim().toLowerCase(),
    ),
  );

  if (conMateria.length === 0) {
    const disponibles = Array.from(
      new Set(tutores.flatMap((t) => t.materias.map((m) => m.trim()))),
    ).sort();
    return {
      ranking: [],
      recomendado: null,
      justificacion: '',
      motivoRechazo: `Ningún tutor domina "${solicitud.materia}". Materias con cobertura actual: ${
        disponibles.join(', ') || 'ninguna'
      }.`,
    };
  }

  if (ranking.length === 0) {
    const nombres = conMateria.map((t) => t.nombre).join(', ');
    return {
      ranking: [],
      recomendado: null,
      justificacion: '',
      motivoRechazo: `Hay ${conMateria.length} tutor(es) que dominan "${solicitud.materia}" (${nombres}), pero ninguno coincide con tu disponibilidad: ${descripcionHorarios(
        solicitud.bloques,
      )}. Sugerencia: agrega más bloques de horario o prueba con otro día.`,
    };
  }

  const recomendado = ranking[0];
  const tutor = tutores.find((t) => t.id === recomendado.tutorId);
  let justificacion = tutor
    ? construirJustificacion(tutor, recomendado, solicitud.materia, solicitud.preferencias)
    : '';

  const empate = ranking.length > 1 && ranking[1].scoreTotal === recomendado.scoreTotal;
  if (empate) {
    justificacion += ` Empate técnico con ${ranking[1].tutorNombre}: se desempató por mayor experiencia y menor carga.`;
  }

  return { ranking, recomendado, justificacion, motivoRechazo: null };
}
