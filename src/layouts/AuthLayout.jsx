import brandMark from '../assets/brand-mark.svg';
import { GlobalMotionEffects } from '../components/GlobalMotionEffects';
import { useI18n } from '../hooks/useI18n';

export function AuthLayout({ title, description, children }) {
  const { t } = useI18n();

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <GlobalMotionEffects />
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="app-card flex flex-col justify-between bg-gradient-to-br from-green-500/10 to-transparent p-8">
          <div>
            <img src={brandMark} alt={t('app.name')} className="h-20 w-auto" />
            <p className="mt-6 text-sm uppercase tracking-[0.3em] text-green-300">{t('app.name')}</p>
            <h1 className="mt-4 heading-font text-4xl font-semibold text-white">
              {t('auth.heroTitle')}
            </h1>
            <p className="mt-4 max-w-md text-gray-400">
              {t('auth.heroDescription')}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-gray-300">
            {t('auth.heroNote')}
          </div>
        </section>

        <section className="app-card p-8">
          <p className="text-sm text-green-300">{description}</p>
          <h2 className="mt-3 heading-font text-4xl font-semibold text-white">{title}</h2>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </div>
  );
}
