const rooms = [];

export const getRooms = async () => {
	return rooms.map(room => room.name);
};

export const getRoomByName = roomName => {
	return rooms.find(room => room.name === roomName);
};
export const createRoom = ({ name, ownerId, ownerName }) => {
	if (getRoomByName(name)) {
		throw new Error('Room already exists');
	}

	const room = {
		name,
		ownerId,
		ownerName,
		messages: [],
		participants: [{ id: ownerId, name: ownerName }],
	};

	rooms.push(room);
	return room;
};

export const sendMessage = (roomName, userName, socketId, message) => {
	const room = getRoomByName(roomName);
	if (!room) {
		throw new Error('Room not found');
	}
	const messageData = {
		author: userName,
		id: socketId,
		message,
		time: new Date(),
	};
	room.messages.push(messageData);
	console.log(room.messages);
	return messageData;
};

export const joinRoom = (roomName, userName, socketId) => {
	const room = getRoomByName(roomName);

	if (!room) {
		throw new Error('Room not found');
	}

	const participantExists = room.participants.some(
		participant => participant.id === socketId
	);

	if (!participantExists) {
		room.participants.push({ id: socketId, name: userName });
	}

	return room;
};

export const leaveRoom = (roomName, socketId) => {
	const room = getRoomByName(roomName);

	if (!room) {
		throw new Error('Room not found');
	}

	room.participants = room.participants.filter(p => p.id !== socketId);

	return room;
};

export const renameRoom = (oldRoomName, newRoomName, socketId) => {
  const room = getRoomByName(oldRoomName);

  if (!room) {
		throw new Error('Room not found');
	}

  const isOwner = room.ownerId === socketId;
  const roomExists = rooms.some(r => r.name === newRoomName);


	if (!isOwner) {
		throw new Error('Only the room owner can rename the room');
  }

  if (roomExists) {
    throw new Error('Room with the this name already exists');
  }

	room.name = newRoomName;
	return room;
};

export const deleteRoom = (roomName, socketId) => {
	const room = getRoomByName(roomName);

	if (!room) {
		throw new Error('Room not found');
	}

	const isOwner = room.ownerId === socketId;

	if (!isOwner) {
		throw new Error('Only the room owner can delete the room');
	}

	const index = rooms.findIndex(room => room.name === roomName);

	if (index !== -1) {
		rooms.splice(index, 1);
	}

	return rooms;
};
