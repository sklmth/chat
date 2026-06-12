const User = require('../models/User');
const { generateNickname, generateAvatarEmoji, generateSessionToken } = require('../utils/nicknameGenerator');
const redisService = require('./redis');

const userService = {
  // 创建新用户
  async createUser(socketId) {
    const nickname = generateNickname();
    const avatarEmoji = generateAvatarEmoji();
    const sessionToken = generateSessionToken();

    const userId = User.create(socketId, nickname, avatarEmoji, sessionToken);

    // 缓存用户会话
    await redisService.setUserSession(userId, {
      id: userId.toString(),
      nickname,
      avatarEmoji,
      sessionToken
    });

    return {
      id: userId,
      nickname,
      avatarEmoji,
      sessionToken
    };
  },

  // 用户重连（通过session token恢复身份）
  async reconnectUser(sessionToken, newSocketId) {
    const user = User.findBySessionToken(sessionToken);
    if (user) {
      User.updateSocketId(user.id, newSocketId);
      User.updateOnlineStatus(user.id, true);

      // 更新缓存
      await redisService.setUserSession(user.id, {
        id: user.id.toString(),
        nickname: user.nickname,
        avatarEmoji: user.avatar_emoji,
        sessionToken: user.session_token
      });

      return user;
    }
    return null;
  },

  // 用户断开连接
  async disconnectUser(socketId, currentRoomId) {
    const user = User.findBySocketId(socketId);
    if (user) {
      User.updateOnlineStatus(user.id, false);
      await redisService.removeOnlineUser(user.id, currentRoomId);

      // 不删除用户记录，保留用于会话恢复
      // 可选：定期清理长时间离线的用户
    }
    return user;
  },

  // 获取用户信息
  getUserById(userId) {
    return User.findById(userId);
  },

  // 获取在线用户列表
  getOnlineUsers() {
    return User.getOnlineUsers();
  },

  // 获取房间内在线用户
  getOnlineUsersInRoom(roomId) {
    return User.getOnlineUsersInRoom(roomId);
  },

  // 更改昵称（可选功能）
  async changeNickname(userId, newNickname) {
    // 这里可以添加昵称验证和更新逻辑
    // 暂时不实现，保持随机昵称的简单性
    return { success: false, message: '暂不支持更改昵称' };
  },

  // 清理不活跃用户
  async cleanupInactiveUsers(hoursAgo = 24) {
    const deleted = User.cleanupInactiveUsers(hoursAgo);
    console.log(`Cleaned up ${deleted} inactive users`);
    return deleted;
  }
};

module.exports = userService;
