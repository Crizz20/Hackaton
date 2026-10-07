'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Asignacion, Solicitud } from '@/lib/types';

const colorScore = (score: number) =>
  score >= 80
    ? 'bg-emerald-900/60 text-emerald-300'
    : score >= 60
      ? 'bg-amber-900/60 text-amber-300'
      : 'bg-rose-900/60 text-rose-300';

export default function HistorialPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  const cargar = useCallback(async () => {
    const [a, s] = await Promise.all([
      fetch('/api/asignaciones').then((r) => r.json()),
      fetch('/api/solicitudes').then((r) => r.json()),
    ]);
    setAsignaciones(a);
    setSolicitudes(s);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pendientes = solicitudes.filter((s) => !s.asignacionId);

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
        <Link href="/solicitud" className="btn">
          Nueva solicitud
        </Link>
      </div>

      <section>
        {asignaciones.length === 0 ? (
          <div className="card text-center text-slate-400">
            Aún no hay asignaciones. Crea una solicitud para generar la primera.
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

      <section>
        <h2 className="mb-4 text-xl font-bold">Solicitudes pendientes</h2>
        {pendientes.length === 0 ? (
          <p className="text-sm text-slate-500">No hay solicitudes sin asignar.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {pendientes.map((s) => (
              <div key={s.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{s.estudiante}</p>
                  <p className="text-sm text-slate-400">{s.materia}</p>
                </div>
                <Link href={`/resultado?solicitudId=${s.id}`} className="btn-secondary">
                  Ver matching
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
