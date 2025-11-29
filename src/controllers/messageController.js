'use strict';

import messageService from '../services/messageService.js';
import { broadcast } from '../wsServer.js';
// Get all expenses (with optional filters)
// export const getAllMessages = async (req, res) => {
// const { room } = req.query;

//     let filteredMessages = messages;

//     // Filter by category if provided
//     if (room) {
//       filteredMessages = filteredMessages.filter(
//         (m) => m.room === room,
//       );
//     }

//     res.json(filteredMessages);
//   };

// export const getAllMessages = async (req, res) => {
//   const { room } = req.query; // Extract filters from request

//   try {
//     const messages = await messageService.getAll(room); // Pass filters directly to the service
//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch messages' });
//   }
// };

export const getAllMessages = async (req, res) => {
  const { room } = req.query;
  try {
    const messages = await messageService.getAll({ room }); // Pass filters directly to the service
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Get a single expense by ID
export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await messageService.getById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json(message);
  } catch (error) {
    // console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
};

// Create a new expense
//
export const createMessage = async (req, res) => {
  try {
    const { text, author, room } = req.body;

    if (!text || !author || !room) {
      return res.status(400).json({ message: 'Bad request' });
    }

    const newMessage = await messageService.create(req.body);
    broadcast('messageCreated', newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    // console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create message' });
  }
};

// Update an existing expense (supports both PUT & PATCH)
export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await messageService.update({ id, ...req.body });

    if (updated[0] === 0) {
      // Sequelize returns [0] if no rows were updated
      return res.status(404).json({ message: 'Message not found' });
    }
broadcast('messageUpdated', { id, ...req.body });
    res.status(200).json({ message: 'Message updated successfully' });
  } catch (error) {
    // console.error('Error updating expense:', error);
    res.status(400).json({ message: 'Failed to update message' });
  }
};

// Delete an expense
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await messageService.remove(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
broadcast('messageDeleted', { id });
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    // console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

export default {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};
