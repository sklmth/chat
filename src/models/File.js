const db = require('./database');

const File = {
  // 保存文件元数据
  create(messageId, originalName, storedName, mimeType, size, width = null, height = null, uploadIp = null) {
    const stmt = db.prepare(`
      INSERT INTO files (message_id, original_name, stored_name, mime_type, size, width, height, upload_ip, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(messageId, originalName, storedName, mimeType, size, width, height, uploadIp, Date.now());
    return result.lastInsertRowid;
  },

  // 通过消息ID查找文件
  findByMessageId(messageId) {
    const stmt = db.prepare('SELECT * FROM files WHERE message_id = ?');
    return stmt.get(messageId);
  },

  // 通过ID查找文件
  findById(id) {
    const stmt = db.prepare('SELECT * FROM files WHERE id = ?');
    return stmt.get(id);
  },

  // 删除文件记录
  delete(id) {
    const stmt = db.prepare('DELETE FROM files WHERE id = ?');
    stmt.run(id);
  },

  // 获取文件总大小统计
  getTotalSize() {
    const stmt = db.prepare('SELECT SUM(size) as total FROM files');
    const result = stmt.get();
    return result.total || 0;
  },

  // 获取用户上传的文件列表
  getByUploadIp(uploadIp, limit = 100) {
    const stmt = db.prepare('SELECT * FROM files WHERE upload_ip = ? ORDER BY created_at DESC LIMIT ?');
    return stmt.all(uploadIp, limit);
  }
};

module.exports = File;
