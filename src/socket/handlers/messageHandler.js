const messageService = require('../../services/messageService');
const redisService = require('../../services/redis');

function setupMessageHandlers(socket, io, getCurrentRoomId) {
  // 发送文本消息
  socket.on('message:send', async ({ roomId, content, replyToId }) => {
    try {
      const userId = socket.data.userId;

      // 发送消息
      const message = await messageService.sendRoomMessage(userId, roomId, content, replyToId);

      // 格式化消息
      const formattedMessage = messageService.formatMessage(message);

      // 广播给房间所有人
      io.to(`room:${roomId}`).emit('message:new', formattedMessage);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('system:error', {
        code: 'SEND_MESSAGE_ERROR',
        message: error.message || '发送消息失败'
      });
    }
  });

  // 发送媒体消息（文件已上传）
  socket.on('message:media', async ({ roomId, messageType, fileUrl, fileName, fileSize, fileMime, thumbnailUrl, duration }) => {
    try {
      const userId = socket.data.userId;

      // 创建媒体消息
      const message = await messageService.sendMediaMessage(
        userId,
        roomId,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        fileMime,
        thumbnailUrl,
        duration
      );

      // 格式化消息
      const formattedMessage = messageService.formatMessage(message);

      // 广播给房间所有人
      io.to(`room:${roomId}`).emit('message:new', formattedMessage);

    } catch (error) {
      console.error('Send media message error:', error);
      socket.emit('system:error', {
        code: 'SEND_MEDIA_ERROR',
        message: error.message || '发送媒体消息失败'
      });
    }
  });

  // 正在输入
  socket.on('message:typing', async ({ roomId }) => {
    try {
      const userId = socket.data.userId;
      const nickname = socket.data.nickname;

      // 设置Redis正在输入状态
      await redisService.setTyping(roomId, userId);

      // 通知房间其他人
      socket.to(`room:${roomId}`).emit('message:typing', {
        userId,
        nickname
      });

    } catch (error) {
      console.error('Typing indicator error:', error);
    }
  });

  // 删除消息
  socket.on('message:delete', async ({ messageId }) => {
    try {
      const userId = socket.data.userId;

      // 获取消息
      const message = messageService.getMessageById(messageId);

      if (!message) {
        throw new Error('消息不存在');
      }

      // 检查权限（只能删除自己的消息）
      if (message.sender_id !== userId) {
        throw new Error('无权删除此消息');
      }

      // 标记为已删除
      messageService.deleteMessage(messageId);

      // 通知房间所有人
      const roomId = getCurrentRoomId();
      io.to(`room:${roomId}`).emit('message:deleted', {
        messageId
      });

    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('system:error', {
        code: 'DELETE_MESSAGE_ERROR',
        message: error.message || '删除消息失败'
      });
    }
  });
}

module.exports = setupMessageHandlers;
