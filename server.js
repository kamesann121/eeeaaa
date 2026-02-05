const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" },
    connectionStateRecovery: {} // 切断時の自動復帰機能
});

const SocketRouter = require('./src/routes/socketRouter'); // 分離して精密化

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 全てのSocket通信をルーティング層へ委譲
SocketRouter.init(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log('  KINETIC ANALYSIS SYSTEM : OPERATIONAL  ');
    console.log(`  ACCESS PORT : ${PORT}                   `);
    console.log('-------------------------------------------');
});
