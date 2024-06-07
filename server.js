const WebSocket = require('ws');
const Ws = require('./models/ws.model');
const url = require('url');

const wss = new WebSocket.Server({ port: 8100 });
const wsServer = new Ws();

wss.on('connection', (ws, req) => {
    const pathname = url.parse(req.url).pathname;
    const roomId = pathname.substring(1);

    if (req.headers["x-access-token"])
        wsServer.addConnectionInRoom(roomId, ws);
    else
        ws.send(JSON.stringify({ 'message': "No token provided!" }));

    ws.on('close', () => {
        wsServer.removeConnectionInRoom(roomId, ws);
    });
});