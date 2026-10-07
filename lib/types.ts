export type DiaSemana =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado';

export const DIAS_SEMANA: DiaSemana[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export type Modalidad = 'presencial' | 'virtual' | 'ambos';

export type NivelExperiencia = 'junior' | 'intermedio' | 'avanzado' | 'experto';

export interface BloqueHorario {
  dia: DiaSemana;
  inicio: number; // hora de inicio (0-23)
  fin: number; // hora de fin (0-23)
}

export interface Tutor {
  id: string;
  nombre: string;
  materias: string[];
  bloques: BloqueHorario[];
  aniosExperiencia: number;
  nivel: NivelExperiencia;
  modalidad: Modalidad;
}

export interface PreferenciasEstudiante {
  modalidad: Modalidad | 'cualquiera';
  prefiereExperto: boolean;
}

export interface Solicitud {
  id: string;
  estudiante: string;
  materia: string;
  bloques: BloqueHorario[];
  preferencias: PreferenciasEstudiante;
  creadaEn: string;
  asignacionId: string | null;
  /** Marca cuando el estudiante ajustó su horario tras no encontrar disponibilidad. */
  horarioAjustado?: boolean;
}

export interface DesgloseScore {
  horario: number; // 0-100
  experiencia: number; // 0-100
  preferencias: number; // 0-100
  carga: number; // 0-100
}

export interface ResultadoMatch {
  tutorId: string;
  tutorNombre: string;
  scoreTotal: number; // 0-100
  desglose: DesgloseScore;
  traslapeHoras: number;
  traslapeBloques: number;
  asignacionesActivas: number;
}

export interface MatchResultado {
  ranking: ResultadoMatch[];
  recomendado: ResultadoMatch | null;
  justificacion: string;
  motivoRechazo: string | null;
}

export interface Asignacion {
  id: string;
  solicitudId: string;
  tutorId: string;
  estudiante: string;
  materia: string;
  tutorNombre: string;
  score: number;
  creadaEn: string;
}

export interface DB {
  tutores: Tutor[];
  solicitudes: Solicitud[];
  asignaciones: Asignacion[];
}

export interface AlternativaHorario {
  dia: DiaSemana;
  inicio: number;
  fin: number;
  modalidad: Modalidad;
}

export interface DisponibilidadRespuesta {
  disponible: boolean;
  motivo?: 'sin-materia' | 'sin-horario';
  alternativas: AlternativaHorario[];
}
