const messageService = require('../../services/messageService');
const userService = require('../../services/userService');

function setupPrivateMessageHandlers(socket, io) {
  // 发起私聊
  socket.on('private:start', async ({ targetUserId }) => {
    try {
      const userId = socket.data.userId;

      // 获取目标用户信息
      const targetUser = userService.getUserById(targetUserId);

      if (!targetUser) {
        throw new Error('用户不存在');
      }

      // 获取私聊历史
      const messages = await messageService.getPrivateHistory(userId, targetUserId);

      // 生成会话ID
      const conversationId = [userId, targetUserId].sort((a, b) => a - b).join('_');

      // 发送会话信息
      socket.emit('private:conversation', {
        conversationId,
        targetUser: {
          id: targetUser.id,
          nickname: targetUser.nickname,
          avatarEmoji: targetUser.avatar_emoji,
          isOnline: targetUser.is_online === 1
        },
        messages: messageService.formatMessages(messages)
      });

    } catch (error) {
      console.error('Start private chat error:', error);
      socket.emit('system:error', {
        code: 'PRIVATE_START_ERROR',
        message: error.message || '发起私聊失败'
      });
    }
  });

  // 发送私聊消息
  socket.on('private:send', async ({ targetUserId, content }) => {
    try {
      const userId = socket.data.userId;

      // 发送私聊消息
      const message = await messageService.sendPrivateMessage(userId, targetUserId, content);

      // 格式化消息
      const formattedMessage = messageService.formatMessage(message);

      // 发送给自己（确认）
      socket.emit('private:message', formattedMessage);

      // 查找目标用户的socket并发送
      const targetUser = userService.getUserById(targetUserId);
      if (targetUser && targetUser.is_online) {
        // 通过socket_id找到目标socket
        const sockets = await io.fetchSockets();
        const targetSocket = sockets.find(s => s.id === targetUser.socket_id);

        if (targetSocket) {
          targetSocket.emit('private:message', formattedMessage);

          // 发送新私聊通知
          targetSocket.emit('private:newMessage', {
            senderId: userId,
            senderNickname: socket.data.nickname,
            preview: content.substring(0, 50)
          });
        }
      }

    } catch (error) {
      console.error('Send private message error:', error);
      socket.emit('system:error', {
        code: 'PRIVATE_SEND_ERROR',
        message: error.message || '发送私聊失败'
      });
    }
  });

  // 获取私聊列表
  socket.on('private:getList', async () => {
    try {
      const userId = socket.data.userId;

      // 这里可以从数据库查询私聊会话列表
      // 目前简化实现，返回空列表
      socket.emit('private:list', []);

    } catch (error) {
      console.error('Get private list error:', error);
      socket.emit('system:error', {
        code: 'PRIVATE_LIST_ERROR',
        message: '获取私聊列表失败'
      });
    }
  });
}

module.exports = setupPrivateMessageHandlers;
