import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_ADMIN } from './lib/constantes';

const RUTAS_COORDINADOR = ['/tutores', '/historial', '/resultado'];

// Rutas de API accesibles sin sesión de coordinador.
const RUTAS_PUBLICAS: ReadonlyArray<{ ruta: string; metodo: string }> = [
  { ruta: '/api/solicitudes', metodo: 'POST' },
  { ruta: '/api/tutores', metodo: 'GET' },
  { ruta: '/api/admin/login', metodo: 'POST' },
  { ruta: '/api/admin/login', metodo: 'DELETE' },
  { ruta: '/api/solicitudes/disponibilidad', metodo: 'POST' },
];

function esRutaCoordinador(pathname: string): boolean {
  return RUTAS_COORDINADOR.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const metodo = request.method;
  const tieneSesion = Boolean(request.cookies.get(COOKIE_ADMIN)?.value);

  // Páginas de coordinador: redirigir al login si no hay sesión.
  if (esRutaCoordinador(pathname) && !tieneSesion) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Rutas de API: 401 sin sesión, excepto las públicas.
  if (pathname.startsWith('/api/') && !tieneSesion) {
    const esPublica = RUTAS_PUBLICAS.some(
      (p) => p.ruta === pathname && p.metodo === metodo,
    );
    if (!esPublica) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión como coordinador.' },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
