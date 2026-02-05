const db = require('../config/db');

module.exports = {
    // 注文：フレンド一覧の取得
    async getFriends(uid) {
        const res = await db.query(`
            SELECT u.uid, u.nick, u.icon 
            FROM users u
            JOIN friendships f ON (u.uid = f.friend_id OR u.uid = f.user_id)
            WHERE (f.user_id = $1 OR f.friend_id = $1) AND u.uid != $1
        `, [uid]);
        return res.rows;
    },

    // 注文：フレンド申請の承諾（相互リンク作成）
    async acceptRequest(fromId, toId) {
        await db.query('BEGIN');
        try {
            await db.query('DELETE FROM friend_requests WHERE from_uid = $1 AND to_uid = $2', [fromId, toId]);
            await db.query('INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)', [fromId, toId]);
            await db.query('COMMIT');
        } catch (e) {
            await db.query('ROLLBACK');
            throw e;
        }
    },

    // 注文：フレンド削除
    async removeFriend(uid, targetUid) {
        await db.query(`
            DELETE FROM friendships 
            WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
        `, [uid, targetUid]);
    }
};
