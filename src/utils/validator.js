const { MESSAGE_CONFIG, FILE_LIMITS } = require('../config/constants');

function validateTextMessage(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: '消息内容不能为空' };
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: '消息内容不能为空' };
  }

  if (trimmed.length > MESSAGE_CONFIG.MAX_LENGTH) {
    return { valid: false, error: `消息长度不能超过${MESSAGE_CONFIG.MAX_LENGTH}字符` };
  }

  return { valid: true, content: trimmed };
}

function validateFileUpload(file, type) {
  if (!file) {
    return { valid: false, error: '未选择文件' };
  }

  const limits = FILE_LIMITS[type];
  if (!limits) {
    return { valid: false, error: '不支持的文件类型' };
  }

  if (file.size > limits.maxSize) {
    const maxSizeMB = Math.floor(limits.maxSize / (1024 * 1024));
    return { valid: false, error: `文件大小不能超过${maxSizeMB}MB` };
  }

  if (!limits.mimes.includes(file.mimetype)) {
    return { valid: false, error: '不支持的文件格式' };
  }

  return { valid: true };
}

function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'video';
  return 'file';
}

function sanitizeFilename(filename) {
  // 移除路径穿越字符和特殊字符
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

module.exports = {
  validateTextMessage,
  validateFileUpload,
  getFileType,
  sanitizeFilename
};
