import { calcularSolapaje } from './matching';
import { DIAS_SEMANA } from './types';
import type {
  AlternativaHorario,
  BloqueHorario,
  DiaSemana,
  Modalidad,
  Tutor,
} from './types';

const MAX_ALTERNATIVAS = 6;

interface Candidato {
  dia: DiaSemana;
  inicio: number;
  fin: number;
  modalidades: Set<Modalidad>;
}

/**
 * Calcula horarios alternativos a partir de los bloques libres de los
 * tutores que dominan la materia. Función pura (sin efectos secundarios),
 * fácil de probar con datos de prueba.
 *
 * Orden de cercanía al horario pedido por el estudiante:
 * 1. Mismo día, otro rango de horas (más cercano en tiempo primero).
 * 2. Días siguientes más próximos (distancia cíclica hacia adelante).
 * Elimina duplicados (mismo día + rango) y limita a MAX_ALTERNATIVAS.
 */
export function calcularAlternativas(
  tutores: Tutor[],
  materia: string,
  bloquesEstudiante: BloqueHorario[],
): AlternativaHorario[] {
  const materiaLC = materia.trim().toLowerCase();

  const tutoresMateria = tutores.filter((t) =>
    t.materias.some((m) => m.trim().toLowerCase() === materiaLC),
  );

  // Agrupa bloques libres por día + rango horario (elimina duplicados).
  const mapa = new Map<string, Candidato>();
  for (const tutor of tutoresMateria) {
    for (const bloque of tutor.bloques) {
      // Si el bloque ya traslapa con lo que pidió el estudiante,
      // sería un match directo, no una alternativa.
      if (calcularSolapaje([bloque], bloquesEstudiante).horas > 0) continue;

      const clave = `${bloque.dia}-${bloque.inicio}-${bloque.fin}`;
      const existente = mapa.get(clave);
      if (existente) {
        existente.modalidades.add(tutor.modalidad);
      } else {
        mapa.set(clave, {
          dia: bloque.dia,
          inicio: bloque.inicio,
          fin: bloque.fin,
          modalidades: new Set([tutor.modalidad]),
        });
      }
    }
  }

  // Distancia en días hacia adelante (cíclica): mismo día = 0.
  const distanciaDia = (dia: DiaSemana): number => {
    const idxC = DIAS_SEMANA.indexOf(dia);
    let mejor = Number.POSITIVE_INFINITY;
    for (const b of bloquesEstudiante) {
      const idxE = DIAS_SEMANA.indexOf(b.dia);
      const d = (idxC - idxE + DIAS_SEMANA.length) % DIAS_SEMANA.length;
      if (d < mejor) mejor = d;
    }
    return mejor;
  };

  // Distancia en horas respecto a la hora de inicio más cercana pedida.
  const distanciaHora = (inicio: number): number => {
    let mejor = Number.POSITIVE_INFINITY;
    for (const b of bloquesEstudiante) {
      const d = Math.abs(inicio - b.inicio);
      if (d < mejor) mejor = d;
    }
    return mejor;
  };

  return Array.from(mapa.values())
    .map((c) => ({
      c,
      dd: distanciaDia(c.dia),
      dh: distanciaHora(c.inicio),
    }))
    .sort(
      (a, b) =>
        a.dd - b.dd ||
        a.dh - b.dh ||
        DIAS_SEMANA.indexOf(a.c.dia) - DIAS_SEMANA.indexOf(b.c.dia) ||
        a.c.inicio - b.c.inicio,
    )
    .slice(0, MAX_ALTERNATIVAS)
    .map(({ c }) => ({
      dia: c.dia,
      inicio: c.inicio,
      fin: c.fin,
      modalidad: modalidadDe(c.modalidades),
    }));
}

function modalidadDe(modalidades: Set<Modalidad>): Modalidad {
  const lista = Array.from(modalidades);
  if (lista.length !== 1) return 'ambos';
  return lista[0];
}
