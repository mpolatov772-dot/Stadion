import { useI18n } from '../hooks/useI18n';
import { LOCALE_LABELS } from '../locales';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value)}
      className="rounded-full border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-gray-100"
    >
      {Object.entries(LOCALE_LABELS).map(([code, { flag, code: label }]) => (
        <option key={code} value={code}>
          {flag} {label}
        </option>
      ))}
    </select>
  );
}
