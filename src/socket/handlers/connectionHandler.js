const userService = require('../../services/userService');
const roomService = require('../../services/roomService');
const messageService = require('../../services/messageService');
const { ROOM_CONFIG } = require('../../config/constants');

async function handleConnection(socket, io) {
  console.log('New connection:', socket.id);

  let user = null;
  let currentRoomId = ROOM_CONFIG.DEFAULT_ROOM_ID;

  try {
    // 检查是否有session token（用户重连）
    const sessionToken = socket.handshake.auth.sessionToken;

    if (sessionToken) {
      user = await userService.reconnectUser(sessionToken, socket.id);
      console.log('User reconnected:', user.nickname);
    }

    // 如果没有找到用户或是新连接，创建新用户
    if (!user) {
      user = await userService.createUser(socket.id);
      console.log('New user created:', user.nickname);
    }

    // 保存用户信息到socket
    socket.data.userId = user.id;
    socket.data.nickname = user.nickname;

    // 加入默认房间
    await roomService.joinRoom(user.id, currentRoomId);
    socket.join(`room:${currentRoomId}`);

    // 获取房间列表
    const rooms = await roomService.getAllRoomsWithInfo(user.id);

    // 获取房间历史消息
    const history = await messageService.getRoomHistory(currentRoomId);

    // 获取在线用户
    const onlineUsers = await roomService.getRoomOnlineMembers(currentRoomId);

    // 发送初始化数据给客户端
    socket.emit('init', {
      userId: user.id,
      nickname: user.nickname,
      avatarEmoji: user.avatar_emoji || user.avatarEmoji,
      sessionToken: user.session_token || user.sessionToken,
      rooms,
      currentRoom: {
        id: currentRoomId,
        name: '大厅',
        onlineUsers
      },
      history: messageService.formatMessages(history)
    });

    // 通知房间其他用户有人加入
    socket.to(`room:${currentRoomId}`).emit('user:joined', {
      userId: user.id,
      nickname: user.nickname,
      avatarEmoji: user.avatar_emoji || user.avatarEmoji
    });

    // 广播系统消息
    io.to(`room:${currentRoomId}`).emit('system:notification', {
      type: 'info',
      message: `${user.nickname} 加入了聊天室`
    });

    // 更新在线人数
    const onlineCount = await roomService.getRoomOnlineCount(currentRoomId);
    io.to(`room:${currentRoomId}`).emit('room:onlineCount', {
      roomId: currentRoomId,
      count: onlineCount
    });

  } catch (error) {
    console.error('Connection error:', error);
    socket.emit('system:error', {
      code: 'CONNECTION_ERROR',
      message: '连接失败，请刷新重试'
    });
  }

  return { user, currentRoomId };
}

async function handleDisconnect(socket, io, currentRoomId) {
  console.log('Client disconnected:', socket.id);

  try {
    const user = await userService.disconnectUser(socket.id, currentRoomId);

    if (user && currentRoomId) {
      // 通知房间其他用户有人离开
      socket.to(`room:${currentRoomId}`).emit('user:left', {
        userId: user.id,
        nickname: user.nickname
      });

      // 广播系统消息
      io.to(`room:${currentRoomId}`).emit('system:notification', {
        type: 'info',
        message: `${user.nickname} 离开了聊天室`
      });

      // 更新在线人数
      const onlineCount = await roomService.getRoomOnlineCount(currentRoomId);
      io.to(`room:${currentRoomId}`).emit('room:onlineCount', {
        roomId: currentRoomId,
        count: onlineCount
      });
    }
  } catch (error) {
    console.error('Disconnect error:', error);
  }
}

module.exports = {
  handleConnection,
  handleDisconnect
};
