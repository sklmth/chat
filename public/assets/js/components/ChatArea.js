// 聊天区域组件
const ChatArea = {
  init() {
    this.setupInfoPanel();
    this.setupScrollToBottom();
  },

  // 设置信息面板
  setupInfoPanel() {
    const toggleBtn = $('#toggleInfoPanel');
    const infoPanel = $('#infoPanel');

    toggleBtn.onclick = () => {
      infoPanel.classList.toggle('hidden');
    };
  },

  // 设置滚到底部按钮
  setupScrollToBottom() {
    const container = $('#messagesContainer');
    const scrollBtn = $('#scrollToBottom');

    container.onscroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

      if (isAtBottom) {
        dom.hide(scrollBtn);
      } else {
        dom.show(scrollBtn);
      }
    };

    scrollBtn.onclick = () => {
      MessageList.scrollToBottom();
    };
  },

  // 显示正在输入
  showTyping(nickname) {
    const indicator = $('#typingIndicator');
    const text = indicator.querySelector('.typing-text');
    text.textContent = `${nickname} 正在输入`;
    dom.show(indicator);

    // 3秒后自动隐藏
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      dom.hide(indicator);
    }, 3000);
  },

  // 隐藏正在输入
  hideTyping() {
    dom.hide('#typingIndicator');
  },

  // 更新房间状态
  updateRoomStatus(text) {
    dom.setText('#roomStatus', text);
  }
};
