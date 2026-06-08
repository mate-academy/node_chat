import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import type { User, Room, Message } from '../../types';

const COVERS = [
  { path: '/covers/cover1.jpg', name: 'Street' },
  { path: '/covers/cover2.jpg', name: 'Koi Lake' },
  { path: '/covers/cover3.jpg', name: 'Sakura' },
];

interface ChatScreenProps {
  socket: Socket;
  user: User;
  room: Room;
  onLeave: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ socket, user, room, onLeave }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [usersCount, setUsersCount] = useState<number>(1);
  const [messageText, setMessageText] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [editName, setEditName] = useState<string>(room.name);
  const [editCover, setEditCover] = useState<string>(room.cover);
  const [roomData, setRoomData] = useState({ name: room.name, cover: room.cover });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isOwner = room.creator === user.username;

  useEffect(() => {
    socket.emit('join:room', {
      roomId: room.id,
      username: user.username,
      avatar: user.avatar
    });

    socket.on('room:history', (history: Message[]) => setMessages(history));
    socket.on('room:users_count', (count: number) => setUsersCount(count));
    socket.on('receive:message', (msg: Message) => setMessages(prev => [...prev, msg]));

    socket.on('room:updated', ({ name, cover }: { name: string; cover: string }) => {
      setRoomData({ name, cover });
    });

    socket.on('room:deleted', () => {
      alert('This room was deleted by creator.');
      onLeave();
    });

    return () => {
      socket.off('room:history');
      socket.off('room:users_count');
      socket.off('receive:message');
      socket.off('room:updated');
      socket.off('room:deleted');
    };
  }, [room.id, socket, user.username, user.avatar, onLeave]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    socket.emit('send:message', { text: messageText.trim() });
    setMessageText('');
  };

  const handleSaveSettings = () => {
    socket.emit('edit:room', {
      roomId: room.id,
      newName: editName.trim(),
      newCover: editCover,
      username: user.username
    });
    setShowSettings(false);
  };

  const handleDeleteRoom = () => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      socket.emit('delete:room', { roomId: room.id, username: user.username });
    }
  };

  return (
    <div className="screen box-retro">
      <div className="chat-header">
        <div className="room-info">
          <img src={roomData.cover} alt="Room Cover" className="room-avatar-img" />
          <div>
            <h3>{roomData.name}</h3>
            <span className="players-count">Users: {usersCount}</span>
          </div>
        </div>
        <div className="header-actions">
          {isOwner && (
            <button className="btn-retro small" onClick={() => setShowSettings(!showSettings)}>⚙️</button>
          )}
          <button className="btn-retro small error" onClick={onLeave}>EXIT</button>
        </div>
      </div>

      {showSettings && isOwner && (
        <div className="box-retro-inner settings-panel">
          <h4>ROOM SETTINGS</h4>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Rename room..."
          />
          <select
            value={editCover}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditCover(e.target.value)}
          >
            {COVERS.map(c => (
              <option key={c.path} value={c.path}>{c.name}</option>
            ))}
          </select>
          <div className="settings-buttons">
            <button className="btn-retro small action" onClick={handleSaveSettings}>SAVE</button>
            <button className="btn-retro small error" onClick={handleDeleteRoom}>DELETE ROOM</button>
          </div>
        </div>
      )}

      <div className="messages-area pixel-scroll">
        {messages.map((msg) => {
          const isOwn = msg.author === user.username;

          return (
            <div key={msg.id} className={`msg-wrapper ${isOwn ? 'own-message' : 'other-message'}`}>
              <div className="msg-block">
                <div className="msg-meta">
                  <img src={msg.avatar} alt="" className="msg-avatar-img" />
                  {msg.author} <span className="msg-time">{msg.time}</span>
                </div>
                <div className="msg-text">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-area">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type message..."
          autoComplete="off"
        />
        <button type="submit" className="btn-retro">SEND</button>
      </form>
    </div>
  );
};

export default ChatScreen;
