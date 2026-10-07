import brandMark from '../assets/brand-mark.svg';

const shellSizeClasses = {
  sm: 'h-12 w-12 rounded-[18px]',
  md: 'h-16 w-16 rounded-[22px]',
  lg: 'h-24 w-24 rounded-[28px]',
};

const imageSizeClasses = {
  sm: 'h-9',
  md: 'h-12',
  lg: 'h-[4.6rem]',
};

const titleSizeClasses = {
  sm: 'text-[1.75rem]',
  md: 'text-[2rem]',
  lg: 'text-[2.4rem]',
};

export function BrandLockup({
  size = 'md',
  showWordmark = true,
  showTagline = true,
  className = '',
  textClassName = '',
  taglineClassName = '',
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <div
        className={`relative flex shrink-0 items-center justify-center border border-[#00C26F]/20 bg-[radial-gradient(circle_at_30%_25%,rgba(200,255,0,0.18),rgba(0,194,111,0.14)_28%,rgba(17,24,39,0.96)_72%,rgba(10,10,10,0.98)_100%)] shadow-[0_14px_30px_rgba(0,0,0,0.28),0_0_28px_rgba(0,194,111,0.12)] ${shellSizeClasses[size]}`}
      >
        <div className="absolute inset-0 [border-radius:inherit] bg-[linear-gradient(145deg,rgba(255,255,255,0.12),transparent_38%,transparent_62%,rgba(255,255,255,0.04))]" />
        <img
          src={brandMark}
          alt="GoalX logo"
          className={`relative z-10 w-auto drop-shadow-[0_10px_16px_rgba(0,0,0,0.3)] ${imageSizeClasses[size]}`}
        />
      </div>

      {showWordmark ? (
        <div className={`min-w-0 ${textClassName}`.trim()}>
          <p className={`heading-font uppercase leading-none text-white ${titleSizeClasses[size]}`}>
            GOAL<span className="text-[#00C26F]">X</span>
          </p>
          {showTagline ? (
            <p className={`mt-1 text-[10px] uppercase tracking-[0.34em] text-gray-400 sm:text-xs ${taglineClassName}`.trim()}>
              FOOTBALL PLATFORM
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
