interface Props {
  label: string;
  value: number; // 0-100
  peso?: number;
}

export default function ScoreBar({ label, value, peso }: Props) {
  const color =
    value >= 75
      ? 'bg-emerald-500'
      : value >= 50
        ? 'bg-amber-500'
        : 'bg-rose-500';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          {label}
          {peso !== undefined && <span className="text-slate-600"> · peso {peso}%</span>}
        </span>
        <span className="font-medium text-slate-200">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
