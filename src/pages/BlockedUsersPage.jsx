import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { dashboardService } from '../services/dashboardService';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/apiError';
import {
  getBlockReasonTranslationKey,
  getGenericStatusLabelKey,
  getRoleLabelKey,
} from '../utils/display';
import { formatDateTime } from '../utils/formatters';

const buildOwnerBlockLookup = (blocks = []) => {
  const lookup = new Map();

  blocks.forEach((block) => {
    if (!block?.blockedUserId) {
      return;
    }

    const current = lookup.get(block.blockedUserId);

    if (!current) {
      lookup.set(block.blockedUserId, block);
      return;
    }

    if (current.status !== 'active' && block.status === 'active') {
      lookup.set(block.blockedUserId, block);
      return;
    }

    if (
      current.status === block.status &&
      new Date(block.updatedAt || block.createdAt || 0) >
        new Date(current.updatedAt || current.createdAt || 0)
    ) {
      lookup.set(block.blockedUserId, block);
    }
  });

  return lookup;
};

const mergeOwnerMemberEntries = (ownerUsers = [], availableMembers = [], blocks = []) => {
  const merged = new Map();
  const blockLookup = buildOwnerBlockLookup(blocks);

  availableMembers.forEach((item) => {
    if (!item?.user?._id) {
      return;
    }

    merged.set(item.user._id, {
      user: item.user,
      bookingCount: 0,
      lastBooking: null,
      history: [],
      block: blockLookup.get(item.user._id) || item.block || null,
      requests: [],
    });
  });

  ownerUsers.forEach((item) => {
    if (!item?.user?._id) {
      return;
    }

    merged.set(item.user._id, {
      ...(merged.get(item.user._id) || {}),
      ...item,
      user: item.user,
      bookingCount: Number(item.bookingCount || 0),
      history: item.history || [],
      block: blockLookup.get(item.user._id) || item.block || null,
      requests: item.requests || [],
    });
  });

  return [...merged.values()].sort((left, right) => {
    const leftActive = left.block?.status === 'active' ? 1 : 0;
    const rightActive = right.block?.status === 'active' ? 1 : 0;

    if (leftActive !== rightActive) {
      return rightActive - leftActive;
    }

    return String(left.user?.fullName || '').localeCompare(String(right.user?.fullName || ''), 'uz');
  });
};

