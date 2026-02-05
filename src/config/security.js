module.exports = {
    validateUser(nick, pass) {
        if (!nick || nick.length < 2 || nick.length > 15) return false;
        if (!pass || pass.length < 4) return false;
        return true;
    },
    // 学校のPCからのアクセスを想定したパケットチェック
    isSecureHandshake(socket) {
        return socket.handshake.headers['user-agent'] !== undefined;
    }
};
