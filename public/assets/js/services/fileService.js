// 文件上传服务
const fileService = {
  // 上传图片
  async uploadImage(file) {
    return this.uploadFile(file, '/api/upload/image', 'image');
  },

  // 上传普通文件
  async uploadFile(file, url, fieldName) {
    const formData = new FormData();
    formData.append(fieldName || 'file', file);

    try {
      const response = await fetch(url || '/api/upload/file', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '上传失败');
      }

      return data.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // 上传音频
  async uploadAudio(file) {
    return this.uploadFile(file, '/api/upload/audio', 'audio');
  },

  // 上传视频
  async uploadVideo(file) {
    return this.uploadFile(file, '/api/upload/video', 'video');
  },

  // 验证文件
  validateFile(file, type) {
    const limits = {
      image: { maxSize: 5 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] },
      file: { maxSize: 20 * 1024 * 1024, types: ['application/pdf', 'application/zip', 'text/plain'] },
      audio: { maxSize: 10 * 1024 * 1024, types: ['audio/mpeg', 'audio/wav', 'audio/ogg'] },
      video: { maxSize: 50 * 1024 * 1024, types: ['video/mp4', 'video/webm'] }
    };

    const limit = limits[type];
    if (!limit) return { valid: false, error: '不支持的文件类型' };

    if (file.size > limit.maxSize) {
      const maxMB = Math.floor(limit.maxSize / (1024 * 1024));
      return { valid: false, error: `文件大小不能超过${maxMB}MB` };
    }

    if (!limit.types.includes(file.type)) {
      return { valid: false, error: '不支持的文件格式' };
    }

    return { valid: true };
  },

  // 格式化文件大小
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  // 获取文件图标
  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('zip')) return '📦';
    return '📎';
  }
};
