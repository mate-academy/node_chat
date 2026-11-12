import { Message } from '../models/index.js';

// GET room messages
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        roomId: req.params.id,
      },
      order: [['createdAt', 'ASC']],
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
