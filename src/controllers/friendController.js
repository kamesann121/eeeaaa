const db = require('../config/db');

const FriendController = {
    async search(socket, data) {
        const { query, myUid } = data;
        try {
            // 注文：UIDまたはニックネームで検索
            // さらに注文：すでにフレンドのユーザーは検索結果から除外する精密クエリ
            const res = await db.query(`
                SELECT uid, nick, icon FROM users 
                WHERE (uid = $1 OR nick = $1) 
                AND uid != $2
                AND uid NOT IN (SELECT friend_id FROM friends WHERE user_id = $2)
            `, [query, myUid]);

            socket.emit('social:search_result', res.rows);
        } catch (err) {
            console.error(err);
        }
    },

    async sendRequest(socket, data) {
        const { fromId, toId } = data;
        try {
            // 注文：相手が受信を拒否（または既に存在）しない限り再度送れない
            const check = await db.query('SELECT * FROM requests WHERE from_id = $1 AND to_id = $2', [fromId, toId]);
            if (check.rows.length > 0) return socket.emit('social:error', '既に申請済みです');

            await db.query('INSERT INTO requests (from_id, to_id) VALUES ($1, $2)', [fromId, toId]);
            // リアルタイム通知（相手がオンラインなら）
            socket.to(toId).emit('social:new_request', { from: fromId });
        } catch (err) {
            socket.emit('social:error', '申請に失敗しました');
        }
    }
};
module.exports = FriendController;
