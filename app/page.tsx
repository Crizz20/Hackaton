import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TutorMatch · Matching inteligente de tutores',
  description:
    'Sistema de asignación automática de tutores por afinidad — Hackathon',
};

export default function InicioPage() {
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
          Matching automático entre estudiantes y tutores según materia,
          horario, experiencia y preferencias. El coordinador revisa y
          confirma la asignación.
        </p>
      </section>

      {/* Roles */}
      <section className="grid gap-6 md:grid-cols-2">
        <Link
          href="/solicitud"
          className="group card block transition hover:border-indigo-500/60"
        >
          <h2 className="text-2xl font-bold text-indigo-300">
            Soy estudiante
          </h2>
          <p className="mt-2 text-slate-400">
            Completa el formulario con tu materia, disponibilidad y
            preferencias. El coordinador revisará tu solicitud y te
            asignará el tutor más compatible.
          </p>
          <span className="btn mt-6 inline-block transition group-hover:bg-indigo-500">
            Solicitar tutoría
          </span>
        </Link>

        <Link
          href="/admin/login"
          className="group card block transition hover:border-violet-500/60"
        >
          <h2 className="text-2xl font-bold text-violet-300">
            Soy coordinador
          </h2>
          <p className="mt-2 text-slate-400">
            Registra y administra tutores, revisa las solicitudes
            pendientes, ve el ranking de matching completo y confirma
            las asignaciones.
          </p>
          <span className="btn-secondary mt-6 inline-block transition group-hover:bg-slate-700">
            Acceder al panel
          </span>
        </Link>
      </section>

      {/* Cómo funciona */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">¿Cómo funciona?</h2>
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            {
              titulo: '1. El estudiante solicita',
              texto: 'Materia, disponibilidad y preferencias. Se verifica la disponibilidad al instante.',
            },
            {
              titulo: '2. Horarios alternativos',
              texto: 'Si no hay tutores en ese horario, se sugieren los bloques más cercanos.',
            },
            {
              titulo: '3. Score de afinidad',
              texto: 'El algoritmo puntúa 0–100 con 4 criterios ponderados. La materia es filtro obligatorio.',
            },
            {
              titulo: '4. El coordinador asigna',
              texto: 'Ve el ranking con desglose y justificación, y confirma la mejor asignación.',
            },
          ].map((paso) => (
            <li key={paso.titulo} className="card">
              <h3 className="font-semibold text-indigo-300">{paso.titulo}</h3>
              <p className="mt-2 text-sm text-slate-400">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
