export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
      <div className="min-w-0 max-w-4xl">
        {eyebrow ? (
          <div className="mb-3 inline-flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-green-400 to-transparent" />
            <p className="text-xs uppercase tracking-[0.28em] text-green-300 sm:text-sm">{eyebrow}</p>
          </div>
        ) : null}
        <h1 className="heading-font text-3xl font-semibold text-white md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400 md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
