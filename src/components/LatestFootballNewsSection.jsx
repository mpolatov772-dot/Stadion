import { EmptyState } from './EmptyState';
import { ErrorFallback } from './ErrorFallback';
import { AnimatedSection } from './AnimatedSection';
import { LoadingSpinner } from './LoadingSpinner';
import { NewsCard } from './NewsCard';
import { PageHeader } from './PageHeader';
import { useI18n } from '../hooks/useI18n';

export function LatestFootballNewsSection({
  eyebrow,
  title,
  description,
  action,
  articles = [],
  loading = false,
  error = false,
  onRetry,
  columns = 'xl:grid-cols-3',
}) {
  const { t } = useI18n();

  return (
    <AnimatedSection className="space-y-4">
      <PageHeader eyebrow={eyebrow} title={title} description={description} action={action} />

      {loading ? (
        <LoadingSpinner label={t('common.loadingNews')} />
      ) : error ? (
        <ErrorFallback
          title={t('newsPage.errorTitle')}
          description={t('newsPage.errorDescription')}
          onRetry={onRetry}
        />
      ) : articles.length ? (
        <div className={`grid gap-6 ${columns}`}>
          {articles.map((article, index) => (
            <AnimatedSection as="div" key={article._id} delay={index * 80}>
              <NewsCard article={article} />
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <EmptyState title={t('empty.noArticles')} description={t('empty.noArticlesDescription')} />
      )}
    </AnimatedSection>
  );
}
