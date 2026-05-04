import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { BlockedRestrictionCard } from '../components/BlockedRestrictionCard';
import { EmptyState } from '../components/EmptyState';
import { FeedCard } from '../components/FeedCard';
import { FeedComposer } from '../components/FeedComposer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { contentService } from '../services/contentService';
import { getApiErrorMessage } from '../utils/apiError';
import { hasActiveBlockRestriction } from '../utils/blocking';

export function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 30;
  const isBlocked = hasActiveBlockRestriction(user);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const firstPage = await contentService.feed({ scope: 'community', limit: pageSize, offset: 0 });
      setFeed(firstPage);
      setHasMore(firstPage.length === pageSize);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = await contentService.feed({
        scope: 'community',
        limit: pageSize,
        offset: feed.length,
      });
      setFeed((current) => [...current, ...nextPage]);
      setHasMore(nextPage.length === pageSize);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSubmit = async (payload) => {
    if (isBlocked) {
      toast.error(t('errors.activeBlockActionRestricted'));
      return;
    }

    setBusy(true);
    try {
      await contentService.createFeedPost({
        ...payload,
        scope: 'community',
      });
      toast.success(t('messages.feedPublished'));
      await loadFeed();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.publishFeedFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('communityPage.eyebrow')}
        title={t('communityPage.title')}
        description={t('communityPage.description')}
      />

      {isBlocked ? (
        <BlockedRestrictionCard />
      ) : isAuthenticated ? (
          <FeedComposer
            busy={busy}
            onSubmit={handleSubmit}
            communityMode
            allowVideo={['seller', 'stadiumOwner'].includes(user?.role)}
          />
        ) : null}

      {loading ? (
        <LoadingSpinner label={t('nav.community')} />
      ) : feed.length ? (
        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            {feed.map((item) => (
              <FeedCard key={item._id} item={item} />
            ))}
          </div>
          {hasMore ? (
            <button type="button" className="app-button-secondary w-full" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? t('common.loadingData') : t('common.details')}
            </button>
          ) : null}
        </div>
      ) : (
        <EmptyState title={t('communityPage.emptyTitle')} description={t('communityPage.emptyDescription')} />
      )}
    </div>
  );
}
