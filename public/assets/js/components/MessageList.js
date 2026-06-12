// 消息列表组件
const MessageList = {
  container: null,
  messages: [],

  init() {
    this.container = $('#messagesList');
    this.setupImageViewer();
  },

  // 添加消息
  addMessage(message) {
    this.messages.push(message);
    const messageEl = this.createMessageElement(message);
    this.container.appendChild(messageEl);
    this.scrollToBottom();
  },

  // 批量添加消息
  addMessages(messages) {
    messages.forEach(msg => {
      this.messages.push(msg);
      const messageEl = this.createMessageElement(msg);
      this.container.appendChild(messageEl);
    });
    this.scrollToBottom(false);
  },

  // 创建消息元素
  createMessageElement(message) {
    const currentUser = socketService.getCurrentUser();
    const isMine = message.sender && message.sender.id === currentUser.userId;

    const div = dom.create('div', `message ${isMine ? 'mine' : 'other'}`);

    // 头像
    const avatar = dom.create('div', 'message-avatar');
    avatar.textContent = message.sender ? message.sender.avatarEmoji : '👤';

    // 消息内容容器
    const content = dom.create('div', 'message-content');

    // 消息头部（昵称和时间）
    const header = dom.create('div', 'message-header');
    const nickname = dom.create('span', 'message-nickname');
    nickname.textContent = isMine ? '你' : (message.sender?.nickname || '匿名');
    const timeEl = dom.create('span', 'message-time');
    timeEl.textContent = time.formatTime(message.createdAt);
    header.appendChild(nickname);
    header.appendChild(timeEl);

    content.appendChild(header);

    // 消息气泡
    const bubble = this.createMessageBubble(message);
    content.appendChild(bubble);

    div.appendChild(avatar);
    div.appendChild(content);

    return div;
  },

  // 创建消息气泡（根据类型）
  createMessageBubble(message) {
    const bubble = dom.create('div', 'message-bubble');

    switch (message.messageType) {
      case 'text':
        bubble.textContent = message.content;
        break;

      case 'image':
        const img = dom.create('img', 'message-image');
        img.src = message.fileUrl;
        img.alt = message.fileName;
        img.onclick = () => this.showImage(message.fileUrl);
        bubble.appendChild(img);
        break;

      case 'file':
        const fileDiv = dom.create('div', 'message-file');
        fileDiv.innerHTML = `
          <div class="file-icon">${fileService.getFileIcon(message.fileMime)}</div>
          <div class="file-info">
            <div class="file-name">${dom.escapeHtml(message.fileName)}</div>
            <div class="file-size">${fileService.formatSize(message.fileSize)}</div>
          </div>
          <a href="${message.fileUrl}" download="${message.fileName}" class="file-download">⬇</a>
        `;
        bubble.appendChild(fileDiv);
        break;

      case 'audio':
        const audio = dom.create('audio', 'message-audio');
        audio.controls = true;
        audio.src = message.fileUrl;
        bubble.appendChild(audio);
        break;

      case 'video':
        const video = dom.create('video', 'message-video');
        video.controls = true;
        video.src = message.fileUrl;
        bubble.appendChild(video);
        break;

      default:
        bubble.textContent = message.content || '[未知消息类型]';
    }

    return bubble;
  },

  // 添加系统消息
  addSystemMessage(text) {
    const div = dom.create('div', 'system-message', dom.escapeHtml(text));
    this.container.appendChild(div);
  },

  // 滚动到底部
  scrollToBottom(smooth = true) {
    const container = $('#messagesContainer');
    dom.scrollToBottom(container, smooth);
  },

  // 清空消息
  clear() {
    this.messages = [];
    dom.empty(this.container);
  },

  // 图片查看器
  setupImageViewer() {
    const viewer = $('#imageViewer');
    const viewerImage = $('#viewerImage');
    const viewerClose = $('#viewerClose');
    const viewerOverlay = $('#viewerOverlay');

    viewerClose.onclick = () => dom.hide(viewer);
    viewerOverlay.onclick = () => dom.hide(viewer);
  },

  showImage(url) {
    const viewer = $('#imageViewer');
    const viewerImage = $('#viewerImage');
    viewerImage.src = url;
    dom.show(viewer);
  }
};
