const UIManager = {
    mode: 'login',

    init() {
        // 注文：Ctrl + A で起動
        window.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                document.getElementById('secure-overlay').classList.remove('hidden');
                this.checkAutoLogin();
            }
        });
    },

    // 注文：自動ログイン
    checkAutoLogin() {
        const savedUid = localStorage.getItem('researcher_uid');
        if (savedUid) {
            socket.emit('auth:auto', savedUid);
        }
    },

    toggleAuthMode() {
        this.mode = (this.mode === 'login') ? 'register' : 'login';
        document.getElementById('auth-title').innerText = 
            (this.mode === 'login') ? '研究員ログイン' : '新規アカウント作成';
    },

    submitAuth() {
        const nick = document.getElementById('auth-nick').value;
        const pass = document.getElementById('auth-pass').value;
        socket.emit(`auth:${this.mode}`, { nick, pass });
    },

    hideSystem() {
        document.getElementById('secure-overlay').classList.add('hidden');
    },

    showLobby(userData) {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('lobby-screen').classList.remove('hidden');
        document.getElementById('my-uid-display').innerText = userData.uid;
        localStorage.setItem('researcher_uid', userData.uid);
    },

    toggleSettings() {
        document.getElementById('side-panel').classList.toggle('active');
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    }
};

UIManager.init();

// ソケット受信：ログイン成功時
socket.on('auth:success', (data) => UIManager.showLobby(data));
// 注文：失敗時に戻るボタンで戻れるように（特に処理を止めない）
socket.on('auth:error', (msg) => alert(msg));
