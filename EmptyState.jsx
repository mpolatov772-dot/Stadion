export function EmptyState({ title, description }) {
  return (
    <div className="app-card flex min-h-48 flex-col items-center justify-center text-center">
      <p className="heading-font text-2xl font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-md text-sm text-gray-400">{description}</p>
    </div>
  );
}
