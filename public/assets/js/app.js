// 主应用
const App = {
  async init() {
    console.log('🚀 初始化聊天应用...');

    // 初始化组件
    MessageList.init();
    RoomList.init();
    InputArea.init();
    Sidebar.init();
    ChatArea.init();

    // 初始化Socket连接
    this.initSocket();

    // 显示加载遮罩
    dom.show('#loadingOverlay');
  },

  // 初始化Socket连接
  initSocket() {
    socketService.init();

    // 监听初始化事件
    socketService.on('init', (data) => {
      console.log('✅ 初始化完成:', data);

      // 设置用户信息
      socketService.setCurrentUser(data);
      Sidebar.setUserInfo(data);

      // 设置房间列表
      RoomList.setRooms(data.rooms);
      RoomList.currentRoomId = data.currentRoom.id;

      // 显示历史消息
      MessageList.clear();
      MessageList.addMessages(data.history);

      // 更新在线成员
      if (data.currentRoom.onlineUsers) {
        Sidebar.updateOnlineMembers(data.currentRoom.onlineUsers);
      }

      // 更新房间状态
      ChatArea.updateRoomStatus(`${data.currentRoom.onlineUsers?.length || 0} 人在线`);

      // 隐藏加载遮罩
      dom.hide('#loadingOverlay');
    });

    // 监听新消息
    socketService.on('message:new', (message) => {
      console.log('📨 新消息:', message);
      MessageList.addMessage(message);
    });

    // 监听房间历史消息
    socketService.on('room:history', (data) => {
      console.log('📜 房间历史:', data);
      MessageList.clear();
      MessageList.addMessages(data.messages);
      ChatArea.updateRoomStatus('已加载历史消息');
    });

    // 监听在线用户列表
    socketService.on('room:onlineUsers', (data) => {
      console.log('👥 在线用户:', data);
      Sidebar.updateOnlineMembers(data.users);
    });

    // 监听用户加入
    socketService.on('user:joined', (data) => {
      console.log('👋 用户加入:', data);
      MessageList.addSystemMessage(`${data.nickname} 加入了聊天室`);
    });

    // 监听用户离开
    socketService.on('user:left', (data) => {
      console.log('👋 用户离开:', data);
      MessageList.addSystemMessage(`${data.nickname} 离开了聊天室`);
    });

    // 监听在线人数变化
    socketService.on('room:onlineCount', (data) => {
      console.log('📊 在线人数:', data);
      RoomList.updateOnlineCount(data.roomId, data.count);

      // 如果是当前房间，更新状态
      if (data.roomId === RoomList.currentRoomId) {
        ChatArea.updateRoomStatus(`${data.count} 人在线`);
      }
    });

    // 监听正在输入
    socketService.on('message:typing', (data) => {
      ChatArea.showTyping(data.nickname);
    });

    // 监听系统通知
    socketService.on('system:notification', (data) => {
      console.log('🔔 系统通知:', data);
      MessageList.addSystemMessage(data.message);
    });

    // 监听错误
    socketService.on('system:error', (data) => {
      console.error('❌ 错误:', data);
      alert(data.message);
    });

    // 监听私聊会话
    socketService.on('private:conversation', (data) => {
      console.log('💬 私聊会话:', data);
      // TODO: 实现私聊UI
      alert(`与 ${data.targetUser.nickname} 的私聊功能开发中...`);
    });

    // 监听私聊消息
    socketService.on('private:message', (message) => {
      console.log('💬 私聊消息:', message);
      // TODO: 显示私聊消息
    });
  },

  // 显示错误
  showError(message) {
    alert(message);
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
