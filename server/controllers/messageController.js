import {
  createMessage,
  listMessagesByConversation,
  listMessagesByUser,
  updateMessage,
} from '../models/Message.js';
import { findStadiumById } from '../models/Stadium.js';
import { findUserById, listUsers } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { notifyUser } from '../utils/notifications.js';

const buildConversationId = (userIdA, userIdB, stadiumId = 'general') =>
  [userIdA, userIdB].sort().join(':') + `:${stadiumId || 'general'}`;

const serializeParticipant = (user) =>
  user
    ? {
        _id: user._id,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      }
    : null;

export const getConversations = async (req, res) => {
  const [messages, users] = await Promise.all([listMessagesByUser(req.user._id), listUsers()]);
  const userLookup = new Map(users.map((user) => [user._id, user]));

  const conversations = [...messages]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .reduce((accumulator, message) => {
      if (accumulator.has(message.conversationId)) {
        return accumulator;
      }

      const participantId = message.senderId === req.user._id ? message.recipientId : message.senderId;
      const unreadCount = messages.filter(
        (entry) =>
          entry.conversationId === message.conversationId &&
          entry.recipientId === req.user._id &&
          !entry.readAt,
      ).length;

      accumulator.set(message.conversationId, {
        conversationId: message.conversationId,
        participant: serializeParticipant(userLookup.get(participantId)),
        stadiumId: message.stadiumId || null,
        bookingId: message.bookingId || null,
        lastMessage: message,
        unreadCount,
      });

      return accumulator;
    }, new Map());

  res.json({
    success: true,
    data: [...conversations.values()],
  });
};

export const getThread = async (req, res) => {
  const { participantId, stadiumId = 'general' } = req.query;

  if (!participantId) {
    throw new AppError('participantId is required', 400);
  }

  const participant = await findUserById(participantId);

  if (!participant) {
    throw new AppError('Resource not found', 404);
  }

  const conversationId = buildConversationId(req.user._id, participantId, stadiumId);
  const [messages, stadium] = await Promise.all([
    listMessagesByConversation(conversationId),
    stadiumId && stadiumId !== 'general' ? findStadiumById(stadiumId) : Promise.resolve(null),
  ]);
  const unreadMessages = messages.filter(
    (message) => message.recipientId === req.user._id && !message.readAt,
  );

  await Promise.all(
    unreadMessages.map((message) =>
      updateMessage(message._id, {
        readAt: new Date().toISOString(),
      }),
    ),
  );

  res.json({
    success: true,
    data: {
      conversationId,
      participant: serializeParticipant(participant),
      stadium,
      messages: messages
        .map((message) =>
          unreadMessages.find((entry) => entry._id === message._id)
            ? {
                ...message,
                readAt: new Date().toISOString(),
              }
            : message,
        )
        .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt)),
    },
  });
};

export const sendMessage = async (req, res) => {
  const { recipientId, text, stadiumId = null, bookingId = null } = req.body || {};

  if (!recipientId || !text?.trim()) {
    throw new AppError('recipientId and message are required', 400);
  }

  const recipient = await findUserById(recipientId);

  if (!recipient) {
    throw new AppError('Resource not found', 404);
  }

  const conversationId = buildConversationId(req.user._id, recipientId, stadiumId || 'general');
  const message = await createMessage({
    conversationId,
    senderId: req.user._id,
    recipientId,
    stadiumId,
    bookingId,
    text: text.trim(),
  });

  await notifyUser({
    userId: recipientId,
    type: 'direct-message',
    title: 'Yangi shaxsiy xabar',
    content: `${req.user.fullName} sizga yangi xabar yubordi.`,
    link: '/notifications',
    metadata: {
      conversationId,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      ...message,
      sender: serializeParticipant(req.user),
      recipient: serializeParticipant(recipient),
    },
  });
};
