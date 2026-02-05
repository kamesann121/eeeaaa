const AuthController = require('../controllers/authController');
const FriendController = require('../controllers/friendController');
const PartyController = require('../controllers/partyController');
const MatchController = require('../controllers/matchController');

module.exports = {
    init(io) {
        io.on('connection', (socket) => {
            console.log(`Node Connected: ${socket.id}`);

            // 認証・アカウント管理
            socket.on('auth:register', (d) => AuthController.register(socket, d));
            socket.on('auth:login', (d) => AuthController.login(socket, d));
            socket.on('auth:auto', (uid) => AuthController.autoLogin(socket, uid));

            // フレンド・検索（注文：受信拒否設定、UID検索）
            socket.on('social:search', (q) => FriendController.search(socket, q));
            socket.on('social:request', (d) => FriendController.sendRequest(socket, d));
            socket.on('social:respond', (d) => FriendController.handleResponse(socket, io, d));

            // パーティ・ロビー
            socket.on('party:invite', (d) => PartyController.invite(socket, io, d));
            socket.on('party:ready', (d) => PartyController.setReady(socket, io, d));

            // マッチング・同期（注文：2v2, 4v4, 5本勝負）
            socket.on('match:join', (d) => MatchController.joinQueue(socket, io, d));
            socket.on('sim:vector', (d) => socket.broadcast.to(d.labId).emit('sim:sync', d));
        });
    }
};
