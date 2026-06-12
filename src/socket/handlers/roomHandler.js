const roomService = require('../../services/roomService');
const messageService = require('../../services/messageService');

function setupRoomHandlers(socket, io, currentRoomId) {
  // 加入房间
  socket.on('room:join', async (roomId) => {
    try {
      const userId = socket.data.userId;
      const nickname = socket.data.nickname;

      // 离开当前房间
      if (currentRoomId) {
        socket.leave(`room:${currentRoomId}`);
        await roomService.leaveRoom(userId, currentRoomId);

        // 通知旧房间用户离开
        socket.to(`room:${currentRoomId}`).emit('user:left', {
          userId,
          nickname
        });

        // 更新旧房间在线人数
        const oldOnlineCount = await roomService.getRoomOnlineCount(currentRoomId);
        io.to(`room:${currentRoomId}`).emit('room:onlineCount', {
          roomId: currentRoomId,
          count: oldOnlineCount
        });
      }

      // 加入新房间
      await roomService.joinRoom(userId, roomId);
      socket.join(`room:${roomId}`);
      currentRoomId = roomId;

      // 加载新房间历史消息
      const history = await messageService.getRoomHistory(roomId);

      // 获取在线成员
      const onlineUsers = await roomService.getRoomOnlineMembers(roomId);

      // 发送房间历史消息
      socket.emit('room:history', {
        roomId,
        messages: messageService.formatMessages(history),
        hasMore: history.length >= 50
      });

      // 发送在线用户列表
      socket.emit('room:onlineUsers', {
        roomId,
        users: onlineUsers
      });

      // 通知新房间有人加入
      socket.to(`room:${roomId}`).emit('user:joined', {
        userId,
        nickname,
        avatarEmoji: socket.data.avatarEmoji
      });

      // 广播系统消息
      io.to(`room:${roomId}`).emit('system:notification', {
        type: 'info',
        message: `${nickname} 加入了房间`
      });

      // 更新新房间在线人数
      const newOnlineCount = await roomService.getRoomOnlineCount(roomId);
      io.to(`room:${roomId}`).emit('room:onlineCount', {
        roomId,
        count: newOnlineCount
      });

    } catch (error) {
      console.error('Room join error:', error);
      socket.emit('system:error', {
        code: 'ROOM_JOIN_ERROR',
        message: error.message || '加入房间失败'
      });
    }
  });

  // 加载更多历史消息
  socket.on('room:loadMore', async ({ roomId, beforeMessageId }) => {
    try {
      const messages = await messageService.loadMoreMessages(roomId, beforeMessageId, 50);

      socket.emit('room:moreMessages', {
        roomId,
        messages: messageService.formatMessages(messages),
        hasMore: messages.length >= 50
      });

    } catch (error) {
      console.error('Load more messages error:', error);
      socket.emit('system:error', {
        code: 'LOAD_MORE_ERROR',
        message: '加载历史消息失败'
      });
    }
  });

  return { getCurrentRoomId: () => currentRoomId };
}

module.exports = setupRoomHandlers;
