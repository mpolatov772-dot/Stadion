import { BrandLockup } from '../components/BrandLockup';
import { useI18n } from '../hooks/useI18n';

export function AuthLayout({ title, description, children }) {
  const { t } = useI18n();

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="app-card order-2 flex flex-col justify-between bg-gradient-to-br from-green-500/10 to-transparent p-5 sm:p-8 lg:order-1">
          <div>
            <div className="inline-flex rounded-[32px] border border-white/10 bg-black/15 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <BrandLockup size="lg" />
            </div>
            <h1 className="mt-6 heading-font text-3xl font-semibold text-white sm:text-4xl">
              {t('auth.heroTitle')}
            </h1>
            <p className="mt-4 max-w-md text-gray-400">
              {t('auth.heroDescription')}
            </p>
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-gray-300 lg:mt-0">
            {t('auth.heroNote')}
          </div>
        </section>

        <section className="app-card order-1 p-5 sm:p-8 lg:order-2">
          <p className="text-sm text-green-300">{description}</p>
          <h2 className="mt-3 heading-font text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </div>
  );
}
