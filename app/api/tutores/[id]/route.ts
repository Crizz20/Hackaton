import { NextResponse } from 'next/server';
import { leerDB, guardarDB } from '@/lib/db';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const db = await leerDB();
  const index = db.tutores.findIndex((t) => t.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Tutor no encontrado.' }, { status: 404 });
  }
  db.tutores.splice(index, 1);
  await guardarDB(db);
  return NextResponse.json({ ok: true });
}
