const Message = require('../models/Message');
const User = require('../models/User');
const redisService = require('./redis');
const { validateTextMessage } = require('../utils/validator');

const messageService = {
  // 发送房间消息
  async sendRoomMessage(userId, roomId, content, replyToId = null) {
    // 验证消息内容
    const validation = validateTextMessage(content);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 保存到数据库
    const messageId = Message.createText(userId, roomId, validation.content, replyToId);

    // 获取完整消息信息
    const message = Message.findById(messageId);

    // 缓存到Redis
    await redisService.cacheRoomMessage(roomId, message);

    return message;
  },

  // 发送媒体消息
  async sendMediaMessage(userId, roomId, type, fileUrl, fileName, fileSize, fileMime, thumbnailUrl = null, duration = null) {
    // 保存到数据库
    const messageId = Message.createMedia(userId, roomId, type, fileUrl, fileName, fileSize, fileMime, thumbnailUrl, duration);

    // 获取完整消息信息
    const message = Message.findById(messageId);

    // 缓存到Redis
    await redisService.cacheRoomMessage(roomId, message);

    return message;
  },

  // 获取房间历史消息
  async getRoomHistory(roomId, limit = 50) {
    // 先尝试从Redis获取
    let messages = await redisService.getRoomMessages(roomId);

    if (messages.length === 0) {
      // Redis中没有，从数据库加载
      messages = Message.getRecentByRoom(roomId, limit);

      // 回填到Redis
      if (messages.length > 0) {
        await redisService.setRoomMessages(roomId, messages);
      }
    }

    return messages;
  },

  // 加载更多历史消息
  async loadMoreMessages(roomId, beforeMessageId, limit = 50) {
    return Message.getBeforeMessage(roomId, beforeMessageId, limit);
  },

  // 发送私聊消息
  async sendPrivateMessage(senderId, receiverId, content) {
    // 验证消息内容
    const validation = validateTextMessage(content);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 保存到数据库
    const messageId = Message.createPrivate(senderId, receiverId, validation.content);

    // 获取完整消息信息
    const message = Message.findById(messageId);

    // 缓存到Redis
    await redisService.cachePrivateMessage(senderId, receiverId, message);

    return message;
  },

  // 获取私聊历史消息
  async getPrivateHistory(userId1, userId2, limit = 50) {
    // 先尝试从Redis获取
    let messages = await redisService.getPrivateMessages(userId1, userId2);

    if (messages.length === 0) {
      // Redis中没有，从数据库加载
      messages = Message.getPrivateMessages(userId1, userId2, limit);

      // 回填到Redis
      if (messages.length > 0) {
        for (const msg of messages) {
          await redisService.cachePrivateMessage(userId1, userId2, msg);
        }
      }
    }

    return messages;
  },

  // 删除消息
  deleteMessage(messageId) {
    Message.markDeleted(messageId);
  },

  // 获取消息详情
  getMessageById(messageId) {
    return Message.findById(messageId);
  },

  // 格式化消息供客户端使用
  formatMessage(message) {
    if (!message) return null;

    return {
      id: message.id,
      roomId: message.room_id,
      sender: {
        id: message.sender_id,
        nickname: message.nickname,
        avatarEmoji: message.avatar_emoji
      },
      messageType: message.message_type,
      content: message.content,
      fileUrl: message.file_url,
      fileName: message.file_name,
      fileSize: message.file_size,
      fileMime: message.file_mime,
      thumbnailUrl: message.thumbnail_url,
      duration: message.duration,
      replyToId: message.reply_to_id,
      createdAt: message.created_at
    };
  },

  // 批量格式化消息
  formatMessages(messages) {
    return messages.map(msg => this.formatMessage(msg));
  }
};

module.exports = messageService;
