const db = require('./database');

const Room = {
  // 获取所有活跃房间
  getAllActive() {
    const stmt = db.prepare('SELECT * FROM rooms WHERE is_active = 1 ORDER BY id ASC');
    return stmt.all();
  },

  // 通过ID查找房间
  findById(id) {
    const stmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
    return stmt.get(id);
  },

  // 创建新房间
  create(name, description, type = 'public', iconEmoji = '💬', createdBy = null) {
    const stmt = db.prepare(`
      INSERT INTO rooms (name, description, type, icon_emoji, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, description, type, iconEmoji, createdBy, Date.now());
    return result.lastInsertRowid;
  },

  // 用户加入房间
  addMember(roomId, userId) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO room_members (room_id, user_id, joined_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(roomId, userId, Date.now());
  },

  // 用户离开房间
  removeMember(roomId, userId) {
    const stmt = db.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?');
    stmt.run(roomId, userId);
  },

  // 获取房间成员
  getMembers(roomId) {
    const stmt = db.prepare(`
      SELECT u.* FROM users u
      INNER JOIN room_members rm ON u.id = rm.user_id
      WHERE rm.room_id = ?
      ORDER BY rm.joined_at DESC
    `);
    return stmt.all(roomId);
  },

  // 获取房间在线成员数
  getOnlineMemberCount(roomId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM users u
      INNER JOIN room_members rm ON u.id = rm.user_id
      WHERE rm.room_id = ? AND u.is_online = 1
    `);
    const result = stmt.get(roomId);
    return result.count;
  },

  // 检查用户是否在房间中
  isMember(roomId, userId) {
    const stmt = db.prepare('SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?');
    return stmt.get(roomId, userId) !== undefined;
  },

  // 获取用户加入的所有房间
  getUserRooms(userId) {
    const stmt = db.prepare(`
      SELECT r.* FROM rooms r
      INNER JOIN room_members rm ON r.id = rm.room_id
      WHERE rm.user_id = ?
      ORDER BY rm.joined_at DESC
    `);
    return stmt.all(userId);
  },

  // 更新最后阅读消息ID（用于未读计数）
  updateLastRead(roomId, userId, messageId) {
    const stmt = db.prepare(`
      UPDATE room_members
      SET last_read_message_id = ?
      WHERE room_id = ? AND user_id = ?
    `);
    stmt.run(messageId, roomId, userId);
  },

  // 获取未读消息数
  getUnreadCount(roomId, userId) {
    const stmt = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM messages WHERE room_id = ? AND id > rm.last_read_message_id) as count
      FROM room_members rm
      WHERE rm.room_id = ? AND rm.user_id = ?
    `);
    const result = stmt.get(roomId, roomId, userId);
    return result ? result.count : 0;
  }
};

module.exports = Room;
