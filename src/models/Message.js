const db = require('./database');

const Message = {
  // 创建文本消息
  createText(senderId, roomId, content, replyToId = null) {
    const stmt = db.prepare(`
      INSERT INTO messages (room_id, sender_id, message_type, content, reply_to_id, created_at)
      VALUES (?, ?, 'text', ?, ?, ?)
    `);
    const result = stmt.run(roomId, senderId, content, replyToId, Date.now());
    return result.lastInsertRowid;
  },

  // 创建媒体消息
  createMedia(senderId, roomId, type, fileUrl, fileName, fileSize, fileMime, thumbnailUrl = null, duration = null) {
    const stmt = db.prepare(`
      INSERT INTO messages (room_id, sender_id, message_type, file_url, file_name, file_size, file_mime, thumbnail_url, duration, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(roomId, senderId, type, fileUrl, fileName, fileSize, fileMime, thumbnailUrl, duration, Date.now());
    return result.lastInsertRowid;
  },

  // 创建私聊消息
  createPrivate(senderId, receiverId, content) {
    const stmt = db.prepare(`
      INSERT INTO messages (sender_id, receiver_id, message_type, content, created_at)
      VALUES (?, ?, 'text', ?, ?)
    `);
    const result = stmt.run(senderId, receiverId, content, Date.now());
    return result.lastInsertRowid;
  },

  // 通过ID查找消息
  findById(id) {
    const stmt = db.prepare(`
      SELECT m.*, u.nickname, u.avatar_emoji
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `);
    return stmt.get(id);
  },

  // 获取房间最近消息
  getRecentByRoom(roomId, limit = 50) {
    const stmt = db.prepare(`
      SELECT m.*, u.nickname, u.avatar_emoji
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ? AND m.is_deleted = 0
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    return stmt.all(roomId, limit).reverse(); // 反转以时间升序返回
  },

  // 分页加载房间历史消息
  getBeforeMessage(roomId, beforeMessageId, limit = 50) {
    const stmt = db.prepare(`
      SELECT m.*, u.nickname, u.avatar_emoji
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ? AND m.id < ? AND m.is_deleted = 0
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    return stmt.all(roomId, beforeMessageId, limit).reverse();
  },

  // 获取私聊历史消息
  getPrivateMessages(userId1, userId2, limit = 50) {
    const stmt = db.prepare(`
      SELECT m.*, u.nickname, u.avatar_emoji
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.room_id IS NULL
        AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
        AND m.is_deleted = 0
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId1, userId2, userId2, userId1, limit).reverse();
  },

  // 标记消息为已删除
  markDeleted(messageId) {
    const stmt = db.prepare('UPDATE messages SET is_deleted = 1 WHERE id = ?');
    stmt.run(messageId);
  },

  // 获取房间消息总数
  countByRoom(roomId) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM messages WHERE room_id = ? AND is_deleted = 0');
    const result = stmt.get(roomId);
    return result.count;
  },

  // 删除旧消息（可选，定期清理）
  deleteOldMessages(daysAgo = 30) {
    const threshold = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
    const stmt = db.prepare('DELETE FROM messages WHERE created_at < ?');
    const result = stmt.run(threshold);
    return result.changes;
  }
};

module.exports = Message;
