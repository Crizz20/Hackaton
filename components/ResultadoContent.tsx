'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ScoreBar from '@/components/ScoreBar';
import { WEIGHTS, descripcionHorarios } from '@/lib/matching';
import type { Asignacion, MatchResultado, Solicitud, Tutor } from '@/lib/types';

interface RespuestaMatch {
  solicitud: Solicitud;
  match: MatchResultado;
  asignacion: Asignacion | null;
  tutor: Tutor | null;
}

export default function ResultadoContent({
  solicitudId,
}: {
  solicitudId: string;
}) {
  const [data, setData] = useState<RespuestaMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/match?solicitudId=${solicitudId}`);
    if (!res.ok) {
      setError('No se pudo cargar el resultado. Verifica el enlace o crea una solicitud primero.');
      return;
    }
    setData(await res.json());
  }, [solicitudId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const confirmar = async () => {
    if (!data?.match.recomendado) return;
    setConfirmando(true);
    const res = await fetch('/api/asignaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solicitudId,
        tutorId: data.match.recomendado.tutorId,
      }),
    });
    setConfirmando(false);
    if (res.ok) {
      await cargar();
    } else {
      const cuerpo = await res.json().catch(() => ({}));
      setError(cuerpo.error ?? 'No se pudo confirmar la asignación.');
    }
  };

  if (error) {
    return (
      <div className="card text-center">
        <p className="text-rose-400">{error}</p>
        <Link href="/solicitud" className="btn mt-6 inline-block">
          Crear solicitud
        </Link>
      </div>
    );
  }

  if (!data) {
    return <p className="py-20 text-center text-slate-400">Cargando resultado…</p>;
  }

  const { match, solicitud, asignacion, tutor } = data;

  if (match.motivoRechazo) {
    return (
      <div className="space-y-4">
        <div className="card border-rose-800 bg-rose-950/20 p-8 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-rose-900/60 px-3 py-1 text-xs font-medium text-rose-300">
              Sin tutor disponible
            </span>
            {solicitud.horarioAjustado && (
              <span className="rounded-full bg-amber-900/60 px-3 py-1 text-xs font-medium text-amber-300">
                Horario ajustado
              </span>
            )}
          </div>
          <h2 className="mt-3 text-xl font-bold">Sin tutores compatibles</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            {match.motivoRechazo}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/historial" className="btn-secondary">
            Volver al historial
          </Link>
        </div>
      </div>
    );
  }

  const rec = match.recomendado!;

  return (
    <div className="space-y-8">
      {/* Resumen de la solicitud */}
      <section className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Solicitud
        </h2>
        <p className="mt-1 text-lg font-semibold">
          {solicitud.estudiante} · {solicitud.materia}
        </p>
        <p className="text-sm text-slate-400">
          Disponibilidad: {descripcionHorarios(solicitud.bloques)}
        </p>
        {asignacion && (
          <span className="mt-3 inline-block rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-medium text-emerald-300">
            Ya asignada a {asignacion.tutorNombre} (score {asignacion.score})
          </span>
        )}
        {solicitud.horarioAjustado && (
          <span className="mt-3 inline-block rounded-full bg-amber-900/60 px-3 py-1 text-xs font-medium text-amber-300">
            Horario ajustado
          </span>
        )}
      </section>

      {/* Tutor recomendado */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-500/50 bg-gradient-to-br from-indigo-950/70 to-violet-950/40 p-6">
        <span className="absolute right-4 top-4 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-wide">
          Recomendado
        </span>
        <h2 className="text-2xl font-bold">{rec.tutorNombre}</h2>
        {tutor && (
          <p className="mt-1 text-sm text-slate-300">
            {tutor.aniosExperiencia} años de experiencia · nivel {tutor.nivel} · {tutor.modalidad}
          </p>
        )}

        <div className="mt-4 flex items-end gap-2">
          <span className="text-5xl font-extrabold text-indigo-300">{rec.scoreTotal}</span>
          <span className="pb-1.5 text-sm text-slate-400">/ 100</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-700"
            style={{ width: `${rec.scoreTotal}%` }}
          />
        </div>

        <p className="mt-4 leading-relaxed text-slate-200">{match.justificacion}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
            {rec.traslapeHoras} h de traslape en {rec.traslapeBloques} bloque(s)
          </span>
          {tutor && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
              {tutor.materias.join(' · ')}
            </span>
          )}
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
            Carga: {rec.asignacionesActivas} activa(s)
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {!asignacion ? (
            <button onClick={confirmar} disabled={confirmando} className="btn">
              {confirmando ? 'Confirmando…' : 'Confirmar asignación'}
            </button>
          ) : (
            <Link href="/historial" className="btn">Ver en historial</Link>
          )}
          <button onClick={cargar} className="btn-secondary">Reevaluar</button>
        </div>
      </section>

      {/* Ranking de alternativas */}
      <section>
        <h3 className="mb-4 text-lg font-bold">
          Ranking de alternativas ({match.ranking.length})
        </h3>
        <div className="space-y-3">
          {match.ranking.map((r, i) => (
            <article
              key={r.tutorId}
              className={`rounded-xl border p-4 ${
                i === 0
                  ? 'border-indigo-500/40 bg-slate-900'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    <span className="mr-2 text-slate-500">#{i + 1}</span>
                    {r.tutorNombre}
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.traslapeHoras} h de traslape · {r.asignacionesActivas} asignación(es) activa(s)
                  </p>
                </div>
                <span className="text-2xl font-bold text-slate-100">{r.scoreTotal}</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ScoreBar label="Horario" value={r.desglose.horario} peso={WEIGHTS.horario} />
                <ScoreBar label="Experiencia" value={r.desglose.experiencia} peso={WEIGHTS.experiencia} />
                <ScoreBar label="Preferencias" value={r.desglose.preferencias} peso={WEIGHTS.preferencias} />
                <ScoreBar label="Balance de carga" value={r.desglose.carga} peso={WEIGHTS.carga} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
