import { AnimatedNumber } from './AnimatedNumber';

export function StatCard({ label, value, hint }) {
  const numericValue = Number(value);
  const canAnimate = Number.isFinite(numericValue);

  return (
    <div className="app-card football-card stat-card">
      <p className="text-sm text-gray-400">{label}</p>
      <div className="mt-4 heading-font text-4xl font-semibold text-white">
        {canAnimate ? <AnimatedNumber value={numericValue} /> : value}
      </div>
      {hint ? <p className="mt-2 text-sm text-gray-500">{hint}</p> : null}
    </div>
  );
}
