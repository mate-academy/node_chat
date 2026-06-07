'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const ws_1 = require("ws");
const app_1 = __importDefault(require("./app"));
const roomStore_js_1 = require("./store/roomStore.js");
const PORT = Number(process.env.PORT || 5000);
const server = app_1.default.listen(PORT, () => {
    process.stdout.write(`Server listening on http://localhost:${PORT}\n`);
});
const wss = new ws_1.WebSocketServer({ server });
const clients = new Map();
wss.on('connection', (client) => {
    clients.set(client, { roomId: null });
    console.log('A new client connected');
    client.on('message', (data) => {
        const rawMessage = data.toString();
        try {
            const payload = JSON.parse(rawMessage);
            if (payload.type === 'join_room') {
                const clientState = clients.get(client);
                if (!clientState) {
                    return;
                }
                clientState.roomId = payload.roomId;
                return;
            }
            if (payload.type === 'send_message') {
                const author = payload.author.trim();
                const text = payload.text.trim();
                if (!author || !text) {
                    return;
                }
                const message = roomStore_js_1.roomStore.addMessageToRoom(payload.roomId, author, text);
                if (!message) {
                    return;
                }
                const responsePayload = JSON.stringify({
                    type: 'message_created',
                    roomId: payload.roomId,
                    message,
                });
                clients.forEach((clientState, socketClient) => {
                    if (clientState.roomId === payload.roomId &&
                        socketClient.readyState === ws_1.WebSocket.OPEN) {
                        socketClient.send(responsePayload);
                    }
                });
            }
        }
        catch {
            console.log(`Invalid websocket payload: ${rawMessage}`);
        }
    });
    client.on('close', () => {
        clients.delete(client);
    });
});
