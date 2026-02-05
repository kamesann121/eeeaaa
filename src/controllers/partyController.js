const db = require('../config/db');

let activeParties = {}; // { partyId: { leader, members: [], readyStatus: {} } }

module.exports = {
    async invite(socket, io, data) {
        const { toUid, fromUser } = data;
        // ターゲットのソケットを探して招待を送信
        socket.to(toUid).emit('party:invited', { from: fromUser });
    },

    async join(socket, io, data) {
        const { partyId, user } = data;
        if (!activeParties[partyId]) {
            activeParties[partyId] = { leader: user.uid, members: [], mode: 'solo' };
        }
        activeParties[partyId].members.push(user);
        socket.join(partyId);
        io.to(partyId).emit('party:updated', activeParties[partyId]);
    },

    // 注文：準備OKの管理。全員揃わないと開始できないトリガーに使用
    async setReady(socket, io, data) {
        const { partyId, uid, isReady } = data;
        const party = activeParties[partyId];
        if (party) {
            party.readyStatus[uid] = isReady;
            io.to(partyId).emit('party:ready_update', party.readyStatus);
        }
    }
};
