'use client';

import { DIAS_SEMANA } from '@/lib/types';
import type { BloqueHorario } from '@/lib/types';

interface Props {
  bloques: BloqueHorario[];
  onChange: (bloques: BloqueHorario[]) => void;
}

export default function BloqueHorarioForm({ bloques, onChange }: Props) {
  const agregar = () =>
    onChange([...bloques, { dia: 'Lunes', inicio: 15, fin: 17 }]);

  const actualizar = (index: number, campo: Partial<BloqueHorario>) => {
    onChange(bloques.map((b, i) => (i === index ? { ...b, ...campo } : b)));
  };

  const eliminar = (index: number) => {
    onChange(bloques.filter((_, i) => i !== index));
  };

  const inputClass =
    'rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none';

  return (
    <div className="space-y-2">
      {bloques.map((b, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select
            value={b.dia}
            onChange={(e) =>
              actualizar(i, { dia: e.target.value as BloqueHorario['dia'] })
            }
            className={inputClass}
          >
            {DIAS_SEMANA.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={23}
            value={b.inicio}
            onChange={(e) => actualizar(i, { inicio: Number(e.target.value) })}
            className={`${inputClass} w-16`}
            aria-label="Hora de inicio"
          />
          <span className="text-xs text-slate-500">:00 a</span>
          <input
            type="number"
            min={1}
            max={24}
            value={b.fin}
            onChange={(e) => actualizar(i, { fin: Number(e.target.value) })}
            className={`${inputClass} w-16`}
            aria-label="Hora de fin"
          />
          <span className="text-xs text-slate-500">:00</span>
          <button
            type="button"
            onClick={() => eliminar(i)}
            className="ml-1 rounded-lg border border-rose-800 px-2 py-1 text-xs text-rose-400 transition hover:bg-rose-950"
            aria-label="Eliminar bloque"
          >
            ✕
          </button>
          {b.fin <= b.inicio && (
            <span className="text-xs text-rose-400">La hora de fin debe ser mayor a la de inicio.</span>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={agregar}
        className="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500 hover:text-indigo-300"
      >
        + Agregar bloque de horario
      </button>
    </div>
  );
}
