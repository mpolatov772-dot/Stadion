import { randomUUID } from 'crypto';

import { getCollection, insertOne, updateOne } from './baseModel.js';

const collectionName = 'messages';

export const listMessages = async () => getCollection(collectionName);

export const listMessagesByConversation = async (conversationId) => {
  const messages = await getCollection(collectionName);
  return messages.filter((message) => message.conversationId === conversationId);
};

export const listMessagesByUser = async (userId) => {
  const messages = await getCollection(collectionName);
  return messages.filter((message) => message.senderId === userId || message.recipientId === userId);
};

export const createMessage = async (message) =>
  insertOne(collectionName, {
    _id: message._id || randomUUID(),
    createdAt: message.createdAt || new Date().toISOString(),
    updatedAt: message.updatedAt || new Date().toISOString(),
    ...message,
  });

export const updateMessage = async (id, changes) =>
  updateOne(collectionName, id, (current) => ({
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }));
