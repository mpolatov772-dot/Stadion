import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

export function SettingsPage() {
  const { t } = useI18n();
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('settingsPage.eyebrow')}
        title={t('settingsPage.title')}
        description={t('settingsPage.description')}
      />

      <div className="page-grid">
        <div className="app-card space-y-2">
          <h3 className="heading-font text-2xl font-semibold text-white">{t('settingsPage.sessionTitle')}</h3>
          <p className="text-sm text-gray-400">{t('settingsPage.sessionDescription')}</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
            <p className="font-medium text-white">{user.fullName}</p>
            <p className="mt-1 text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="app-card space-y-2">
          <h3 className="heading-font text-2xl font-semibold text-white">{t('settingsPage.securityTitle')}</h3>
          <p className="text-sm text-gray-400">{t('settingsPage.securityDescription')}</p>
          <button type="button" className="app-button mt-4 w-full" onClick={logout}>
            {t('buttons.logoutDevice')}
          </button>
        </div>
      </div>
    </div>
  );
}
