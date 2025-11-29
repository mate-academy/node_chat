'use strict';

import roomService from '../services/roomService.js';
import { broadcast } from '../wsServer.js';

// Get all users
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAll();

    res.status(200).json(rooms);
  } catch (error) {
    // console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
};

// Get user by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await roomService.getById(id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    // console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch room' });
  }
};

// Create new user
export const createRoom = async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Bad request' });
    }

    const newRoom = await roomService.create(req.body);
broadcast('roomCreated', newRoom);
    res.status(201).json(newRoom);
  } catch (error) {
    // console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create room' });
  }
};

// Update existing user
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists before trying to update
    const room = await roomService.getById(id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // If user exists, update the user and return a success message
    await roomService.update({ id, ...req.body });
broadcast('roomUpdated', { id, ...req.body });
    res.status(200).json({ message: 'Room updated successfully' });
  } catch (error) {
    // console.error('Error updating user:', error);
    res.status(400).json({ message: 'Failed to update room' });
    console.log(err);
  }
};

// Delete user
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await roomService.remove(id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
broadcast('roomDeleted', { id });
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    // console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete room' });
  }
};

export default {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
