// 侧边栏组件
const Sidebar = {
  init() {
    // 侧边栏已通过RoomList管理
    // 这里主要处理用户信息显示
  },

  // 设置用户信息
  setUserInfo(user) {
    dom.setText('#userNickname', user.nickname);
    dom.setText('#userAvatar', user.avatarEmoji);
  },

  // 更新在线成员
  updateOnlineMembers(members) {
    const container = $('#onlineMembers');
    dom.empty(container);

    if (members.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无在线成员</div>';
      return;
    }

    members.forEach(member => {
      const memberEl = dom.create('div', 'member-item');
      memberEl.innerHTML = `
        <div class="member-avatar">${member.avatarEmoji || '👤'}</div>
        <div class="member-info">
          <div class="member-name">${dom.escapeHtml(member.nickname)}</div>
          <div class="member-status">
            <span class="status-dot"></span>
            <span>在线</span>
          </div>
        </div>
      `;

      // 点击发起私聊
      memberEl.onclick = () => {
        if (member.id !== socketService.getCurrentUser().userId) {
          socketService.startPrivateChat(member.id);
        }
      };

      container.appendChild(memberEl);
    });

    // 更新在线人数
    dom.setText('#onlineCount', members.length);
  }
};
