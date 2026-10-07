export function AnimatedNumber({ value, className = '', prefix = '', suffix = '' }) {
  return (
    <span className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
