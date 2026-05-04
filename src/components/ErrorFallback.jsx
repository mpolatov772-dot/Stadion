import { AlertTriangle, RefreshCw } from 'lucide-react';

import { useI18n } from '../hooks/useI18n';

export function ErrorFallback({ title, description, onRetry }) {
  const { t } = useI18n();

  return (
    <div className="app-card border border-red-500/20 bg-red-500/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-red-500/12 p-3 text-red-200">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-red-200">{t('common.error')}</p>
            <h3 className="mt-2 heading-font text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-2 max-w-2xl text-sm text-gray-300">{description}</p>
          </div>
        </div>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="app-button-secondary whitespace-nowrap">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('buttons.retry')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
