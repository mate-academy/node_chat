import * as roomsServices from '../services/roomsServices.js';

export const getRoomsRequest = async (req, res) => {
	res.json(await roomsServices.getRooms());
};

export const createRoomEvent = (socket, io) => {
	socket.on('create-room', async ({ roomName, ownerName }) => {
		try {
			roomsServices.createRoom({
				name: roomName,
				ownerId: socket.id,
				ownerName,
			});
			socket.emit('room-created', roomName);
			io.emit('rooms-updated', await roomsServices.getRooms());
		} catch (e) {
			socket.emit('room-error', e.message);
		}
	});
};

export const sendMessageEvent = (socket, io) => {
	socket.on('send-message', (roomName, userName, socketId, message) => {
		try {
			const messageData = roomsServices.sendMessage(
				roomName,
				userName,
				socketId,
				message
			);
			io.to(roomName).emit('new-message', messageData);
		} catch (e) {
			socket.emit('room-error', e.message);
		}
	});
};

export const joinRoomEvent = socket => {
	socket.on('join-room', (roomName, userName) => {
		try {
			const room = roomsServices.joinRoom(roomName, userName, socket.id);
			socket.join(roomName);
			socket.emit('joined-room', roomName);
			socket.emit('room-messages', room.messages);
		} catch (e) {
			socket.emit('room-error', e.message);
			return;
		}
	});
};

export const leaveRoomEvent = (socket, io) => {
	socket.on('leave-room', (roomName, socketId) => {
		try {
			roomsServices.leaveRoom(roomName, socketId);
			socket.leave(roomName);
			io.to(socketId).emit('leaved-room', socketId);
		} catch (e) {
			socket.emit('room-error', e.message);
		}
	});
};

export const renameRoomEvent = (socket, io) => {
	socket.on('rename-room', (oldRoomName, newRoomName) => {
		try {
			roomsServices.renameRoom(oldRoomName, newRoomName, socket.id);
			io.to(oldRoomName).emit('room-renamed', newRoomName);
		} catch (e) {
			socket.emit('room-error', e.message);
		}
	});
};

export const deleteRoomEvent = (socket, io) => {
	socket.on('delete-room', (roomName, socketId) => {
		try {
			roomsServices.deleteRoom(roomName, socketId);
			io.to(roomName).emit('room-deleted', roomName);
		} catch (e) {
			socket.emit('room-error', e.message);
			return;
		}
	});
};
