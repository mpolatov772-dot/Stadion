import { createFeedEntry, listFeed } from '../models/Feed.js';
import { listUsers } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { assertNoActiveBlockRestriction } from '../utils/blocking.js';
import { ROLES } from '../utils/constants.js';
import { notifyUsers } from '../utils/notifications.js';
import { buildUserLookup, serializeFeed } from '../utils/serializers.js';

export const getFeed = async (_req, res) => {
  const scope = _req.query.scope || 'updates';
  const limit = Math.min(Math.max(Number(_req.query.limit) || 50, 1), 100);
  const offset = Math.max(Number(_req.query.offset) || 0, 0);
  const [feedEntries, users] = await Promise.all([listFeed(), listUsers()]);
  const userLookup = buildUserLookup(users);
  const filteredEntries = feedEntries.filter((entry) => {
    if (scope === 'community') {
      return entry.scope === 'community';
    }

    if (scope === 'all') {
      return true;
    }

    return entry.scope !== 'community';
  });

  const sortedEntries = filteredEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const page = sortedEntries.slice(offset, offset + limit);

  res.json({
    success: true,
    data: page.map((entry) => serializeFeed(entry, userLookup)),
  });
};

export const createPost = async (req, res) => {
  const { title, content, type = 'general', scope = 'updates', mediaUrl = '', mediaType = '' } = req.body || {};
  const isCommunityPost = scope === 'community';
  const canPublishUpdate = [ROLES.SELLER, ROLES.STADIUM_OWNER, ROLES.ADMIN].includes(req.user.role);
  const isVideoUpload = mediaType === 'video';
  const canAttachMedia =
    !mediaUrl ||
    !isVideoUpload ||
    [ROLES.SELLER, ROLES.STADIUM_OWNER].includes(req.user.role);

  const mediaLength = typeof mediaUrl === 'string' ? mediaUrl.length : 0;
  // Base64 data URL'larni haddan tashqari katta yuborish serverni sekinlashtiradi.
  // Frontend ham cheklaydi, lekin backendda ham himoya bo'lishi kerak.
  if (mediaLength > 15_000_000) {
    throw new AppError('Payload too large', 413);
  }

  if (!isCommunityPost && !canPublishUpdate) {
    throw new AppError('Only sellers and stadium owners can publish updates', 403);
  }

  await assertNoActiveBlockRestriction(req.user);

  if (!title?.trim() || !content?.trim()) {
    throw new AppError('Title and content are required', 400);
  }

  if (!canAttachMedia) {
    throw new AppError('Only stadium owners and sellers can publish video posts', 403);
  }

  const entry = await createFeedEntry({
    authorId: req.user._id,
    authorRole: req.user.role,
    type,
    scope,
    title: title.trim(),
    content: content.trim(),
    mediaUrl: mediaUrl.trim(),
    mediaType: mediaType.trim(),
  });

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  if (scope === 'community') {
    await notifyUsers(
      users.map((user) => user._id).filter((userId) => userId !== req.user._id),
      {
        type: 'community-message',
        title: 'Jamoada yangi xabar',
        content: `${req.user.fullName} umumiy guruhga yangi xabar qoldirdi.`,
        link: '/community',
        metadata: {
          feedId: entry._id,
        },
      },
    );
  }

  res.status(201).json({
    success: true,
    data: serializeFeed(entry, userLookup),
  });
};
