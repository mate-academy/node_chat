import React, { useEffect, useState } from 'react';
import './App.css';
import { MessageForm } from './components/MessageForm.js';
import { MessageList } from './components/MessageList.js';
import { Message } from './types/message';
import { UsernameSetter } from './components/UsernameSetter.js';
import { CreateRoom } from './components/CreateRoom.js';
import { Room } from './types/room.js';
import { RoomList } from './components/RoomList.js';
interface Props {
  onMessage: (data: Message) => void;
  onRooms: (data: Room[]) => void;
}

const DataLoader: React.FC<Props> = ({ onMessage, onRooms }) => {
  useEffect(() => {
    const messagesSource = new EventSource('http://localhost:3005/messages');
    messagesSource.onmessage = event => {
      const message = JSON.parse(event.data as string) as Message;
      if (Array.isArray(message)) {
        message.forEach((message: Message) => onMessage(message));
      } else {
        onMessage(message);
      } 
    };
    return () => {
      messagesSource.close();
    };
  }, []);

  useEffect(() => {
    const roomsSource = new EventSource('http://localhost:3005/rooms');
    roomsSource.onmessage = event => {
      const rooms = JSON.parse(event.data as string) as Room[];
      onRooms(rooms);
    };
    return () => roomsSource.close();
  }, []);

  return <h1 className="title">Chat application</h1>;
};

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showSettings, setShowSettings] = useState<string>('');
  const [activeRoom, setActiveRoom] = useState<string>('');

  const visibleMessages = activeRoom
    ? messages.filter(message => message.roomId === activeRoom)
    : messages;

  function saveMessage(message: Message) {
    setMessages(messages => [message, ...messages]);
  }

  function saveRoom(rooms: Room[]) {
    setRooms(rooms);
  }

  function handleUsernameSet(username: string) {
    setShowSettings(username);
  }

  return (
    <section className="section content">
      <DataLoader onMessage={saveMessage} onRooms={saveRoom} />

      <UsernameSetter onUsernameSet={handleUsernameSet} />
      {showSettings && <CreateRoom />}
      {showSettings && activeRoom && <MessageForm activeRoom={activeRoom} />}

      {showSettings && <RoomList rooms={rooms} activeRoom={activeRoom} onSelect={setActiveRoom} />}
      {showSettings && <MessageList messages={visibleMessages} /> }
    </section>
  );
}
