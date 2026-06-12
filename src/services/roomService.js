const Room = require('../models/Room');
const User = require('../models/User');
const redisService = require('./redis');

const roomService = {
  // 获取所有活跃房间及其信息
  async getAllRoomsWithInfo(userId = null) {
    const rooms = Room.getAllActive();

    // 添加在线人数和未读数信息
    const roomsWithInfo = await Promise.all(rooms.map(async room => {
      const onlineCount = await this.getRoomOnlineCount(room.id);
      const unreadCount = userId ? Room.getUnreadCount(room.id, userId) : 0;

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        type: room.type,
        iconEmoji: room.icon_emoji,
        onlineCount,
        unreadCount
      };
    }));

    return roomsWithInfo;
  },

  // 用户加入房间
  async joinRoom(userId, roomId) {
    const room = Room.findById(roomId);
    if (!room) {
      throw new Error('房间不存在');
    }

    // 检查房间人数限制
    const memberCount = Room.getMembers(roomId).length;
    if (memberCount >= room.max_members) {
      throw new Error('房间已满');
    }

    // 添加到数据库
    Room.addMember(roomId, userId);

    // 更新用户当前房间
    User.updateCurrentRoom(userId, roomId);

    // 更新Redis在线用户
    await redisService.addOnlineUser(userId, roomId);

    return room;
  },

  // 用户离开房间
  async leaveRoom(userId, roomId) {
    Room.removeMember(roomId, userId);
    await redisService.removeOnlineUser(userId, roomId);
  },

  // 获取房间成员
  getRoomMembers(roomId) {
    return Room.getMembers(roomId);
  },

  // 获取房间在线成员数
  async getRoomOnlineCount(roomId) {
    const onlineUserIds = await redisService.getRoomOnlineUsers(roomId);
    return onlineUserIds.length;
  },

  // 获取房间在线成员详细信息
  async getRoomOnlineMembers(roomId) {
    const onlineUserIds = await redisService.getRoomOnlineUsers(roomId);
    const members = [];

    for (const userId of onlineUserIds) {
      const user = User.findById(userId);
      if (user && user.is_online) {
        members.push({
          id: user.id,
          nickname: user.nickname,
          avatarEmoji: user.avatar_emoji
        });
      }
    }

    return members;
  },

  // 创建新房间
  async createRoom(name, description, type = 'public', iconEmoji = '💬', createdBy = null) {
    const roomId = Room.create(name, description, type, iconEmoji, createdBy);
    return Room.findById(roomId);
  },

  // 获取用户加入的房间列表
  getUserRooms(userId) {
    return Room.getUserRooms(userId);
  },

  // 更新用户最后阅读位置
  updateLastRead(roomId, userId, messageId) {
    Room.updateLastRead(roomId, userId, messageId);
  },

  // 获取未读消息数
  getUnreadCount(roomId, userId) {
    return Room.getUnreadCount(roomId, userId);
  }
};

module.exports = roomService;
