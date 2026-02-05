const SocialManager = {
    // 注文：プレイヤー検索（ニックネームorUID）
    search() {
        const query = document.getElementById('search-query').value;
        if(!query) return;
        socket.emit('social:search', { query, myUid: UIManager.user.uid });
    },

    // 注文：フレンド申請（一度送ったら相手の反応待ちになるバリデーション）
    sendRequest(targetUid) {
        socket.emit('social:request', { fromUid: UIManager.user.uid, toUid: targetUid });
        // UI上で「申請中」に更新
        const btn = document.querySelector(`button[data-uid="${targetUid}"]`);
        if(btn) { btn.disabled = true; btn.innerText = "申請済"; }
    },

    // 注文：受信箱（承諾or拒否）
    respond(fromUid, status) {
        socket.emit('social:respond', { fromUid, toUid: UIManager.user.uid, status });
    },

    renderFriends(list) {
        const container = document.getElementById('friend-list');
        container.innerHTML = list.map(f => `
            <div class="friend-card">
                <span>${f.nick} (${f.uid})</span>
                <button onclick="PartyManager.invite('${f.uid}')">招待</button>
                <button onclick="SocialManager.remove('${f.uid}')">削除</button>
            </div>
        `).join('');
    }
};

socket.on('social:search_result', (results) => {
    const container = document.getElementById('search-results');
    container.innerHTML = results.map(r => `
        <div class="search-item">
            <span>${r.nick}</span>
            <button data-uid="${r.uid}" onclick="SocialManager.sendRequest('${r.uid}')">申請</button>
        </div>
    `).join('');
});
