import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Solicitud enviada · TutorMatch',
};

export default function SolicitudEnviadaPage() {
  return (
    <div className="mx-auto max-w-xl pt-10">
      <div className="card border-emerald-700 bg-emerald-950/20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/60 text-3xl font-bold text-emerald-300">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold">¡Solicitud enviada!</h1>
        <p className="mt-2 text-slate-300">
          El coordinador revisará tu solicitud y te asignará el tutor más
          compatible.
        </p>
        <Link href="/" className="btn mt-6 inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
