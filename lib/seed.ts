import type { Asignacion, DB, Solicitud, Tutor } from './types';

/**
 * Datos de ejemplo: 8 tutores variados, 3 solicitudes y 2 asignaciones
 * (para que el balanceo de carga y el historial sean visibles en la demo).
 */
export function crearSeed(): DB {
  const ahora = new Date().toISOString();

  const tutores: Tutor[] = [
    {
      id: 't-ana',
      nombre: 'Ana Torres',
      materias: ['Cálculo', 'Álgebra'],
      bloques: [
        { dia: 'Lunes', inicio: 15, fin: 18 },
        { dia: 'Miércoles', inicio: 15, fin: 18 },
        { dia: 'Martes', inicio: 9, fin: 12 },
        { dia: 'Jueves', inicio: 9, fin: 12 },
      ],
      aniosExperiencia: 6,
      nivel: 'experto',
      modalidad: 'ambos',
    },
    {
      id: 't-luis',
      nombre: 'Luis Gómez',
      materias: ['Física', 'Cálculo'],
      bloques: [
        { dia: 'Martes', inicio: 15, fin: 18 },
        { dia: 'Jueves', inicio: 15, fin: 18 },
        { dia: 'Viernes', inicio: 10, fin: 13 },
      ],
      aniosExperiencia: 2,
      nivel: 'junior',
      modalidad: 'virtual',
    },
    {
      id: 't-maria',
      nombre: 'María Ruiz',
      materias: ['Química', 'Biología'],
      bloques: [
        { dia: 'Lunes', inicio: 8, fin: 11 },
        { dia: 'Viernes', inicio: 8, fin: 11 },
        { dia: 'Sábado', inicio: 10, fin: 14 },
      ],
      aniosExperiencia: 4,
      nivel: 'avanzado',
      modalidad: 'presencial',
    },
    {
      id: 't-diego',
      nombre: 'Diego Pérez',
      materias: ['Programación', 'Matemáticas'],
      bloques: [
        { dia: 'Lunes', inicio: 18, fin: 21 },
        { dia: 'Martes', inicio: 18, fin: 21 },
        { dia: 'Miércoles', inicio: 18, fin: 21 },
        { dia: 'Jueves', inicio: 18, fin: 21 },
      ],
      aniosExperiencia: 5,
      nivel: 'avanzado',
      modalidad: 'virtual',
    },
    {
      id: 't-sofia',
      nombre: 'Sofía Herrera',
      materias: ['Inglés', 'Historia'],
      bloques: [
        { dia: 'Miércoles', inicio: 9, fin: 12 },
        { dia: 'Viernes', inicio: 9, fin: 12 },
        { dia: 'Sábado', inicio: 9, fin: 12 },
      ],
      aniosExperiencia: 3,
      nivel: 'intermedio',
      modalidad: 'ambos',
    },
    {
      id: 't-carlos',
      nombre: 'Carlos Mendoza',
      materias: ['Álgebra', 'Cálculo'],
      bloques: [
        { dia: 'Martes', inicio: 8, fin: 11 },
        { dia: 'Jueves', inicio: 8, fin: 11 },
        { dia: 'Lunes', inicio: 16, fin: 19 },
      ],
      aniosExperiencia: 8,
      nivel: 'experto',
      modalidad: 'presencial',
    },
    {
      id: 't-valeria',
      nombre: 'Valeria Luna',
      materias: ['Programación', 'Física'],
      bloques: [
        { dia: 'Viernes', inicio: 15, fin: 19 },
        { dia: 'Sábado', inicio: 12, fin: 16 },
      ],
      aniosExperiencia: 1,
      nivel: 'junior',
      modalidad: 'virtual',
    },
    {
      id: 't-javier',
      nombre: 'Javier Ortiz',
      materias: ['Química', 'Cálculo'],
      bloques: [
        { dia: 'Lunes', inicio: 10, fin: 13 },
        { dia: 'Miércoles', inicio: 10, fin: 13 },
        { dia: 'Jueves', inicio: 15, fin: 18 },
      ],
      aniosExperiencia: 4,
      nivel: 'avanzado',
      modalidad: 'ambos',
    },
  ];

  const solicitudes: Solicitud[] = [
    {
      id: 's-1',
      estudiante: 'Lucía Fernández',
      materia: 'Cálculo',
      bloques: [
        { dia: 'Miércoles', inicio: 15, fin: 18 },
        { dia: 'Jueves', inicio: 15, fin: 18 },
      ],
      preferencias: { modalidad: 'cualquiera', prefiereExperto: true },
      creadaEn: ahora,
      asignacionId: 'a-1',
    },
    {
      id: 's-2',
      estudiante: 'Pedro Soto',
      materia: 'Programación',
      bloques: [
        { dia: 'Lunes', inicio: 19, fin: 21 },
        { dia: 'Viernes', inicio: 16, fin: 18 },
      ],
      preferencias: { modalidad: 'virtual', prefiereExperto: false },
      creadaEn: ahora,
      asignacionId: 'a-2',
    },
    {
      id: 's-3',
      estudiante: 'Camila Díaz',
      materia: 'Inglés',
      bloques: [{ dia: 'Sábado', inicio: 9, fin: 11 }],
      preferencias: { modalidad: 'presencial', prefiereExperto: false },
      creadaEn: ahora,
      asignacionId: null,
    },
  ];

  const asignaciones: Asignacion[] = [
    {
      id: 'a-1',
      solicitudId: 's-1',
      tutorId: 't-ana',
      estudiante: 'Lucía Fernández',
      materia: 'Cálculo',
      tutorNombre: 'Ana Torres',
      score: 83,
      creadaEn: ahora,
    },
    {
      id: 'a-2',
      solicitudId: 's-2',
      tutorId: 't-diego',
      estudiante: 'Pedro Soto',
      materia: 'Programación',
      tutorNombre: 'Diego Pérez',
      score: 83,
      creadaEn: ahora,
    },
  ];

  return { tutores, solicitudes, asignaciones };
}
