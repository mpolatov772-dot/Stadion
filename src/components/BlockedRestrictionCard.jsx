import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useI18n } from '../hooks/useI18n';

export function BlockedRestrictionCard({
  compact = false,
  ownerName = '',
  reason = '',
  actionTo = '/requests',
  actionLabel,
}) {
  const { t } = useI18n();
  const resolvedLabel = actionLabel || t('blockedGate.action');

  return (
    <div className={`app-card border border-red-500/20 bg-red-500/10 ${compact ? 'py-4' : ''}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-red-500/15 p-3 text-red-200">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-red-200">
              {t('blockedGate.eyebrow')}
            </p>
            <h3 className={`mt-2 heading-font font-semibold text-white ${compact ? 'text-2xl' : 'text-4xl sm:text-5xl'}`}>
              {t('blockedGate.bigTitle')}
            </h3>
            <p className="mt-2 text-lg font-medium text-white">{t('blockedGate.title')}</p>
            <p className="mt-2 text-sm text-gray-300">{t('blockedGate.description')}</p>
            {ownerName ? (
              <p className="mt-3 text-sm text-red-100">
                {t('blockedGate.ownerLabel')}: <span className="font-medium text-white">{ownerName}</span>
              </p>
            ) : null}
            {reason ? (
              <p className="mt-1 text-sm text-red-100">
                {t('common.reason')}: <span className="font-medium text-white">{reason}</span>
              </p>
            ) : null}
          </div>
        </div>
        {actionTo.startsWith('#') ? (
          <a href={actionTo} className="app-button whitespace-nowrap">
            {resolvedLabel}
          </a>
        ) : (
          <Link to={actionTo} className="app-button whitespace-nowrap">
            {resolvedLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
