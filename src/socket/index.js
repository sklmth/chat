const { handleConnection, handleDisconnect } = require('./handlers/connectionHandler');
const setupRoomHandlers = require('./handlers/roomHandler');
const setupMessageHandlers = require('./handlers/messageHandler');
const setupPrivateMessageHandlers = require('./handlers/privateMessageHandler');

function initializeSocket(io) {
  io.on('connection', async (socket) => {
    let currentRoomId = null;

    try {
      // 处理连接
      const { user, currentRoomId: roomId } = await handleConnection(socket, io);
      currentRoomId = roomId;

      // 设置房间事件处理器
      const { getCurrentRoomId } = setupRoomHandlers(socket, io, currentRoomId);

      // 设置消息事件处理器
      setupMessageHandlers(socket, io, getCurrentRoomId);

      // 设置私聊事件处理器
      setupPrivateMessageHandlers(socket, io);

      // 处理断开连接
      socket.on('disconnect', async () => {
        await handleDisconnect(socket, io, getCurrentRoomId());
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
      socket.emit('system:error', {
        code: 'INIT_ERROR',
        message: '初始化失败，请刷新重试'
      });
    }
  });

  console.log('Socket.IO initialized');
}

module.exports = initializeSocket;
