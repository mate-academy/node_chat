import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Message, Room } from '../types/types';
// @ts-ignore
import './App.scss';
import { io } from 'socket.io-client';

const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '3006';
const socket = io(`http://localhost:${BACKEND_PORT}`)

export const App = () => {
  const [userName, setUserName] = useState(localStorage.getItem('username') || '');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempUserName, setTempUserName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [currentMsg, setCurrentMsg] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string>('');
  const [editingRoomName, setEditingRoomName] = useState<string>('');

  useEffect(() => {
    socket.on('update_rooms', (updatedRooms: Room[]) => {
      setRooms(updatedRooms)
    })

    socket.on('receive_message', (newMsg: Message) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on('room_history', (history: Message[]) => {
      setMessages(history);
    });

    return () => {
      socket.off('update_rooms');
      socket.off('receive_message');
      socket.off('room_history');
    };
  } ,[])

  useEffect(() => {
    if (activeRoom) {
      socket.emit('join', activeRoom);
    }
  }, [activeRoom]);

  const handleLogin = () => {
    if (tempUserName.trim()) {
      setUserName(tempUserName);
      localStorage.setItem('username', tempUserName);
    }
  };

  const createRoom = () => {
    if (newRoomName.trim()) {
      const newRoom: Room = {
        id: Date.now().toString(),
        name: newRoomName
      };
      socket.emit('create', newRoom)
      setNewRoomName('');
      setIsModalOpen(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMsg.trim() && activeRoom) {
      const newMessage: Message = {
        author: userName,
        text: currentMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roomId: activeRoom
      };
      socket.emit('send_message', newMessage);
      setCurrentMsg('');
    }
  };

  const startRename = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRoomId(id);
    setEditingRoomName(name);
  };


  const saveRoomName = () => {
    if (editingRoomName.trim() && editingRoomId) {
      socket.emit('rename', editingRoomId, editingRoomName.trim());
      cancelRename();
    }
  };


  const cancelRename = () => {
    setEditingRoomId('');
    setEditingRoomName('');
  };

  const deleteRoom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Ви впевнені, що хочете видалити кімнату?')) {
      socket.emit('delete', id);
      if (activeRoom === id) {
        setActiveRoom('');
      }
    }
  };

  return (
    <div className="chat-app">
      {!userName && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <h2>Введіть ім'я</h2>
            <input
              type="text"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Ваш нікнейм..."
            />
            <button onClick={handleLogin}>Увійти</button>
          </div>
        </div>,
        document.body
      )}
      <aside className="sidebar">
        <div className="sidebar__header">
          <h3>Кімнати</h3>
          <button onClick={() => setIsModalOpen(true)}>+</button>
        </div>
        <div className="room-list">
          {rooms.map(room => {
            const isEditing = editingRoomId === room.id;
            return (
              <div
                key={room.id}
                onClick={() => !isEditing && setActiveRoom(room.id)}
                className={`room-item ${activeRoom === room.id ? 'active' : ''}`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editingRoomName}
                    onChange={(e) => setEditingRoomName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRoomName();
                      if (e.key === 'Escape') cancelRename();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="room-rename-input"
                  />
                ) : (
                  <span># {room.name}</span>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  {isEditing ? (
                    <>
                      <button onClick={saveRoomName}>✓</button>
                      <button onClick={cancelRename}>✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => startRename(room.id, room.name, e)}>✎</button>
                      <button onClick={(e) => deleteRoom(room.id, e)}>×</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
      <main className="chat-main">
        {activeRoom ? (
          <>
            <div className="messages-list">
              {messages.filter(m => m.roomId === activeRoom).map((m, i) => (
                <div key={i} className={`message ${m.author === userName ? 'own' : ''}`}>
                  <div className="message__info">
                    <span className="author">{m.author}</span>
                    <span className="time">{m.time}</span>
                  </div>
                  <div className="message__text">{m.text}</div>
                </div>
              ))}
            </div>
            <form className="message-form" onSubmit={handleSendMessage}>
              <input
                value={currentMsg}
                onChange={(e) => setCurrentMsg(e.target.value)}
                placeholder="Напишіть повідомлення..."
              />
              <button type="submit">Відправити</button>
            </form>
          </>
        ) : (
          <div className="empty-state">Оберіть кімнату, щоб почати чат</div>
        )}
      </main>

      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <h3>Нова кімната</h3>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Назва кімнати..."
              onKeyDown={(e) => e.key === 'Enter' && createRoom()}
              autoFocus
            />
            <button onClick={createRoom}>Створити</button>
            <button onClick={() => setIsModalOpen(false)}>Скасувати</button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
