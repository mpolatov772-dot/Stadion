import { Link } from 'react-router-dom';

import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../hooks/useI18n';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('notFoundPage.eyebrow')}
        title={t('notFoundPage.title')}
        description={t('notFoundPage.description')}
      />
      <div className="app-card">
        <Link to="/" className="app-button">
          {t('buttons.returnHome')}
        </Link>
      </div>
    </div>
  );
}
