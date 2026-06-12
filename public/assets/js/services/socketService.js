// Socket.IO 服务封装
const socketService = {
  socket: null,
  currentUser: null,
  currentRoom: null,
  listeners: {},

  // 初始化连接
  init() {
    const sessionToken = localStorage.getItem('sessionToken');

    this.socket = io({
      auth: { sessionToken }
    });

    this.setupListeners();
    return this.socket;
  },

  // 设置基础监听器
  setupListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  },

  // 注册事件监听
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
      this.socket.on(event, (...args) => {
        this.listeners[event].forEach(cb => cb(...args));
      });
    }
    this.listeners[event].push(callback);
  },

  // 移除事件监听
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },

  // 发送事件
  emit(event, data) {
    this.socket.emit(event, data);
  },

  // 加入房间
  joinRoom(roomId) {
    this.emit('room:join', roomId);
    this.currentRoom = roomId;
  },

  // 发送消息
  sendMessage(content, roomId) {
    this.emit('message:send', {
      roomId: roomId || this.currentRoom,
      content
    });
  },

  // 发送媒体消息
  sendMediaMessage(data) {
    this.emit('message:media', {
      roomId: data.roomId || this.currentRoom,
      messageType: data.type,
      fileUrl: data.url,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileMime: data.mimeType,
      thumbnailUrl: data.thumbnail,
      duration: data.duration
    });
  },

  // 发送正在输入
  sendTyping(roomId) {
    this.emit('message:typing', {
      roomId: roomId || this.currentRoom
    });
  },

  // 发起私聊
  startPrivateChat(targetUserId) {
    this.emit('private:start', { targetUserId });
  },

  // 发送私聊消息
  sendPrivateMessage(targetUserId, content) {
    this.emit('private:send', { targetUserId, content });
  },

  // 加载更多历史消息
  loadMoreMessages(roomId, beforeMessageId) {
    this.emit('room:loadMore', { roomId, beforeMessageId });
  },

  // 设置当前用户信息
  setCurrentUser(user) {
    this.currentUser = user;
    if (user.sessionToken) {
      localStorage.setItem('sessionToken', user.sessionToken);
    }
  },

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  },

  // 获取当前房间
  getCurrentRoom() {
    return this.currentRoom;
  }
};
