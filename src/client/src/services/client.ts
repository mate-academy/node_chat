import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

export const client = {
  getAllRooms: async () => {
    try {
      const response = await api.get('/room');

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createRoom: async (nameRoom: string) => {
    try {
      const response = await api.post('/room/create', { nameRoom });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRoom: async (roomId: string, newName: string) => {
    try {
      const response = await api.patch('/room/rename', { roomId, newName });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteRoom: async (roomId: string) => {
    await api.delete(`/room/${roomId}`);
  },

  createUser: async (userName: string) => {
    try {
      const response = await api.post('/user/register', { userName });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  loginUser: async (userName: string) => {
    try {
      const response = await api.post('/user/login', { userName });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  joinRoom: async (roomId: string, userId: string) => {
    try {
      const response = await api.patch('/room/join', { roomId, userId });

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
