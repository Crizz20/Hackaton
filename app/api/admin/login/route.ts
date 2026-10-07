import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_ADMIN, PIN_ADMIN_POR_DEFECTO } from '@/lib/constantes';

/** Inicia sesión de coordinador: valida el PIN y crea cookie httpOnly (8 h). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pin = (body as { pin?: unknown } | null)?.pin;
  const pinEsperado = process.env.ADMIN_PIN ?? PIN_ADMIN_POR_DEFECTO;

  if (typeof pin !== 'string' || pin !== pinEsperado) {
    return NextResponse.json(
      { error: 'PIN incorrecto. Inténtalo de nuevo.' },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_ADMIN,
    value: crypto.randomUUID(),
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
  return res;
}

/** Cierra sesión: elimina la cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete({ name: COOKIE_ADMIN, path: '/' });
  return res;
}
