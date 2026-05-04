import { useI18n } from '../hooks/useI18n';
import { getFeedTypeLabelKey, getRoleLabelKey } from '../utils/display';
import { formatDateTime } from '../utils/formatters';

export function FeedCard({ item }) {
  const { t } = useI18n();
  const hasVideo = item.mediaType === 'video' && item.mediaUrl;
  const hasImage = item.mediaType === 'image' && item.mediaUrl;
  const authorInitials = String(item.author?.fullName || 'FM')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <article className="app-card football-card flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6 text-green-300">{t(getFeedTypeLabelKey(item.type))}</p>
          <h3 className="mt-2 heading-font text-2xl font-semibold leading-tight text-white break-words">
            {item.title}
          </h3>
        </div>
        <span className="shrink-0 text-xs leading-5 text-gray-500">{formatDateTime(item.createdAt)}</span>
      </div>
      <p className="text-sm leading-7 text-gray-400 break-words">{item.content}</p>
      {hasVideo ? (
        <div className="mt-5 flex justify-center">
          <div className="relative h-48 w-48 overflow-hidden rounded-full border border-green-500/30 bg-black/20 shadow-lg shadow-green-500/10">
            <video
              src={item.mediaUrl}
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ) : null}
      {hasImage ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <img src={item.mediaUrl} alt={item.title} className="h-72 w-full object-cover" />
        </div>
      ) : null}
      <div className="mt-auto flex items-center gap-3 text-sm text-gray-300">
        {item.author?.avatar ? (
          <img
            src={item.author.avatar}
            alt={item.author?.fullName || t('common.fullName')}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15 text-xs font-semibold text-green-300">
            {authorInitials}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{item.author?.fullName || t('dashboard.adminFeedTitle')}</p>
          <p className="text-xs leading-5 text-gray-500">{t(getRoleLabelKey(item.author?.role || item.authorRole))}</p>
        </div>
      </div>
    </article>
  );
}
