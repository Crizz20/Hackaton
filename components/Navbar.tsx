'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const RUTAS_COORDINADOR = ['/tutores', '/historial', '/resultado'];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [cerrando, setCerrando] = useState(false);

  const esCoordinador = RUTAS_COORDINADOR.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );

  const cerrarSesion = async () => {
    setCerrando(true);
    await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => {});
    router.push('/');
  };

  const enlace = (href: string, label: string) => (
    <li key={href}>
      <Link
        href={href}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          pathname === href
            ? 'bg-indigo-600 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
        }`}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <button
          onClick={() => router.push('/')}
          className="text-lg font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Tutor
          </span>
          Match
        </button>

        {esCoordinador ? (
          <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
            {enlace('/tutores', 'Tutores')}
            {enlace('/historial', 'Solicitudes e historial')}
            <li>
              <button
                onClick={cerrarSesion}
                disabled={cerrando}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                {cerrando ? 'Cerrando…' : 'Cerrar sesión'}
              </button>
            </li>
          </ul>
        ) : (
          <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
            {enlace('/solicitud', 'Solicitar tutoría')}
          </ul>
        )}
      </nav>
    </header>
  );
}
