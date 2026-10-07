'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CONFIG, WEIGHTS } from '@/lib/matching';

interface Stats {
  tutores: number;
  solicitudes: number;
  asignaciones: number;
}

export default function InicioPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const [t, s, a] = await Promise.all([
      fetch('/api/tutores').then((r) => r.json()),
      fetch('/api/solicitudes').then((r) => r.json()),
      fetch('/api/asignaciones').then((r) => r.json()),
    ]);
    setStats({ tutores: t.length, solicitudes: s.length, asignaciones: a.length });
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const reset = async () => {
    const res = await fetch('/api/seed', { method: 'POST' });
    const data = await res.json();
    setMensaje(data.mensaje);
    await cargar();
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          El tutor perfecto para{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            cada estudiante
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          El coordinador ya no revisa tutores a mano: el estudiante describe
          qué necesita y el algoritmo de afinidad recomienda al tutor más
          compatible, con justificación y ranking de alternativas.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/solicitud" className="btn px-6 py-3 text-base">
            Crear solicitud
          </Link>
          <Link href="/tutores" className="btn-secondary px-6 py-3 text-base">
            Registrar tutor
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <p className="text-4xl font-extrabold text-indigo-300">
            {stats?.tutores ?? '—'}
          </p>
          <p className="mt-1 text-sm text-slate-400">Tutores registrados</p>
        </div>
        <div className="card text-center">
          <p className="text-4xl font-extrabold text-violet-300">
            {stats?.solicitudes ?? '—'}
          </p>
          <p className="mt-1 text-sm text-slate-400">Solicitudes</p>
        </div>
        <div className="card text-center">
          <p className="text-4xl font-extrabold text-emerald-300">
            {stats?.asignaciones ?? '—'}
          </p>
          <p className="mt-1 text-sm text-slate-400">Asignaciones</p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">¿Cómo funciona?</h2>
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            {
              titulo: '1. Registra tutores',
              texto: 'Materias, horarios, años de experiencia y modalidad (presencial/virtual).',
            },
            {
              titulo: '2. Solicitud del estudiante',
              texto: 'Materia, disponibilidad y preferencias (modalidad, preferencia por experto).',
            },
            {
              titulo: '3. Score de afinidad',
              texto: 'El algoritmo puntúa 0–100 con 4 criterios ponderados. La materia es filtro obligatorio.',
            },
            {
              titulo: '4. Recomendación',
              texto: 'Tutor ideal con justificación en lenguaje natural, ranking de alternativas y confirmación.',
            },
          ].map((paso) => (
            <li key={paso.titulo} className="card">
              <h3 className="font-semibold text-indigo-300">{paso.titulo}</h3>
              <p className="mt-2 text-sm text-slate-400">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ponderación */}
      <section>
        <h2 className="mb-2 text-2xl font-bold">Ponderación del algoritmo</h2>
        <p className="mb-6 text-sm text-slate-400">
          Ajustable en <code className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-300">lib/matching.ts</code> →{' '}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-300">WEIGHTS</code>
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="text-3xl font-extrabold text-amber-400">{WEIGHTS.horario}%</p>
            <p className="mt-1 font-medium">Compatibilidad de horario</p>
            <p className="mt-1 text-xs text-slate-500">% de traslape entre disponibilidades.</p>
          </div>
          <div className="card">
            <p className="text-3xl font-extrabold text-indigo-400">{WEIGHTS.experiencia}%</p>
            <p className="mt-1 font-medium">Experiencia</p>
            <p className="mt-1 text-xs text-slate-500">
              Lineal: {CONFIG.aniosParaScoreMaximo}+ años = 100 pts.
            </p>
          </div>
          <div className="card">
            <p className="text-3xl font-extrabold text-violet-400">{WEIGHTS.preferencias}%</p>
            <p className="mt-1 font-medium">Preferencias</p>
            <p className="mt-1 text-xs text-slate-500">Modalidad y preferencia por tutor experto.</p>
          </div>
          <div className="card">
            <p className="text-3xl font-extrabold text-emerald-400">{WEIGHTS.carga}%</p>
            <p className="mt-1 font-medium">Balance de carga</p>
            <p className="mt-1 text-xs text-slate-500">
              Penaliza tutores con muchas asignaciones (máx. {CONFIG.cargaMaxima}).
            </p>
          </div>
        </div>
      </section>

      {/* Datos */}
      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Datos de ejemplo</h2>
          <p className="text-sm text-slate-400">
            La demo arranca con 8 tutores, 3 solicitudes y 2 asignaciones.
            Restablece para volver al estado inicial en cualquier momento.
          </p>
        </div>
        <button onClick={reset} className="btn-secondary">
          Restablecer datos de ejemplo
        </button>
      </section>

      {mensaje && (
        <p className="fixed bottom-4 right-4 rounded-xl bg-emerald-900 px-4 py-2 text-sm text-emerald-200 shadow-lg">
          {mensaje}
        </p>
      )}
    </div>
  );
}
