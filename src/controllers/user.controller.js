import { rooms, users } from '../data/chatData.js';

const createUser = (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const exists = users.find((r) => r.username === username);

  if (exists) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: Date.now(),
    username,
    roomId: null,
  };

  users.push(user);
  res.status(201).json(user);
};

const joinUser = (req, res) => {
  const userId = Number(req.params.id);
  const roomId = Number(req.body.roomId);

  const user = users.find((u) => u.id === userId);
  const room = rooms.find((r) => r.id === roomId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  user.roomId = roomId;

  res.json({
    message: `${user.username} joined ${room.name}`,
    user,
  });
};

export const userController = {
  createUser,
  joinUser,
};
