import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';

import { useI18n } from '../hooks/useI18n';
import { readFileAsDataUrl } from '../utils/media';

export function FeedComposer({ busy, onSubmit, communityMode = false, allowVideo = false }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState(communityMode ? 'community-text' : 'general');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      title: title || (communityMode ? t('communityPage.eyebrow') : t('placeholders.feedTitle')),
      content,
      type,
      mediaUrl,
      mediaType,
    });
    setTitle('');
    setContent('');
    setType(communityMode ? 'community-text' : 'general');
    setMediaUrl('');
    setMediaType('');
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const maxBytes = isVideo ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(
        isVideo
          ? t('errors.videoFileTooLarge', { mb: 10 })
          : t('errors.imageFileTooLarge', { mb: 2 }),
      );
      event.target.value = '';
      return;
    }

    setMediaUrl(await readFileAsDataUrl(file));
    setMediaType(isVideo ? 'video' : 'image');
    event.target.value = '';
  };

  const isVideoType = type === 'community-video';

  return (
    <form onSubmit={handleSubmit} className="app-card animate-fade-up space-y-5">
      <div>
        <h3 className="heading-font text-2xl font-semibold leading-tight text-white break-words">
          {communityMode ? t('communityPage.title') : t('forms.feed.title')}
        </h3>
        <p className="mt-2 text-sm leading-7 text-gray-400 break-words">
          {communityMode ? t('communityPage.description') : t('forms.feed.description')}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="app-label">{t('labels.title')}</label>
          <input
            className="app-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={communityMode ? t('communityPage.eyebrow') : t('placeholders.feedTitle')}
          />
        </div>
        <div>
          <label className="app-label">{t('labels.type')}</label>
          <select className="app-input" value={type} onChange={(event) => setType(event.target.value)}>
            {communityMode ? (
              <>
                <option value="community-text">{t('feedTypes.community-text')}</option>
                {allowVideo ? <option value="community-video">{t('feedTypes.community-video')}</option> : null}
              </>
            ) : (
              <>
                <option value="general">{t('feedTypes.general')}</option>
                <option value="product-update">{t('feedTypes.product-update')}</option>
                <option value="stadium-update">{t('feedTypes.stadium-update')}</option>
              </>
            )}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="app-label">{t('labels.content')}</label>
          <textarea
            className="app-input min-h-28"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={communityMode ? t('placeholders.communityMessage') : t('placeholders.feedContent')}
          />
        </div>
        {communityMode ? (
          <div className="md:col-span-2">
            <label className="app-label">
              {isVideoType ? t('labels.videoFile') : t('labels.imageFile')}
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-5 text-sm text-gray-300 transition hover:border-green-500/40 hover:bg-green-500/5">
              <Upload className="h-4 w-4 text-green-300" />
              {isVideoType ? t('buttons.uploadVideo') : t('buttons.uploadImage')}
              <input
                type="file"
                accept={isVideoType ? 'video/*' : 'image/*'}
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {mediaUrl ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} controls className="h-56 w-full object-cover" />
                ) : (
                  <img src={mediaUrl} alt={t('labels.title')} className="h-56 w-full object-cover" />
                )}
              </div>
            ) : null}
            <p className="mt-2 text-xs leading-5 text-gray-500 break-words">
              {isVideoType ? t('communityPage.videoHint') : t('communityPage.imageHint')}
            </p>
          </div>
        ) : null}
      </div>
      <button type="submit" className="app-button w-full" disabled={busy}>
        {busy ? t('buttons.publishing') : t('buttons.publishUpdate')}
      </button>
    </form>
  );
}
