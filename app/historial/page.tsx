'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { calcularRanking, descripcionHorarios } from '@/lib/matching';
import type { Asignacion, Solicitud, Tutor } from '@/lib/types';

const colorScore = (score: number) =>
  score >= 80
    ? 'bg-emerald-900/60 text-emerald-300'
    : score >= 60
      ? 'bg-amber-900/60 text-amber-300'
      : 'bg-rose-900/60 text-rose-300';

export default function HistorialPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const [a, s, t] = await Promise.all([
      fetch('/api/asignaciones').then((r) => r.json()),
      fetch('/api/solicitudes').then((r) => r.json()),
      fetch('/api/tutores').then((r) => r.json()),
    ]);
    setAsignaciones(a);
    setSolicitudes(s);
    setTutores(t);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pendientes = solicitudes.filter((s) => !s.asignacionId);

  const sinTutorCompatible = (s: Solicitud): boolean =>
    calcularRanking(tutores, s, asignaciones).length === 0;

  const reset = async () => {
    const res = await fetch('/api/seed', { method: 'POST' });
    const data = await res.json();
    setMensaje(data.mensaje);
    await cargar();
    setTimeout(() => setMensaje(null), 4000);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Historial de asignaciones
          </h1>
          <p className="text-slate-400">
            {asignaciones.length} asignación(es) realizada(s)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={reset} className="btn-secondary">
            Restablecer datos
          </button>
          <Link href="/solicitud" className="btn">
            Nueva solicitud
          </Link>
        </div>
      </div>

      {/* Solicitudes pendientes (destacadas con contador) */}
      <section className="rounded-2xl border border-amber-800/60 bg-amber-950/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-bold">Solicitudes pendientes</h2>
          <span className="rounded-full bg-amber-900/70 px-3 py-0.5 text-sm font-bold text-amber-300">
            {pendientes.length}
          </span>
        </div>

        {pendientes.length === 0 ? (
          <p className="text-sm text-slate-400">
            No hay solicitudes sin asignar.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {pendientes.map((s) => {
              const sinTutor = sinTutorCompatible(s);
              return (
                <article
                  key={s.id}
                  className={`card border-l-4 ${
                    sinTutor
                      ? 'border-l-rose-600'
                      : s.horarioAjustado
                        ? 'border-l-amber-500'
                        : 'border-l-indigo-500'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{s.estudiante}</p>
                      <p className="text-sm text-slate-400">{s.materia}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {descripcionHorarios(s.bloques)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-amber-900/60 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                          Pendiente
                        </span>
                        {s.horarioAjustado && (
                          <span className="rounded-full bg-amber-900/60 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                            Horario ajustado
                          </span>
                        )}
                        {sinTutor && (
                          <span className="rounded-full bg-rose-900/60 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                            Sin tutor compatible
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/resultado?solicitudId=${s.id}`}
                      className="btn-secondary"
                    >
                      Ver matching
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Asignaciones realizadas */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Asignaciones realizadas</h2>
        {asignaciones.length === 0 ? (
          <div className="card text-center text-slate-400">
            Aún no hay asignaciones.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {asignaciones.map((a) => (
              <article key={a.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{a.estudiante}</p>
                    <p className="text-sm text-slate-400">{a.materia}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${colorScore(a.score)}`}
                  >
                    {a.score}
                  </span>
                </div>
                <div className="mt-3 border-t border-slate-800 pt-3">
                  <p className="text-sm text-slate-300">
                    Tutor asignado:{' '}
                    <span className="font-medium text-slate-100">
                      {a.tutorNombre}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(a.creadaEn).toLocaleString('es-ES')}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
