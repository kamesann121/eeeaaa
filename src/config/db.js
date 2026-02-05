const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // RenderでのSSL必須設定
});

// テーブルの自動生成（アカウント・フレンド・申請・保存データ）
const initSchema = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                uid TEXT PRIMARY KEY,
                nick TEXT UNIQUE NOT NULL,
                pass TEXT NOT NULL,
                icon TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS friendships (
                user_id TEXT REFERENCES users(uid),
                friend_id TEXT REFERENCES users(uid),
                PRIMARY KEY (user_id, friend_id)
            );
            CREATE TABLE IF NOT EXISTS friend_requests (
                from_uid TEXT REFERENCES users(uid),
                to_uid TEXT REFERENCES users(uid),
                status TEXT DEFAULT 'pending',
                PRIMARY KEY (from_uid, to_uid)
            );
        `);
        console.log("DB Schema Synchronized.");
    } catch (err) {
        console.error("DB Init Error:", err);
    }
};

initSchema();
module.exports = pool;
