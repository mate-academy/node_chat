import { useContext, useState, createContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';

const BASE_URL = import.meta.env.VITE_API_URL;

export const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [rooms, setRooms] = useState([]);
  const [joinedChatIds, setJoinedChatIds] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const response = await api.get(`${BASE_URL}/user`);

    setUser(response.data);

    return response.data;
  };

  const handleLogin = async (userName) => {
    try {
      const user = await api.post(`${BASE_URL}/login`, {
        userName,
      });

      setUser(user.data);

      navigate('/rooms');

      console.log('Login successful:', user.data);
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get(`${BASE_URL}/rooms`);
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const fetchJoinedRooms = async () => {
    const userData = await getUser();

    if (!userData.id) {
      console.log('User id is not valid', user.id);
    }

    const res = await api.get(`${BASE_URL}/rooms/${userData.id}`);
    // const data = await res.json();
    setJoinedChatIds(res.data);
  };

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        rooms,
        joinedChatIds,
        selectedRoom,
        handleLogin,
        fetchRooms,
        fetchJoinedRooms,
        handleRoomSelect,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error('useChatContext must be used within AppProvider');
  return context;
};
