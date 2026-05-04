import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/apiError';

export function SettingsPage() {
  const { t } = useI18n();
  const { user, logout, refreshUser } = useAuth();
  const defaultPreferences = {
    notifications: true,
    weeklyDigest: true,
    compactCards: false,
    proFeaturesPreview: false,
  };
  const [preferences, setPreferences] = useState({
    notifications: true,
    weeklyDigest: true,
    compactCards: false,
    proFeaturesPreview: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPreferences({
      notifications: user.preferences?.notifications ?? defaultPreferences.notifications,
      weeklyDigest: user.preferences?.weeklyDigest ?? defaultPreferences.weeklyDigest,
      compactCards: user.preferences?.compactCards ?? defaultPreferences.compactCards,
      proFeaturesPreview: user.preferences?.proFeaturesPreview ?? defaultPreferences.proFeaturesPreview,
    });
  }, [user]);

  const settingOptions = [
    ['notifications', 'settings.notifications'],
    ['weeklyDigest', 'settings.weeklyDigest'],
    ['compactCards', 'settings.compactCards'],
    ['proFeaturesPreview', 'settings.proFeaturesPreview'],
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await userService.updatePreferences(preferences);
      await refreshUser();
      toast.success(t('messages.settingsUpdated'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.saveSettingsFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('settingsPage.eyebrow')}
        title={t('settingsPage.title')}
        description={t('settingsPage.description')}
      />

      <div className="page-grid">
        <form onSubmit={handleSubmit} className="app-card space-y-4">
          <div className="grid gap-4">
            {settingOptions.map(([key, labelKey]) => {
              const active = Boolean(preferences[key]);

              return (
                <label
                  key={key}
                  className={`flex items-start rounded-2xl border p-4 transition-all ${
                    active
                      ? 'border-green-500/40 bg-green-500/10 shadow-[0_0_0_1px_rgba(34,197,94,0.08)]'
                      : 'border-white/10 bg-white/5 hover:border-green-400/20 hover:bg-white/[0.07]'
                  } ${saving ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-base font-medium text-white">{t(labelKey)}</p>
                      <span className="relative mt-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={active}
                          disabled={saving}
                          onChange={(event) =>
                            setPreferences((current) => ({
                              ...current,
                              [key]: event.target.checked,
                            }))
                          }
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`flex h-5 w-5 items-center justify-center rounded-[4px] border transition-all ${
                          active
                              ? 'border-green-400/70 bg-green-300/90 text-[#0f1720]'
                              : 'border-white/20 bg-[#0f1720] text-transparent'
                          } peer-focus-visible:ring-2 peer-focus-visible:ring-green-500/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#111827]`}
                        >
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                            <path
                              d="M3.5 8.5L6.5 11.5L12.5 4.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {active ? t('settingsPage.optionEnabled') : t('settingsPage.optionDisabled')}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
            {t('settingsPage.helpText')}
          </div>

          <button type="submit" className="app-button w-full" disabled={saving}>
            {saving ? `${t('common.save')}...` : t('buttons.saveSettings')}
          </button>
        </form>

        <div className="space-y-4">
          <div className="app-card">
            <h3 className="heading-font text-2xl font-semibold text-white">{t('settingsPage.sessionTitle')}</h3>
            <p className="mt-2 text-sm text-gray-400">
              {t('settingsPage.sessionDescription')}
            </p>
          </div>
          <div className="app-card">
            <h3 className="heading-font text-2xl font-semibold text-white">{t('settingsPage.securityTitle')}</h3>
            <p className="mt-2 text-sm text-gray-400">
              {t('settingsPage.securityDescription')}
            </p>
            <button type="button" className="app-button mt-4 w-full" onClick={logout}>
              {t('buttons.logoutDevice')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
