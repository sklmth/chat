// 房间列表组件
const RoomList = {
  container: null,
  rooms: [],
  currentRoomId: null,

  init() {
    this.container = $('#roomList');
  },

  // 设置房间列表
  setRooms(rooms) {
    this.rooms = rooms;
    this.render();
  },

  // 渲染房间列表
  render() {
    dom.empty(this.container);

    this.rooms.forEach(room => {
      const roomEl = this.createRoomElement(room);
      this.container.appendChild(roomEl);
    });
  },

  // 创建房间元素
  createRoomElement(room) {
    const div = dom.create('div', 'room-item');
    if (room.id === this.currentRoomId) {
      div.classList.add('active');
    }

    div.innerHTML = `
      <div class="room-icon">${room.iconEmoji || '💬'}</div>
      <div class="room-details">
        <div class="room-header">
          <div class="room-name">${dom.escapeHtml(room.name)}</div>
        </div>
        <div class="room-meta">
          <div class="room-online">
            <span class="online-dot"></span>
            <span>${room.onlineCount || 0}人在线</span>
          </div>
          ${room.unreadCount > 0 ? `<span class="unread-badge">${room.unreadCount}</span>` : ''}
        </div>
      </div>
    `;

    div.onclick = () => this.selectRoom(room.id);

    return div;
  },

  // 选择房间
  selectRoom(roomId) {
    if (this.currentRoomId === roomId) return;

    this.currentRoomId = roomId;
    this.render();

    // 通知Socket切换房间
    socketService.joinRoom(roomId);

    // 更新当前房间信息
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      dom.setText('#currentRoomName', room.name);
      dom.setText('#currentRoomIcon', room.iconEmoji || '💬');
      dom.setText('#roomDescription', room.description || '');
    }
  },

  // 更新房间在线人数
  updateOnlineCount(roomId, count) {
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.onlineCount = count;
      this.render();
    }

    // 更新总在线人数
    const totalOnline = this.rooms.reduce((sum, r) => sum + (r.onlineCount || 0), 0);
    dom.setText('#totalOnline', `${totalOnline}人在线`);
  },

  // 更新未读数
  updateUnreadCount(roomId, count) {
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.unreadCount = count;
      this.render();
    }
  },

  // 获取当前房间
  getCurrentRoom() {
    return this.rooms.find(r => r.id === this.currentRoomId);
  }
};
