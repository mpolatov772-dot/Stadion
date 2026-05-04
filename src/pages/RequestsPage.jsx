import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { BlockedRestrictionCard } from '../components/BlockedRestrictionCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/apiError';
import { getBlockReasonTranslationKey, getGenericStatusLabelKey } from '../utils/display';
import { formatDateTime } from '../utils/formatters';

export function RequestsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [inbox, setInbox] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const selectedBlock = activeBlocks.find((block) => block._id === selectedBlockId) || activeBlocks[0] || null;

  const loadData = async () => {
    setLoading(true);
    try {
      if (user.role === 'stadiumOwner' || user.role === 'admin') {
        setInbox(await userService.inboxRequests());
      } else {
        const [requests, blocks] = await Promise.all([
          userService.outboxRequests(),
          userService.activeRequestableBlocks(),
        ]);
        setOutbox(requests);
        setActiveBlocks(blocks);
        setSelectedBlockId(blocks[0]?._id || '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.role]);

  const handleDecision = async (requestId, status) => {
    try {
      await userService.decideRequest(requestId, { status });
      toast.success(t(status === 'approved' ? 'messages.requestApproved' : 'messages.requestRejected'));
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.updateRequestFailed'));
    }
  };

  const handleCreateRequest = async (event) => {
    event.preventDefault();

    if (!selectedBlockId || !message.trim()) {
      toast.error(t('messages.selectBlockAndMessage'));
      return;
    }

    try {
      await userService.createUnblockRequest({
        blockId: selectedBlockId,
        message,
      });
      toast.success(t('messages.requestSent'));
      setMessage('');
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.sendRequestFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('requestsPage.eyebrow')}
        title={user.role === 'stadiumOwner' || user.role === 'admin' ? t('requestsPage.ownerTitle') : t('requestsPage.userTitle')}
        description={
          user.role === 'stadiumOwner' || user.role === 'admin'
            ? t('requestsPage.ownerDescription')
            : t('requestsPage.userDescription')
        }
      />

      {loading ? (
        <LoadingSpinner label={t('requestsPage.eyebrow')} />
      ) : user.role === 'stadiumOwner' || user.role === 'admin' ? (
        inbox.length ? (
          <div className="space-y-4">
            {inbox.map((request) => (
              <div key={request._id} className="app-card">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm text-green-300">{t(getGenericStatusLabelKey(request.status))}</p>
                    <h3 className="mt-2 heading-font text-2xl font-semibold text-white">
                      {request.blockedUser?.fullName}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">{request.message}</p>
                    <p className="mt-3 text-sm text-gray-500">{formatDateTime(request.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="app-button" onClick={() => handleDecision(request._id, 'approved')}>
                      {t('buttons.approve')}
                    </button>
                    <button
                      type="button"
                      className="app-button-secondary"
                      onClick={() => handleDecision(request._id, 'rejected')}
                    >
                      {t('buttons.reject')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title={t('empty.noIncomingRequests')} description={t('empty.noIncomingRequestsDescription')} />
        )
      ) : (
        <div className="page-grid">
          {activeBlocks.length ? (
            <div className="space-y-4">
              <BlockedRestrictionCard
                ownerName={selectedBlock?.owner?.fullName || ''}
                reason={
                  selectedBlock
                    ? getBlockReasonTranslationKey(selectedBlock.reason)
                      ? t(getBlockReasonTranslationKey(selectedBlock.reason))
                      : selectedBlock.reason
                    : ''
                }
                actionTo="#blockdan-chiqarish-formasi"
                actionLabel={t('requestsPage.actionButton')}
              />
              <form id="blockdan-chiqarish-formasi" onSubmit={handleCreateRequest} className="app-card space-y-4">
                <div>
                  <h3 className="heading-font text-2xl font-semibold text-white">{t('requestsPage.apologyTitle')}</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {t('requestsPage.sendDescription')}
                  </p>
                </div>
                <div>
                  <label className="app-label">{t('labels.activeBlock')}</label>
                  <select
                    className="app-input"
                    value={selectedBlockId}
                    onChange={(event) => setSelectedBlockId(event.target.value)}
                  >
                    <option value="">{t('requestsPage.selectBlock')}</option>
                    {activeBlocks.map((block) => (
                      <option key={block._id} value={block._id}>
                        {(block.owner?.fullName || t('common.noData'))} • {getBlockReasonTranslationKey(block.reason)
                          ? t(getBlockReasonTranslationKey(block.reason))
                          : block.reason}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="app-label">{t('labels.apologyMessage')}</label>
                  <textarea
                    className="app-input min-h-28"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t('placeholders.apologyMessage')}
                  />
                </div>
                <button type="submit" className="app-button w-full">
                  {t('requestsPage.actionButton')}
                </button>
              </form>
            </div>
          ) : (
            <div className="app-card">
              <h3 className="heading-font text-2xl font-semibold text-white">{t('requestsPage.blockedOnlyTitle')}</h3>
              <p className="mt-2 text-sm text-gray-400">{t('messages.requestFormHidden')}</p>
            </div>
          )}

          {activeBlocks.length ? (
            <div className="space-y-4">
              <div className="app-card">
                <h3 className="heading-font text-2xl font-semibold text-white">{t('requestsPage.myActiveBlocks')}</h3>
                <div className="mt-4 space-y-3">
                  {activeBlocks.map((block) => (
                    <div key={block._id} className="rounded-xl border border-white/10 px-4 py-3">
                      <p className="text-sm text-green-300">{block.owner?.fullName || t('common.noData')}</p>
                      <p className="font-medium text-white">
                        {getBlockReasonTranslationKey(block.reason)
                          ? t(getBlockReasonTranslationKey(block.reason))
                          : block.reason}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">{t('common.status')}: {t(getGenericStatusLabelKey(block.status))}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="app-card">
                <h3 className="heading-font text-2xl font-semibold text-white">{t('requestsPage.requestHistory')}</h3>
                <div className="mt-4 space-y-3">
                  {outbox.length ? (
                    outbox.map((request) => (
                      <div key={request._id} className="rounded-xl border border-white/10 px-4 py-3">
                        <p className="font-medium text-white">{t(getGenericStatusLabelKey(request.status))}</p>
                        <p className="mt-1 text-sm text-green-300">
                          {request.owner?.fullName || t('common.noData')}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">{request.message}</p>
                        <p className="mt-1 text-xs text-gray-500">{formatDateTime(request.createdAt)}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState title={t('empty.noRequestsSent')} description={t('empty.noRequestsSentDescription')} />
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
