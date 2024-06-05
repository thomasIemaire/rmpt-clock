const WebSocket = require('ws');
const Ws = require('./models/ws.model');
const url = require('url');

const wss = new WebSocket.Server({ port: 8100 });
const wsServer = new Ws();

wss.on('connection', (ws, request) => {
    const pathname = url.parse(request.url).pathname;
    const roomId = pathname.substring(1);

    wsServer.addConnectionInRoom(roomId, ws);

    ws.on('close', () => {
        wsServer.removeConnectionInRoom(roomId, ws);
    });
});