'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  desde?: string;
}

export default function LoginForm({ desde }: Props) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });

    setEnviando(false);

    if (!res.ok) {
      setError('PIN incorrecto. Inténtalo de nuevo.');
      return;
    }

    router.push(desde ?? '/historial');
  };

  return (
    <div className="mx-auto max-w-sm pt-16">
      <form onSubmit={enviar} className="card space-y-4">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-900/60 text-xl text-violet-300">
            🔒
          </div>
          <h1 className="mt-3 text-xl font-bold">Acceso coordinador</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ingresa el PIN de administrador para continuar.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="pin">
            PIN
          </label>
          <input
            id="pin"
            type="password"
            className="input"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••"
            required
            autoFocus
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={enviando} className="btn w-full">
          {enviando ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <Link
          href="/"
          className="block text-center text-sm text-slate-400 transition hover:text-slate-200"
        >
          Volver al inicio
        </Link>
      </form>
    </div>
  );
}
