const db = require('./database');

const User = {
  // 创建新用户
  create(socketId, nickname, avatarEmoji = '👤', sessionToken = null) {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO users (socket_id, nickname, avatar_emoji, session_token, is_online, created_at, last_seen)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `);
    const result = stmt.run(socketId, nickname, avatarEmoji, sessionToken, now, now);
    return result.lastInsertRowid;
  },

  // 通过ID查找用户
  findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // 通过socket_id查找用户
  findBySocketId(socketId) {
    const stmt = db.prepare('SELECT * FROM users WHERE socket_id = ?');
    return stmt.get(socketId);
  },

  // 通过session_token查找用户
  findBySessionToken(token) {
    const stmt = db.prepare('SELECT * FROM users WHERE session_token = ?');
    return stmt.get(token);
  },

  // 更新socket_id（用户重连）
  updateSocketId(userId, newSocketId) {
    const stmt = db.prepare('UPDATE users SET socket_id = ?, is_online = 1, last_seen = ? WHERE id = ?');
    stmt.run(newSocketId, Date.now(), userId);
  },

  // 更新在线状态
  updateOnlineStatus(userId, isOnline) {
    const stmt = db.prepare('UPDATE users SET is_online = ?, last_seen = ? WHERE id = ?');
    stmt.run(isOnline ? 1 : 0, Date.now(), userId);
  },

  // 更新当前房间
  updateCurrentRoom(userId, roomId) {
    const stmt = db.prepare('UPDATE users SET current_room_id = ? WHERE id = ?');
    stmt.run(roomId, userId);
  },

  // 获取所有在线用户
  getOnlineUsers() {
    const stmt = db.prepare('SELECT * FROM users WHERE is_online = 1 ORDER BY created_at DESC');
    return stmt.all();
  },

  // 获取房间内的在线用户
  getOnlineUsersInRoom(roomId) {
    const stmt = db.prepare(`
      SELECT u.* FROM users u
      INNER JOIN room_members rm ON u.id = rm.user_id
      WHERE rm.room_id = ? AND u.is_online = 1
      ORDER BY u.created_at DESC
    `);
    return stmt.all(roomId);
  },

  // 删除用户（断开连接清理）
  delete(userId) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(userId);
  },

  // 清理离线超过指定时间的用户（可选，定期清理）
  cleanupInactiveUsers(hoursAgo = 24) {
    const threshold = Date.now() - (hoursAgo * 60 * 60 * 1000);
    const stmt = db.prepare('DELETE FROM users WHERE is_online = 0 AND last_seen < ?');
    const result = stmt.run(threshold);
    return result.changes;
  }
};

module.exports = User;
