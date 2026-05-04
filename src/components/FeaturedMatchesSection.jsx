import { AnimatedSection } from './AnimatedSection';
import { ErrorFallback } from './ErrorFallback';
import { FootballMatchesPanel } from './FootballMatchesPanel';
import { LoadingSpinner } from './LoadingSpinner';
import { PageHeader } from './PageHeader';
import { useI18n } from '../hooks/useI18n';

export function FeaturedMatchesSection({
  eyebrow,
  title,
  description,
  matches = [],
  loading = false,
  error = false,
  onRetry,
  action,
}) {
  const { t } = useI18n();

  return (
    <AnimatedSection className="space-y-4">
      <PageHeader eyebrow={eyebrow} title={title} description={description} action={action} />

      {loading ? (
        <LoadingSpinner label={t('common.loadingMatches')} />
      ) : error ? (
        <ErrorFallback
          title={t('home.matchesErrorTitle')}
          description={t('home.matchesErrorDescription')}
          onRetry={onRetry}
        />
      ) : (
        <FootballMatchesPanel matches={matches} />
      )}
    </AnimatedSection>
  );
}
