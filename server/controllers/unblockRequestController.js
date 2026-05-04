import {
  findBlockById,
  listBlocksByUser,
  updateBlock,
} from '../models/Block.js';
import {
  createUnblockRequest,
  findUnblockRequestById,
  listUnblockRequests,
  listUnblockRequestsByOwner,
  listUnblockRequestsByUser,
  updateUnblockRequest,
} from '../models/UnblockRequest.js';
import { listUsers } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../utils/constants.js';
import { notifyUser } from '../utils/notifications.js';
import { buildUserLookup, serializeBlock, serializeRequest } from '../utils/serializers.js';

export const createRequest = async (req, res) => {
  const { blockId, message } = req.body || {};

  if (!blockId || !message?.trim()) {
    throw new AppError('blockId and message are required', 400);
  }

  const block = await findBlockById(blockId);

  if (!block || block.blockedUserId !== req.user._id || block.status !== 'active') {
    throw new AppError('You can only request an unblock for your active block', 403);
  }

  const existingPending = (await listUnblockRequests()).find(
    (request) => request.blockId === blockId && request.status === 'pending',
  );

  if (existingPending) {
    throw new AppError('There is already a pending request for this block', 409);
  }

  const unblockRequest = await createUnblockRequest({
    blockId,
    ownerId: block.ownerId,
    blockedUserId: req.user._id,
    message: message.trim(),
  });

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  await notifyUser({
    userId: block.ownerId,
    type: 'unblock-request',
    title: "Yangi uzr va ochish so'rovi",
    content: `${req.user.fullName} sizga uzr va blokni ochish so'rovini yubordi.`,
    link: '/requests',
    metadata: {
      requestId: unblockRequest._id,
      blockId,
    },
  });

  res.status(201).json({
    success: true,
    data: serializeRequest(unblockRequest, userLookup),
  });
};

export const getInboxRequests = async (req, res) => {
  const requests =
    req.user.role === ROLES.ADMIN
      ? await listUnblockRequests()
      : await listUnblockRequestsByOwner(req.user._id);
  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: requests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((request) => serializeRequest(request, userLookup)),
  });
};

export const getOutboxRequests = async (req, res) => {
  const requests = await listUnblockRequestsByUser(req.user._id);
  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: requests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((request) => serializeRequest(request, userLookup)),
  });
};

export const decideRequest = async (req, res) => {
  const unblockRequest = await findUnblockRequestById(req.params.id);

  if (!unblockRequest) {
    throw new AppError('Request not found', 404);
  }

  if (req.user.role !== ROLES.ADMIN && unblockRequest.ownerId !== req.user._id) {
    throw new AppError('You can only manage requests sent to your stadium account', 403);
  }

  const { status, decisionNote = '' } = req.body || {};

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be either approved or rejected', 400);
  }

  const updatedRequest = await updateUnblockRequest(unblockRequest._id, {
    status,
    decisionNote: decisionNote.trim(),
  });

  if (status === 'approved') {
    await updateBlock(unblockRequest.blockId, {
      status: 'lifted',
      liftReason: decisionNote.trim() || "So'rov qabul qilindi",
    });
  }

  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  await notifyUser({
    userId: unblockRequest.blockedUserId,
    type: status === 'approved' ? 'unblocked-user' : 'unblock-request',
    title: status === 'approved' ? 'Blok bekor qilindi' : "So'rov rad etildi",
    content:
      status === 'approved'
        ? 'Stadion egasi sizga yana bron qilishga ruxsat berdi.'
        : "Stadion egasi uzr so'rovingizni hozircha rad etdi.",
    link: status === 'approved' ? '/dashboard' : '/requests',
    metadata: {
      requestId: unblockRequest._id,
      blockId: unblockRequest.blockId,
    },
  });

  res.json({
    success: true,
    data: serializeRequest(updatedRequest, userLookup),
  });
};

export const getCurrentUserActiveBlocks = async (req, res) => {
  const blocks = await listBlocksByUser(req.user._id);
  const users = await listUsers();
  const userLookup = buildUserLookup(users);

  res.json({
    success: true,
    data: blocks
      .filter((block) => block.status === 'active')
      .map((block) => serializeBlock(block, userLookup)),
  });
};
