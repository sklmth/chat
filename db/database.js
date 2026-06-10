const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(process.env.DB_PATH || './chat.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

const insert = db.prepare('INSERT INTO messages (nickname, content, created_at) VALUES (?, ?, ?)');
const recent = db.prepare('SELECT * FROM (SELECT * FROM messages ORDER BY id DESC LIMIT 50) ORDER BY id ASC');

module.exports = {
  saveMessage: (nickname, content) => insert.run(nickname, content, Date.now()),
  getRecent: () => recent.all(),
};
