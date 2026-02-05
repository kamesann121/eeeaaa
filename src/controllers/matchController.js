let queues = { duo: [], squad: [] };

module.exports = {
    async joinQueue(socket, io, data) {
        const { mode, user, partyMembers } = data;
        
        // 注文：スクワッドモードの人数制限
        if (mode === 'squad' && partyMembers.length < 3) {
            return socket.emit('match:error', '実験には最低3人の研究員が必要です');
        }

        // マッチングロジック
        if (mode === 'solo') {
            queues.duo.push({ socketId: socket.id, user });
            if (queues.duo.length >= 2) {
                const p1 = queues.duo.shift();
                const p2 = queues.duo.shift();
                this.startLab(io, [p1, p2], '1v1');
            }
        } else {
            // パーティ単位のマッチング
            this.startLab(io, partyMembers, mode);
        }
    },

    startLab(io, players, mode) {
        const labId = `LAB-${Math.random().toString(36).substr(2, 9)}`;
        
        // 注文：自動でチーム分け (2v2 or 2v1)
        let teams = { A: [], B: [] };
        players.forEach((p, index) => {
            if (index % 2 === 0) teams.A.push(p.uid);
            else teams.B.push(p.uid);
        });

        io.to(labId).emit('match:found', { 
            labId, 
            teams, 
            config: { maxGoals: 5 } // 注文：5本勝負 
        });
    }
};
