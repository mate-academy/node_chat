import { app } from './app.js';
import { attachChatWebSocket } from './websocket/chatWebSocket.js';

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT);

attachChatWebSocket(server);
