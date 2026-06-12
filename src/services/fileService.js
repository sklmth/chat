const File = require('../models/File');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { validateFileUpload, getFileType, sanitizeFilename } = require('../utils/validator');

const fileService = {
  // 处理文件上传
  async handleFileUpload(file, messageId, uploadIp = null) {
    if (!file) {
      throw new Error('未选择文件');
    }

    // 验证文件
    const type = getFileType(file.mimetype);
    const validation = validateFileUpload(file, type);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 生成存储文件名
    const ext = path.extname(file.originalname);
    const storedName = uuidv4() + ext;

    // 保存文件元数据到数据库
    const fileId = File.create(
      messageId,
      sanitizeFilename(file.originalname),
      storedName,
      file.mimetype,
      file.size,
      null, // width
      null, // height
      uploadIp
    );

    return {
      id: fileId,
      originalName: file.originalname,
      storedName,
      url: `/uploads/${type}s/${storedName}`,
      size: file.size,
      mimeType: file.mimetype
    };
  },

  // 生成文件URL
  getFileUrl(type, filename) {
    return `/uploads/${type}s/${filename}`;
  },

  // 删除文件
  async deleteFile(fileId) {
    const file = File.findById(fileId);
    if (!file) {
      throw new Error('文件不存在');
    }

    // 从数据库删除记录
    File.delete(fileId);

    // 从磁盘删除文件
    const type = getFileType(file.mime_type);
    const filePath = path.join(__dirname, `../../uploads/${type}s`, file.stored_name);

    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Failed to delete file from disk:', err);
    }
  },

  // 获取文件元数据
  getFileMetadata(fileId) {
    return File.findById(fileId);
  },

  // 获取文件总大小统计
  getTotalSize() {
    return File.getTotalSize();
  },

  // 格式化文件大小显示
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
};

module.exports = fileService;
