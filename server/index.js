import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import * as roomsController from './controllers/roomsController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/rooms', roomsController.getRoomsRequest);

const server = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
});

io.on('connection', socket => {
	roomsController.joinRoomEvent(socket);

	roomsController.createRoomEvent(socket, io);

	roomsController.sendMessageEvent(socket, io);

	roomsController.leaveRoomEvent(socket, io);

	roomsController.renameRoomEvent(socket, io);

	roomsController.deleteRoomEvent(socket, io);
});
