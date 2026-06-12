// 输入区域组件
const InputArea = {
  form: null,
  input: null,
  typingTimer: null,
  currentFile: null,

  init() {
    this.form = $('#messageForm');
    this.input = $('#messageInput');

    this.setupEventListeners();
    this.setupFileUpload();
  },

  // 设置事件监听
  setupEventListeners() {
    // 表单提交
    this.form.onsubmit = (e) => {
      e.preventDefault();
      this.sendMessage();
    };

    // 正在输入
    this.input.oninput = () => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => {
        socketService.sendTyping();
      }, 500);
    };

    // Enter发送，Shift+Enter换行
    this.input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    };
  },

  // 设置文件上传
  setupFileUpload() {
    const imageInput = $('#imageInput');
    const fileInput = $('#fileInput');
    const audioInput = $('#audioInput');

    $('#uploadImageBtn').onclick = () => imageInput.click();
    $('#uploadFileBtn').onclick = () => fileInput.click();
    $('#uploadAudioBtn').onclick = () => audioInput.click();

    imageInput.onchange = (e) => this.handleFileSelect(e, 'image');
    fileInput.onchange = (e) => this.handleFileSelect(e, 'file');
    audioInput.onchange = (e) => this.handleFileSelect(e, 'audio');

    // 预览模态框
    $('#closePreview').onclick = () => this.closePreview();
    $('#cancelUpload').onclick = () => this.closePreview();
    $('#confirmUpload').onclick = () => this.uploadAndSend();
  },

  // 发送文本消息
  sendMessage() {
    const content = this.input.value.trim();
    if (!content) return;

    socketService.sendMessage(content);
    this.input.value = '';
  },

  // 处理文件选择
  handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件
    const validation = fileService.validateFile(file, type);
    if (!validation.valid) {
      alert(validation.error);
      event.target.value = '';
      return;
    }

    this.currentFile = { file, type };
    this.showPreview(file, type);
    event.target.value = '';
  },

  // 显示预览
  showPreview(file, type) {
    const preview = $('#uploadPreview');
    const previewBody = $('#previewBody');

    dom.empty(previewBody);

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = dom.create('img', 'preview-image');
        img.src = e.target.result;
        previewBody.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      const fileInfo = dom.create('div', 'preview-file-info');
      fileInfo.innerHTML = `
        <div class="preview-file-icon">${fileService.getFileIcon(file.type)}</div>
        <div class="preview-file-details">
          <div class="preview-file-name">${dom.escapeHtml(file.name)}</div>
          <div class="preview-file-size">${fileService.formatSize(file.size)}</div>
        </div>
      `;
      previewBody.appendChild(fileInfo);
    }

    dom.show(preview);
  },

  // 关闭预览
  closePreview() {
    dom.hide('#uploadPreview');
    this.currentFile = null;
  },

  // 上传并发送
  async uploadAndSend() {
    if (!this.currentFile) return;

    const { file, type } = this.currentFile;
    const confirmBtn = $('#confirmUpload');

    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = '上传中...';

      let result;
      if (type === 'image') {
        result = await fileService.uploadImage(file);
      } else if (type === 'audio') {
        result = await fileService.uploadAudio(file);
      } else {
        result = await fileService.uploadFile(file);
      }

      // 发送媒体消息
      socketService.sendMediaMessage({
        type: type,
        url: result.url,
        fileName: result.fileName,
        fileSize: result.size,
        mimeType: result.mimeType,
        thumbnail: result.thumbnail
      });

      this.closePreview();
    } catch (error) {
      alert('上传失败: ' + error.message);
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = '发送';
    }
  },

  // 禁用/启用输入
  setEnabled(enabled) {
    this.input.disabled = !enabled;
    $('#sendBtn').disabled = !enabled;
  }
};
