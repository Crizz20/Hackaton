'use client';

import { useCallback, useEffect, useState } from 'react';
import BloqueHorarioForm from '@/components/BloqueHorarioForm';
import { descripcionHorarios } from '@/lib/matching';
import type {
  BloqueHorario,
  Modalidad,
  NivelExperiencia,
  Tutor,
} from '@/lib/types';

type TutorConCarga = Tutor & { asignacionesActivas: number };

const NIVELES: NivelExperiencia[] = ['junior', 'intermedio', 'avanzado', 'experto'];
const MODALIDADES: Modalidad[] = ['presencial', 'virtual', 'ambos'];

const colorNivel = (nivel: NivelExperiencia) =>
  nivel === 'experto'
    ? 'bg-violet-900/60 text-violet-300'
    : nivel === 'avanzado'
      ? 'bg-indigo-900/60 text-indigo-300'
      : nivel === 'intermedio'
        ? 'bg-amber-900/60 text-amber-300'
        : 'bg-slate-800 text-slate-300';

export default function TutoresPage() {
  const [tutores, setTutores] = useState<TutorConCarga[]>([]);
  const [nombre, setNombre] = useState('');
  const [materiasInput, setMateriasInput] = useState('');
  const [anios, setAnios] = useState(2);
  const [nivel, setNivel] = useState<NivelExperiencia>('intermedio');
  const [modalidad, setModalidad] = useState<Modalidad>('ambos');
  const [bloques, setBloques] = useState<BloqueHorario[]>([
    { dia: 'Lunes', inicio: 15, fin: 17 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch('/api/tutores');
    setTutores(await res.json());
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);

    const materias = materiasInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch('/api/tutores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        materias,
        bloques,
        aniosExperiencia: Number(anios),
        nivel,
        modalidad,
      }),
    });

    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}));
      setError(cuerpo.error ?? 'Error al registrar el tutor.');
      return;
    }

    setOk(true);
    setNombre('');
    setMateriasInput('');
    setAnios(2);
    setNivel('intermedio');
    setModalidad('ambos');
    setBloques([{ dia: 'Lunes', inicio: 15, fin: 17 }]);
    await cargar();
  };

  const eliminar = async (id: string) => {
    await fetch(`/api/tutores/${id}`, { method: 'DELETE' });
    await cargar();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Registro de tutores</h1>
        <p className="text-slate-400">
          {tutores.length} tutor(es) registrado(s)
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Formulario */}
        <form onSubmit={submit} className="card space-y-4 lg:col-span-2">
          <h2 className="text-lg font-bold">Nuevo tutor</h2>

          <div>
            <label className="label" htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Ana Torres"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="materias">
              Materias (separadas por coma)
            </label>
            <input
              id="materias"
              className="input"
              value={materiasInput}
              onChange={(e) => setMateriasInput(e.target.value)}
              placeholder="Cálculo, Álgebra"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="anios">Años de experiencia</label>
              <input
                id="anios"
                type="number"
                min={0}
                className="input"
                value={anios}
                onChange={(e) => setAnios(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label" htmlFor="nivel">Nivel</label>
              <select
                id="nivel"
                className="input"
                value={nivel}
                onChange={(e) => setNivel(e.target.value as NivelExperiencia)}
              >
                {NIVELES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="modalidad">Modalidad</label>
            <select
              id="modalidad"
              className="input"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value as Modalidad)}
            >
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="label">Disponibilidad</span>
            <BloqueHorarioForm bloques={bloques} onChange={setBloques} />
          </div>

          {error && <p className="rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-300">{error}</p>}
          {ok && <p className="rounded-lg bg-emerald-950 px-3 py-2 text-sm text-emerald-300">Tutor registrado correctamente.</p>}

          <button type="submit" className="btn w-full">Registrar tutor</button>
        </form>

        {/* Lista */}
        <div className="space-y-4 lg:col-span-3">
          {tutores.length === 0 ? (
            <div className="card text-center text-slate-400">
              Aún no hay tutores. Registra el primero con el formulario.
            </div>
          ) : (
            tutores.map((t) => (
              <article key={t.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{t.nombre}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colorNivel(t.nivel)}`}>
                        {t.nivel}
                      </span>
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                        {t.modalidad}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {t.aniosExperiencia} año(s) de experiencia
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        t.asignacionesActivas === 0
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-amber-900/60 text-amber-300'
                      }`}
                    >
                      {t.asignacionesActivas === 0
                        ? 'sin carga'
                        : `${t.asignacionesActivas} asignación(es) activa(s)`}
                    </span>
                    <button
                      onClick={() => eliminar(t.id)}
                      className="rounded-lg border border-rose-800 px-2.5 py-1 text-xs text-rose-400 transition hover:bg-rose-950"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {t.materias.map((m) => (
                    <span key={m} className="rounded-full bg-indigo-950 px-3 py-1 text-xs font-medium text-indigo-300">
                      {m}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {descripcionHorarios(t.bloques)}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
