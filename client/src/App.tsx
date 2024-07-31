/* eslint-disable @typescript-eslint/no-unsafe-argument */
import './App.scss';
import * as Types from './types/types';
import { useEffect, useState } from 'react';
import { ManagementBlock } from './components/ManagementBlock/ManagementBlock';
import { ChatBlock } from './components/ChatBlock/ChatBlock';
import { LoginForm } from './components/LoginForm/LoginForm';
import { requestCreator } from './service/service';

export const App = () => {
  const [author, setAuthor] = useState<Types.User | null>(null);
  const [rooms, setRooms] = useState<Types.Room[]>([]);
  const [messages, setMessages] = useState<Types.Message[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Types.Room | null>(null);
  const [newNameOfRoom, setNewNameOfRoom] = useState('');
  const [roomIsChanging, setRoomIsChanging] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const authorFromStorage = localStorage.getItem('author');
    setAuthor(authorFromStorage ? JSON.parse(authorFromStorage) : null);
  }, []);
  
  useEffect(() => {
    requestCreator({
      type: Types.RequestType.FethRooms,
      actions: { setRooms },
      errorText: Types.RequestError.FethRooms,
    });
  }, [author, refresh]);

  const login = (user: Types.User) => {
    setAuthor(user);
    setSelectedRoom(null);
  };

  const logout = () => {
    setAuthor(null);
    setMessages([]);
    setSelectedRoom(null);
  };

  const handleSelectRoom = (room: Types.Room) => {
    requestCreator({
      type: Types.RequestType.RoomSelect,
      actions: { setSelectedRoom, setRefresh },
      body: { id: room.id },
      errorText: Types.RequestError.RoomSelect,
    });
  };

  return (
    <main className='aplication'>
      {!author && <LoginForm onLogin={login} />}

      <ManagementBlock
        author={author}
        selectedRoom={selectedRoom}
        rooms={rooms}
        setRooms={setRooms}
        setSelectedRoom={handleSelectRoom}
        setRoomIsChanging={setRoomIsChanging}
        setNewNameOfRoom={setNewNameOfRoom}
        setNewMessageText={setNewMessageText}
        onLogout={logout}
        setRefresh={setRefresh}
      />

      <ChatBlock
        author={author}
        messages={messages}
        setMessages={setMessages}
        selectedRoom={selectedRoom}
        roomIsChanging={roomIsChanging}
        newNameOfRoom={newNameOfRoom}
        newMessageText={newMessageText}
        setNewNameOfRoom={setNewNameOfRoom}
        setNewMessageText={setNewMessageText}
        setSelectedRoom={setSelectedRoom}
        setRoomIsChanging={setRoomIsChanging}
        setRooms={setRooms}
        setRefresh={setRefresh}
      />
    </main>
  );
}
