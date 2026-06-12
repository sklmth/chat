const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './chat.db';
const db = new Database(DB_PATH);

// 启用外键约束
db.pragma('foreign_keys = ON');

console.log('Initializing database...');

// 执行迁移脚本
const migrationsDir = path.join(__dirname, '../../db/migrations');
const migrationFiles = fs.readdirSync(migrationsDir).sort();

migrationFiles.forEach(file => {
  if (file.endsWith('.sql')) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec(sql);
  }
});

console.log('Database initialized successfully');

module.exports = db;
