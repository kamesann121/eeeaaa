const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const AuthController = {
    // アカウント作成：注文通りのニックネーム/パスワード入力
    async register(socket, data) {
        try {
            const { nick, pass } = data;
            // 精密なバリデーション
            if (!nick || !pass || nick.length < 2 || pass.length < 4) {
                return socket.emit('auth:error', '入力データが不十分です');
            }

            // 重複チェック
            const exist = await db.query('SELECT * FROM users WHERE nick = $1', [nick]);
            if (exist.rows.length > 0) return socket.emit('auth:error', 'その名前は既に使用されています');

            const uid = 'ID-' + uuidv4().split('-')[0].toUpperCase();
            const hashedPass = await bcrypt.hash(pass, 10);
            const defaultIcon = 'default_icon_path';

            await db.query(
                'INSERT INTO users (uid, nick, pass, icon) VALUES ($1, $2, $3, $4)',
                [uid, nick, hashedPass, defaultIcon]
            );

            socket.emit('auth:success', { uid, nick, icon: defaultIcon });
        } catch (err) {
            socket.emit('auth:error', 'サーバーエラーが発生しました');
        }
    },

    // ログイン：成功すれば入室、ミスなら戻るボタン機能に繋げる
    async login(socket, data) {
        try {
            const { nick, pass } = data;
            const res = await db.query('SELECT * FROM users WHERE nick = $1', [nick]);
            if (res.rows.length === 0) return socket.emit('auth:error', 'ユーザーが見つかりません');

            const user = res.rows[0];
            const isValid = await bcrypt.compare(pass, user.pass);
            if (!isValid) return socket.emit('auth:error', 'パスワードが違います');

            socket.emit('auth:success', { uid: user.uid, nick: user.nick, icon: user.icon });
        } catch (err) {
            socket.emit('auth:error', '認証エラー');
        }
    }
};
module.exports = AuthController;
