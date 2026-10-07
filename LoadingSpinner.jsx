import { useI18n } from '../hooks/useI18n';

export function LoadingSpinner({ label }) {
  const { t } = useI18n();

  return (
    <div className="app-card flex items-center gap-4">
      <div className="loading-dot" />
      <div>
        <p className="heading-font text-lg font-semibold text-white">{label || t('common.loadingData')}</p>
        <p className="text-sm text-gray-400">{t('common.loadingHint')}</p>
      </div>
    </div>
  );
}
