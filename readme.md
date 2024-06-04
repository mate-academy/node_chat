# Chat (with Node.js) 
Implement a chat application (both client and server)

- You type a username and send it to the server
- It is now username (save it in localStorage)
- All the messages should have an author, time and text
- Implement an ability to create rooms (create / rename / join / delete)
- New user should see all prev messages in the room

**Read [the guideline](https://github.com/mate-academy/js_task-guideline/blob/master/README.md) before start**


const { User, Room, Message } = require('../models');

const handleNewUser = async (socket, username) => {
    let user = await User.findOne({ where: { username } });
    if (!user) {
        user = await User.create({ username });
    }
    socket.emit('user set', username);
};

const handleCreateRoom = async (socket, roomName) => {
    let room = await Room.findOne({ where: { name: roomName } });
    if (!room) {
        room = await Room.create({ name: roomName });
        socket.broadcast.emit('room created', roomName);
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

const handleRenameRoom = async (socket, { oldName, newName }) => {
    const room = await Room.findOne({ where: { name: oldName } });
    if (room) {
        room.name = newName;
        await room.save();
        socket.broadcast.emit('room renamed', { oldName, newName });
    }
};

const handleDeleteRoom = async (socket, roomName) => {
    const room = await Room.findOne({ where: { name: roomName } });
    if (room) {
        await room.destroy();
        socket.broadcast.emit('room deleted', roomName);
    }
};

const handleSendMessage = async (socket, { roomName, message }) => {
    const room = await Room.findOne({ where: { name: roomName } });
    if (room) {
        const user = await User.findOne({ where: { username: socket.handshake.query.username } });
        const newMessage = await Message.create({
            text: message,
            RoomId: room.id,
            UserId: user.id,
            time: new Date()
        });
        socket.broadcast.to(roomName).emit('new message', {
            author: user.username,
            text: newMessage.text,
            time: newMessage.time
        });
    }
};
