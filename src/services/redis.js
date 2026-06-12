const { createClient } = require('redis');
const { CACHE_CONFIG } = require('../config/constants');

const redis = createClient({ url: process.env.REDIS_URL });

redis.on('error', err => console.error('Redis error:', err));
redis.on('connect', () => console.log('Redis connected'));

// 连接Redis
redis.connect().catch(err => {
  console.error('Failed to connect to Redis:', err);
});

// Redis键生成器
const keys = {
  roomMessages: (roomId) => `room:${roomId}:messages`,
  roomOnline: (roomId) => `room:${roomId}:online`,
  roomTyping: (roomId) => `room:${roomId}:typing`,
  privateMessages: (userId1, userId2) => {
    const sorted = [userId1, userId2].sort((a, b) => a - b);
    return `private:${sorted[0]}_${sorted[1]}:messages`;
  },
  userSession: (userId) => `user:${userId}:session`,
  userRooms: (userId) => `user:${userId}:rooms`,
  onlineUsers: () => 'online:users',
  onlineCount: () => 'online:count',
  unreadRoom: (userId, roomId) => `unread:${userId}:room:${roomId}`,
  unreadPrivate: (userId, targetId) => `unread:${userId}:private:${targetId}`
};

// 房间消息缓存
async function cacheRoomMessage(roomId, message) {
  const key = keys.roomMessages(roomId);
  await redis.rPush(key, JSON.stringify(message));
  await redis.lTrim(key, -CACHE_CONFIG.MESSAGE_CACHE_LIMIT, -1);
}

async function getRoomMessages(roomId) {
  const key = keys.roomMessages(roomId);
  const messages = await redis.lRange(key, 0, -1);
  return messages.map(m => JSON.parse(m));
}

async function setRoomMessages(roomId, messages) {
  const key = keys.roomMessages(roomId);
  const pipeline = redis.multi();
  pipeline.del(key);
  messages.forEach(m => pipeline.rPush(key, JSON.stringify(m)));
  pipeline.lTrim(key, -CACHE_CONFIG.MESSAGE_CACHE_LIMIT, -1);
  await pipeline.exec();
}

// 在线用户管理
async function addOnlineUser(userId, roomId) {
  await redis.sAdd(keys.onlineUsers(), userId.toString());
  await redis.sAdd(keys.roomOnline(roomId), userId.toString());
  await redis.incr(keys.onlineCount());
}

async function removeOnlineUser(userId, roomId) {
  await redis.sRem(keys.onlineUsers(), userId.toString());
  if (roomId) {
    await redis.sRem(keys.roomOnline(roomId), userId.toString());
  }
  await redis.decr(keys.onlineCount());
}

async function getRoomOnlineUsers(roomId) {
  const userIds = await redis.sMembers(keys.roomOnline(roomId));
  return userIds.map(id => parseInt(id));
}

async function getOnlineCount() {
  const count = await redis.get(keys.onlineCount());
  return parseInt(count) || 0;
}

// 正在输入指示器
async function setTyping(roomId, userId) {
  const key = keys.roomTyping(roomId);
  await redis.sAdd(key, userId.toString());
  await redis.expire(key, CACHE_CONFIG.TYPING_INDICATOR_TTL);
}

async function getTypingUsers(roomId) {
  const userIds = await redis.sMembers(keys.roomTyping(roomId));
  return userIds.map(id => parseInt(id));
}

// 私聊消息缓存
async function cachePrivateMessage(userId1, userId2, message) {
  const key = keys.privateMessages(userId1, userId2);
  await redis.rPush(key, JSON.stringify(message));
  await redis.lTrim(key, -CACHE_CONFIG.PRIVATE_CACHE_LIMIT, -1);
}

async function getPrivateMessages(userId1, userId2) {
  const key = keys.privateMessages(userId1, userId2);
  const messages = await redis.lRange(key, 0, -1);
  return messages.map(m => JSON.parse(m));
}

// 用户会话缓存
async function setUserSession(userId, data) {
  const key = keys.userSession(userId);
  await redis.hSet(key, data);
  await redis.expire(key, CACHE_CONFIG.USER_SESSION_TTL);
}

async function getUserSession(userId) {
  const key = keys.userSession(userId);
  return await redis.hGetAll(key);
}

// 清理用户相关缓存
async function clearUserCache(userId) {
  const sessionKey = keys.userSession(userId);
  const roomsKey = keys.userRooms(userId);
  await redis.del(sessionKey);
  await redis.del(roomsKey);
}

module.exports = {
  redis,
  keys,
  cacheRoomMessage,
  getRoomMessages,
  setRoomMessages,
  addOnlineUser,
  removeOnlineUser,
  getRoomOnlineUsers,
  getOnlineCount,
  setTyping,
  getTypingUsers,
  cachePrivateMessage,
  getPrivateMessages,
  setUserSession,
  getUserSession,
  clearUserCache
};
