'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BloqueHorarioForm from '@/components/BloqueHorarioForm';
import type { BloqueHorario, Modalidad } from '@/lib/types';

type PreferenciaModalidad = Modalidad | 'cualquiera';

export default function SolicitudPage() {
  const router = useRouter();

  const [estudiante, setEstudiante] = useState('');
  const [materia, setMateria] = useState('');
  const [materiasExistentes, setMateriasExistentes] = useState<string[]>([]);
  const [bloques, setBloques] = useState<BloqueHorario[]>([
    { dia: 'Lunes', inicio: 15, fin: 17 },
  ]);
  const [modalidad, setModalidad] = useState<PreferenciaModalidad>('cualquiera');
  const [prefiereExperto, setPrefiereExperto] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch('/api/tutores')
      .then((r) => r.json())
      .then((tutores: { materias: string[] }[]) => {
        setMateriasExistentes(
          Array.from(new Set(tutores.flatMap((t) => t.materias))).sort(),
        );
      })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const res = await fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estudiante,
        materia,
        bloques,
        preferencias: { modalidad, prefiereExperto },
      }),
    });

    setEnviando(false);

    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}));
      setError(cuerpo.error ?? 'Error al crear la solicitud.');
      return;
    }

    const data = await res.json();
    router.push(`/resultado?solicitudId=${data.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Solicitud de tutoría</h1>
        <p className="text-slate-400">
          Describe qué necesitas y te recomendaremos el tutor más compatible.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="estudiante">Nombre del estudiante</label>
          <input
            id="estudiante"
            className="input"
            value={estudiante}
            onChange={(e) => setEstudiante(e.target.value)}
            placeholder="Ej. Lucía Fernández"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="materia">Materia</label>
          <input
            id="materia"
            className="input"
            list="materias-disponibles"
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            placeholder="Ej. Cálculo"
            required
          />
          <datalist id="materias-disponibles">
            {materiasExistentes.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-slate-500">
            Solo se recomendarán tutores que dominen esta materia.
          </p>
        </div>

        <div>
          <span className="label">Tu disponibilidad</span>
          <BloqueHorarioForm bloques={bloques} onChange={setBloques} />
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-800 p-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pref-modalidad">
              Preferencia de modalidad
            </label>
            <select
              id="pref-modalidad"
              className="input"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value as PreferenciaModalidad)}
            >
              <option value="cualquiera">Cualquiera</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 self-end pb-1">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-700 accent-indigo-600"
              checked={prefiereExperto}
              onChange={(e) => setPrefiereExperto(e.target.checked)}
            />
            <span className="text-sm text-slate-300">
              Prefiero un tutor con experiencia (3+ años)
            </span>
          </label>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-300">{error}</p>
        )}

        <button type="submit" disabled={enviando} className="btn w-full py-3 text-base">
          {enviando ? 'Calculando…' : 'Encontrar mi tutor'}
        </button>
      </form>
    </div>
  );
}
