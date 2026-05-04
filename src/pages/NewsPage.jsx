import { useCallback, useEffect, useState } from 'react';

import { LatestFootballNewsSection } from '../components/LatestFootballNewsSection';
import { contentService } from '../services/contentService';
import { useI18n } from '../hooks/useI18n';

const emptyNewsFeed = {
  items: [],
  fetchedAt: '',
  source: 'fallback',
  fallbackUsed: true,
  tickerItems: [],
};

export function NewsPage() {
  const { t } = useI18n();
  const [newsFeed, setNewsFeed] = useState(emptyNewsFeed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadNews = useCallback(async () => {
    setLoading(true);

    try {
      const payload = await contentService.news({ limit: 18 });
      setNewsFeed(payload);
      setError(false);
    } catch {
      setNewsFeed(emptyNewsFeed);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  return (
    <div className="space-y-6">
      <LatestFootballNewsSection
        eyebrow={t('newsPage.eyebrow')}
        title={t('newsPage.title')}
        description={t('newsPage.description')}
        articles={newsFeed.items}
        loading={loading}
        error={error}
        onRetry={loadNews}
      />
    </div>
  );
}
