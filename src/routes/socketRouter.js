const AuthController = require('../controllers/authController');
const FriendController = require('../controllers/friendController');
const PartyController = require('../controllers/partyController');
const MatchController = require('../controllers/matchController');

module.exports = {
    init(io) {
        io.on('connection', (socket) => {
            console.log(`[System] Node Synchronized: ${socket.id}`);

            // ==========================================
            // 1. 認証・アカウント管理 (注文: ログイン/アカウント作成/自動ログイン)
            // ==========================================
            socket.on('auth:register', (data) => {
                AuthController.register(socket, data);
            });

            socket.on('auth:login', (data) => {
                AuthController.login(socket, data);
            });

            socket.on('auth:auto', (uid) => {
                AuthController.autoLogin(socket, uid);
            });


            // ==========================================
            // 2. フレンド・検索 (注文: UID検索/申請重複防止/受信拒否設定)
            // ==========================================
            socket.on('social:search', (data) => {
                FriendController.search(socket, data);
            });

            socket.on('social:request', (data) => {
                FriendController.sendRequest(socket, data);
            });

            socket.on('social:respond', (data) => {
                FriendController.handleResponse(socket, io, data);
            });

            socket.on('social:delete', (data) => {
                FriendController.removeFriend(socket, data);
            });


            // ==========================================
            // 3. パーティ管理 (注文: 招待/左右分割表示の同期)
            // ==========================================
            socket.on('party:invite', (data) => {
                PartyController.invite(socket, io, data);
            });

            socket.on('party:join', (data) => {
                PartyController.join(socket, io, data);
            });

            socket.on('party:ready', (data) => {
                PartyController.setReady(socket, io, data);
            });


            // ==========================================
            // 4. シミュレーション実行 (注文: 2v2/スクワッド/5本勝負)
            // ==========================================
            socket.on('match:join', (data) => {
                // 注文: スクワッドの人数制限ロジックをここで呼び出し
                MatchController.joinQueue(socket, io, data);
            });

            // リアルタイム座標同期 (注文: 真上からの奥行き3D)
            socket.on('sim:vector', (data) => {
                // 同じLAB(Room)にいるメンバー全員に座標をブロードキャスト
                socket.to(data.labId).emit('sim:sync', data);
            });

            // ゴール判定・スコア管理 (注文: 5本勝負判定)
            socket.on('sim:goal', (data) => {
                MatchController.handleGoal(socket, io, data);
            });


            // ==========================================
            // 切断時の処理
            // ==========================================
            socket.on('disconnect', () => {
                console.log(`[System] Node Disconnected: ${socket.id}`);
            });
        });
    }
};
