'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BloqueHorarioForm from '@/components/BloqueHorarioForm';
import type {
  AlternativaHorario,
  BloqueHorario,
  DisponibilidadRespuesta,
  Modalidad,
} from '@/lib/types';

type PreferenciaModalidad = Modalidad | 'cualquiera';
type Vista = 'form' | 'alternativas' | 'sin-tutores';

const claveAlternativa = (a: AlternativaHorario) =>
  `${a.dia}-${a.inicio}-${a.fin}`;

export default function SolicitudPage() {
  const router = useRouter();

  // Datos del formulario (se conservan al cambiar de vista)
  const [estudiante, setEstudiante] = useState('');
  const [materia, setMateria] = useState('');
  const [materiasExistentes, setMateriasExistentes] = useState<string[]>([]);
  const [bloques, setBloques] = useState<BloqueHorario[]>([
    { dia: 'Lunes', inicio: 15, fin: 17 },
  ]);
  const [modalidad, setModalidad] = useState<PreferenciaModalidad>(
    'cualquiera',
  );
  const [prefiereExperto, setPrefiereExperto] = useState(true);

  // Estado del flujo
  const [vista, setVista] = useState<Vista>('form');
  const [alternativas, setAlternativas] = useState<AlternativaHorario[]>([]);
  const [seleccion, setSeleccion] = useState<AlternativaHorario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch('/api/tutores')
      .then((r) => r.json())
      .then((data: { materias: string[] }) => {
        setMateriasExistentes(data.materias ?? []);
      })
      .catch(() => {});
  }, []);

  const crearSolicitud = async (
    bloquesFinales: BloqueHorario[],
    horarioAjustado: boolean,
  ) => {
    setEnviando(true);
    setError(null);

    const res = await fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estudiante,
        materia,
        bloques: bloquesFinales,
        preferencias: { modalidad, prefiereExperto },
        horarioAjustado,
      }),
    });

    setEnviando(false);

    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}));
      setError(cuerpo.error ?? 'Error al crear la solicitud.');
      return;
    }

    router.push('/solicitud/enviada');
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    // 1. Verificar disponibilidad antes de guardar
    const res = await fetch('/api/solicitudes/disponibilidad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materia, bloques }),
    });

    setEnviando(false);

    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}));
      setError(cuerpo.error ?? 'Error al verificar la disponibilidad.');
      return;
    }

    const data: DisponibilidadRespuesta = await res.json();

    // 2a. Hay tutores compatibles: se guarda y se confirma
    if (data.disponible) {
      await crearSolicitud(bloques, false);
      return;
    }

    // 2b. Hay tutores para la materia, pero no en ese horario
    if (data.motivo === 'sin-horario' && data.alternativas.length > 0) {
      setAlternativas(data.alternativas);
      setSeleccion([]);
      setVista('alternativas');
      return;
    }

    // 2c. Nadie domina la materia (o no hay horarios libres)
    setVista('sin-tutores');
  };

  const alternarSeleccion = (alt: AlternativaHorario) => {
    const clave = claveAlternativa(alt);
    setSeleccion((prev) =>
      prev.some((a) => claveAlternativa(a) === clave)
        ? prev.filter((a) => claveAlternativa(a) !== clave)
        : [...prev, alt],
    );
  };

  /* ---------- Vista: formulario ---------- */
  if (vista === 'form') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Solicitud de tutoría
          </h1>
          <p className="text-slate-400">
            Describe qué necesitas; el coordinador te asignará el tutor más
            compatible.
          </p>
        </div>

        <form onSubmit={enviar} className="card space-y-5">
          <div>
            <label className="label" htmlFor="estudiante">
              Nombre del estudiante
            </label>
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
            <label className="label" htmlFor="materia">
              Materia
            </label>
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
                onChange={(e) =>
                  setModalidad(e.target.value as PreferenciaModalidad)
                }
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
            <p className="rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={enviando} className="btn w-full py-3 text-base">
            {enviando ? 'Verificando…' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    );
  }

  /* ---------- Vista: horarios alternativos ---------- */
  if (vista === 'alternativas') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="card border-amber-700 bg-amber-950/20">
          <h1 className="text-2xl font-bold">
            No hay tutores disponibles en tu horario
          </h1>
          <p className="mt-2 text-slate-300">
            Pero estas son las opciones más cercanas. Elige una o varias:
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {alternativas.map((alt) => {
            const sel = seleccion.some(
              (a) => claveAlternativa(a) === claveAlternativa(alt),
            );
            return (
              <button
                type="button"
                key={claveAlternativa(alt)}
                onClick={() => alternarSeleccion(alt)}
                className={`card text-left transition ${
                  sel
                    ? 'border-indigo-500 bg-indigo-950/40'
                    : 'hover:border-slate-600'
                }`}
              >
                <p className="font-bold">{alt.dia}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {alt.inicio}:00 – {alt.fin}:00
                </p>
                <span className="mt-3 inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                  {alt.modalidad}
                </span>
                <p className="mt-3 text-xs font-medium text-indigo-300">
                  {sel ? 'Seleccionado' : 'Toca para seleccionar'}
                </p>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              crearSolicitud(
                seleccion.map((a) => ({
                  dia: a.dia,
                  inicio: a.inicio,
                  fin: a.fin,
                })),
                true,
              )
            }
            disabled={seleccion.length === 0 || enviando}
            className="btn"
          >
            {enviando
              ? 'Enviando…'
              : `Confirmar solicitud (${seleccion.length} bloque(s) elegido(s))`}
          </button>
          <button onClick={() => setVista('form')} className="btn-secondary">
            Cambiar mi horario
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Vista: sin tutores para la materia ---------- */
  return (
    <div className="mx-auto max-w-xl">
      <div className="card border-rose-800 bg-rose-950/20 text-center">
        <h1 className="text-2xl font-bold">
          Por ahora no tenemos tutores para esta materia
        </h1>
        <p className="mt-3 text-slate-300">
          No hay tutores que dominen &quot;{materia}&quot; con horarios
          compatibles. Puedes dejar tu solicitud como pendiente: el
          coordinador la revisará y podrá registrar más tutores.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => crearSolicitud(bloques, false)}
            disabled={enviando}
            className="btn"
          >
            {enviando ? 'Guardando…' : 'Guardar solicitud pendiente'}
          </button>
          <button onClick={() => setVista('form')} className="btn-secondary">
            Cambiar mi horario
          </button>
        </div>
      </div>
    </div>
  );
}
