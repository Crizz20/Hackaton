import { promises as fs } from 'fs';
import path from 'path';
import type { DB } from './types';
import { crearSeed } from './seed';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

/**
 * Persistencia simple en archivo JSON del servidor (data/db.json).
 * Si el archivo no existe, se crea automáticamente con datos de ejemplo.
 */
export async function leerDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw) as DB;
  } catch {
    const db = crearSeed();
    await guardarDB(db);
    return db;
  }
}

export async function guardarDB(db: DB): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}
