const PartyManager = {
    currentParty: null,

    invite(friendUid) {
        socket.emit('party:invite', { toUid: friendUid, fromUser: UIManager.user });
    },

    // 招待を受けた際の処理
    handleInvitation(data) {
        if(confirm(`${data.from.nick}さんからシミュレーションの招待が届きました。入室しますか？`)) {
            socket.emit('party:join', { partyId: data.from.uid, user: UIManager.user });
        }
    },

    updateDisplay(party) {
        this.currentParty = party;
        const container = document.getElementById('party-list');
        container.innerHTML = party.members.map(m => `
            <div class="member-card">
                <span>${m.nick}</span>
                <span class="status-tag">${party.readyStatus[m.uid] ? 'READY' : 'WAITING'}</span>
            </div>
        `).join('');
        
        // 注文：左側の表記をSoloからパーティに変更
        document.querySelector('.pane-left h3').innerText = 
            party.members.length > 1 ? "所属ユニット (Party)" : "所属ユニット (Solo)";
    }
};

socket.on('party:invited', (d) => PartyManager.handleInvitation(d));
socket.on('party:updated', (p) => PartyManager.updateDisplay(p));