export function BlockedUsersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [blocks, setBlocks] = useState([]);
  const [ownerUsers, setOwnerUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [actionReasons, setActionReasons] = useState({});

  const loadBlocks = async () => {
    setLoading(true);
    try {
      if (user.role === 'stadiumOwner' || user.role === 'admin') {
        const [blockResult, summaryResult] = await Promise.allSettled([
          userService.ownerBlocks(),
          dashboardService.summary(),
        ]);

        const blockData = blockResult.status === 'fulfilled' ? blockResult.value : null;
        const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;

        if (blockData) {
          setBlocks(blockData);
        }

        if (summary) {
          setOwnerUsers(
            mergeOwnerMemberEntries(
              summary.ownerUsers || [],
              summary.availableMembers || [],
              blockData || blocks || [],
            ),
          );
        } else if (blockData) {
          setOwnerUsers((current) =>
            mergeOwnerMemberEntries(current, current, blockData || []),
          );
        }

        if (blockResult.status === 'rejected' && summaryResult.status === 'rejected') {
          throw blockResult.reason || summaryResult.reason || new Error('Failed to load owner block data');
        }
      } else {
        setBlocks(await userService.myBlocks());
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.loadDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [user.role]);

  const handleBlockToggle = async (item) => {
    const reason = String(actionReasons[item.user._id] || '').trim();

    if (!reason) {
      toast.error(
        item.block?.status === 'active'
          ? t('errors.unblockReasonRequired')
          : t('errors.blockReasonRequired'),
      );
      return;
    }

    setProcessingId(item.user._id);
    try {
      if (item.block?.status === 'active') {
        await userService.updateBlock(item.block._id, {
          status: 'lifted',
          liftReason: reason,
        });
        setBlocks((current) =>
          current.map((block) =>
            block._id === item.block._id
              ? {
                  ...block,
                  status: 'lifted',
                  liftReason: reason,
                  updatedAt: new Date().toISOString(),
                }
              : block,
          ),
        );
        setOwnerUsers((current) =>
          current.map((entry) =>
            entry.user?._id === item.user._id
              ? {
                  ...entry,
                  block: entry.block
                    ? {
                        ...entry.block,
                        status: 'lifted',
                        liftReason: reason,
                        updatedAt: new Date().toISOString(),
                      }
                    : null,
                }
              : entry,
          ),
        );
        toast.success(t('messages.blockLifted'));
      } else {
        const createdBlock = await userService.createBlock({
          blockedUserId: item.user._id,
          bookingId: item.lastBooking?._id || null,
          reason,
        });
        setBlocks((current) => [createdBlock, ...current]);
        setOwnerUsers((current) =>
          current.map((entry) =>
            entry.user?._id === item.user._id
              ? {
                  ...entry,
                  block: createdBlock,
                }
              : entry,
          ),
        );
        toast.success(t('messages.blockCreated'));
      }

      setActionReasons((current) => ({
        ...current,
        [item.user._id]: '',
      }));
      await loadBlocks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.sendRequestFailed'));
    } finally {
      setProcessingId('');
    }
  };

  const handleReasonChange = (userId, value) => {
    setActionReasons((current) => ({
      ...current,
      [userId]: value,
    }));
  };

  const filteredOwnerUsers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();

    if (!query) {
      return ownerUsers;
    }

    return ownerUsers.filter((item) => {
      const fullName = String(item.user?.fullName || '').toLowerCase();
      const phone = String(item.user?.phone || '').toLowerCase();
      const role = t(getRoleLabelKey(item.user?.role)).toLowerCase();

      return fullName.includes(query) || phone.includes(query) || role.includes(query);
    });
  }, [memberSearch, ownerUsers, t]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('blockedUsersPage.eyebrow')}
        title={user.role === 'stadiumOwner' || user.role === 'admin' ? t('blockedUsersPage.ownerTitle') : t('blockedUsersPage.userTitle')}
        description={
          user.role === 'stadiumOwner' || user.role === 'admin'
            ? t('blockedUsersPage.ownerDescription')
            : t('blockedUsersPage.userDescription')
        }
      />

      {loading ? (
        <LoadingSpinner label={t('blockedUsersPage.ownerTitle')} />
      ) : user.role === 'stadiumOwner' || user.role === 'admin' ? (
        ownerUsers.length ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-400">{t('dashboard.sections.allMembersDescription')}</p>
              <input
                className="app-input md:w-80"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder={t('placeholders.searchMembers')}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {filteredOwnerUsers.map((item) => (
              <div key={item.user._id} className="app-card">
                <p className="text-sm text-green-300">
                  {t(getGenericStatusLabelKey(item.block?.status || 'lifted'))}
                </p>
                <h3 className="mt-2 heading-font text-2xl font-semibold text-white">
                  {item.user.fullName}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {t(getRoleLabelKey(item.user.role))}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  {item.bookingCount} ta bron • {item.lastBooking ? formatDateTime(item.lastBooking.createdAt) : t('common.noData')}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  {t('common.reason')}: {item.block
                    ? getBlockReasonTranslationKey(item.block.reason)
                      ? t(getBlockReasonTranslationKey(item.block.reason))
                      : item.block.reason
                    : t('common.noData')}
                </p>
                {item.block?.liftReason ? (
                  <p className="mt-2 text-sm text-gray-400">
                    {t('blockedUsersPage.currentUnblockReason')}: {item.block.liftReason}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-gray-500">{item.user.phone || t('common.noData')}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    {item.block?.status === 'active' ? t('common.unblockReason') : t('common.blockReason')}
                  </p>
                  <textarea
                    className="app-input min-h-28 resize-y"
                    value={actionReasons[item.user._id] || ''}
                    onChange={(event) => handleReasonChange(item.user._id, event.target.value)}
                    placeholder={
                      item.block?.status === 'active'
                        ? t('placeholders.unblockReason')
                        : t('placeholders.blockReason')
                    }
                  />
                  <p className="text-xs text-gray-500">{t('blockedUsersPage.reasonNote')}</p>
                </div>
                <button
                  type="button"
                  className="app-button mt-4 w-full"
                  disabled={processingId === item.user._id}
                  onClick={() => handleBlockToggle(item)}
                >
                  {processingId === item.user._id
                    ? t('common.loadingData')
                    : item.block?.status === 'active'
                      ? t('buttons.unblockUser')
                      : t('buttons.blockUser')}
                </button>
              </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title={t('empty.noBlockRecords')}
            description={t('empty.noOwnerBookingsDescription')}
          />
        )
      ) : blocks.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {blocks.map((block) => (
            <div key={block._id} className="app-card">
              <p className="text-sm text-green-300">{t(getGenericStatusLabelKey(block.status))}</p>
              <h3 className="mt-2 heading-font text-2xl font-semibold text-white">{block.owner?.fullName}</h3>
              <p className="mt-2 text-sm text-gray-400">
                {t('common.reason')}: {getBlockReasonTranslationKey(block.reason)
                  ? t(getBlockReasonTranslationKey(block.reason))
                  : block.reason}
              </p>
              <p className="mt-2 text-sm text-gray-500">{t('common.createdAt')}: {formatDateTime(block.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('empty.noBlockRecords')}
          description={t('empty.noBlockRecordsDescription')}
        />
      )}
    </div>
  );
}
