// エラーキャッチ（Chromebook用）
window.onerror = (m, u, l) => alert(`Error: ${m}\nLine: ${l}`);

const socket = io();
const App = {
    user: null,
    mode: 'login',

    init() {
        window.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                document.getElementById('secure-overlay').classList.remove('hidden');
                const saved = localStorage.getItem('researcher_uid');
                if (saved) socket.emit('auth:auto', saved);
            }
        });
    },

    toggleAuthMode() {
        this.mode = (this.mode === 'login') ? 'register' : 'login';
        document.getElementById('auth-title').innerText = (this.mode === 'login') ? '研究員ログイン' : '新規アカウント作成';
    },

    submitAuth() {
        const nick = document.getElementById('auth-nick').value;
        const pass = document.getElementById('auth-pass').value;
        if(!nick || !pass) return alert("入力してください");
        
        // サーバー側のイベント名に合わせて送信
        socket.emit(`auth:${this.mode}`, { nick, pass });
    },

    hideSystem() { document.getElementById('secure-overlay').classList.add('hidden'); },

    showLobby(data) {
        this.user = data;
        localStorage.setItem('researcher_uid', data.uid);
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('lobby-screen').classList.remove('hidden');
        document.getElementById('my-uid-display').innerText = data.uid;
        alert("ログイン成功: " + data.nick);
    },

    toggleSettings() { document.getElementById('side-panel').classList.toggle('active'); },

    switchTab(t) {
        document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
        document.getElementById(`tab-${t}`).classList.remove('hidden');
    },

    searchUser() {
        const q = document.getElementById('search-query').value;
        socket.emit('social:search', { query: q, myUid: this.user.uid });
    }
};

// ソケット受信イベント
socket.on('auth:success', (d) => App.showLobby(d));
socket.on('auth:error', (m) => alert("認証エラー: " + m));
socket.on('connect_error', () => alert("サーバーとの接続に失敗しました。再起動を待ってください。"));

App.init();
