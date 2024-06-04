const { User, Room, Message } = require('../models');

// Socket event handlers
const handleNewUser = async (socket, username) => {
    let user = await User.findOne({ where: { username } });
    if (!user) {
        user = await User.create({ username });
    }
    socket.emit('user set', username);
};

const handleCreateRoom = async (io, roomName) => {
    let room = await Room.findOne({ where: { name: roomName } });
    if (!room) {
        room = await Room.create({ name: roomName });
        io.emit('room created', roomName);
    }
};

const handleJoinRoom = async (socket, roomName) => {
    const room = await Room.findOne({ where: { name: roomName } });
    if (room) {
        const user = await User.findOne({ where: { username: socket.handshake.query.username } });
        await room.addUser(user);
        socket.join(roomName);
        const messages = await Message.findAll({
            where: { RoomId: room.id },
            include: [User],
            order: [['time', 'ASC']]
        });
        socket.emit('room joined', {
            roomName,
            messages: messages.map(msg => ({
                author: msg.User.username,
                text: msg.text,
                time: msg.time
            }))
        });
    }
};

const handleRenameRoom = async (io, { oldName, newName }) => {
    const room = await Room.findOne({ where: { name: oldName } });
    if (room) {
        room.name = newName;
        await room.save();
        io.emit('room renamed', { oldName, newName });
    }
};

const handleDeleteRoom = async (io, roomName) => {
    const room = await Room.findOne({ where: { name: roomName } });
    if (room) {
        await room.destroy();
        io.emit('room deleted', roomName);
    }
};

const handleSendMessage = async (io, socket, { roomName, message }) => {
    const room = await Room.findOne({ where: { name: roomName } });
    if (room) {
        const user = await User.findOne({ where: { username: socket.handshake.query.username } });
        const newMessage = await Message.create({
            text: message,
            RoomId: room.id,
            UserId: user.id,
            time: new Date()
        });
        io.to(roomName).emit('new message', {
            author: user.username,
            text: newMessage.text,
            time: newMessage.time
        });
    }
};

module.exports = {
    handleNewUser,
    handleCreateRoom,
    handleJoinRoom,
    handleRenameRoom,
    handleDeleteRoom,
    handleSendMessage
};



socket.on('new user', (username) => handleNewUser(socket, username));
    socket.on('create room', (roomName) => handleCreateRoom(io, roomName));
    socket.on('join room', (roomName) => handleJoinRoom(socket, roomName));
    socket.on('rename room', (data) => handleRenameRoom(io, data));
    socket.on('delete room', (roomName) => handleDeleteRoom(io, roomName));
    socket.on('send message', (data) => handleSendMessage(io, socket, data));

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });