import { Star } from 'lucide-react';

const STAR_VALUES = [1, 2, 3, 4, 5];

export function StarRating({ value = 0, size = 18, interactive = false, onRate, disabled = false }) {
  const filledCount = Math.round(value);

  return (
    <div className="inline-flex items-center gap-1">
      {STAR_VALUES.map((starValue) => {
        const filled = starValue <= filledCount;
        const Icon = (
          <Star
            className={filled ? 'text-[#facc15]' : 'text-gray-600'}
            style={{ width: size, height: size }}
            fill={filled ? '#facc15' : 'none'}
          />
        );

        if (!interactive) {
          return <span key={starValue}>{Icon}</span>;
        }

        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            aria-label={`${starValue}`}
            onClick={() => onRate?.(starValue)}
            className="disabled:opacity-50"
          >
            {Icon}
          </button>
        );
      })}
    </div>
  );
}
