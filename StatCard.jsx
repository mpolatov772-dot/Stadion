import { AnimatedNumber } from './AnimatedNumber';

const TONE_CLASSES = {
  green: 'bg-green-500/15 text-green-300',
  blue: 'bg-blue-500/15 text-blue-300',
  amber: 'bg-amber-500/15 text-amber-300',
  red: 'bg-red-500/15 text-red-300',
  violet: 'bg-violet-500/15 text-violet-300',
};

export function StatCard({ label, value, hint, icon: Icon, tone = 'green' }) {
  const numericValue = Number(value);
  const canAnimate = Number.isFinite(numericValue);

  return (
    <div className="app-card stat-card">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm text-gray-400">{label}</p>
        {Icon ? (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone] || TONE_CLASSES.green}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-4 heading-font text-3xl font-semibold text-white sm:text-4xl">
        {canAnimate ? <AnimatedNumber value={numericValue} /> : value}
      </div>
      {hint ? <p className="mt-2 text-sm text-gray-500">{hint}</p> : null}
    </div>
  );
}
