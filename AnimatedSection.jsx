export function AnimatedSection({ as: Component = 'section', className = '', children }) {
  return <Component className={className}>{children}</Component>;
}
