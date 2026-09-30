/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

export function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('chat_username') || ''
  );
  const [isUsernameSet, setIsUsernameSet] = useState(
    () => !!localStorage.getItem('chat_username')
  );
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputUsername, setInputUsername] = useState('');
  const [messageText, setMessageText] = useState('');
  const [newRoomName, setNewRoomName] = useState('');

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000');
    socketRef.current = socket;

    socket.onopen = () => {
      const savedUser = localStorage.getItem('chat_username');
      if (savedUser) {
        socket.send(
          JSON.stringify({ type: 'SET_USERNAME', username: savedUser })
        );
      }
    };

    socket.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'ROOMS_UPDATE') {
        setRooms(data.rooms);
      } else if (data.type === 'ROOM_JOINED') {
        setCurrentRoom({ id: data.roomId, name: data.roomName });
        setMessages(data.messages);
      } else if (data.type === 'ROOM_RENAMED') {
        setCurrentRoom((prev) =>
          prev && prev.id === data.roomId ? { ...prev, name: data.newName } : prev
        );
      } else if (data.type === 'ROOM_DELETED') {
        setCurrentRoom((prev) => (prev && prev.id === data.roomId ? null : prev));
        setMessages([]);
        alert('Кімнату видалено');
      } else if (data.type === 'NEW_MESSAGE') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    return () => socket.close();
  }, []);

  const handleSaveUsername = (e) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;
    localStorage.setItem('chat_username', inputUsername);
    setUsername(inputUsername);
    setIsUsernameSet(true);
    socketRef.current?.send(
      JSON.stringify({ type: 'SET_USERNAME', username: inputUsername })
    );
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim() || !socketRef.current) return;
    socketRef.current.send(
      JSON.stringify({ type: 'CREATE_ROOM', name: newRoomName })
    );
    setNewRoomName('');
  };

  const handleRenameRoom = (roomId) => {
    const newName = prompt('Введіть нову назву кімнати:');
    if (newName && newName.trim() && socketRef.current) {
      socketRef.current.send(
        JSON.stringify({ type: 'RENAME_ROOM', roomId, newName })
      );
    }
  };

  const handleDeleteRoom = (roomId) => {
    if (confirm('Ви впевнені, що хочете видалити кімнату?') && socketRef.current) {
      socketRef.current.send(
        JSON.stringify({ type: 'DELETE_ROOM', roomId })
      );
    }
  };

  if (!isUsernameSet) {
    return React.createElement(
      'div',
      { style: { padding: '2rem', maxWidth: '400px', margin: '0 auto' } },
      React.createElement('h2', null, "Введіть ім'я"),
      React.createElement(
        'form',
        { onSubmit: handleSaveUsername },
        React.createElement('input', {
          type: 'text',
          value: inputUsername,
          onChange: (e) => setInputUsername(e.target.value),
          placeholder: 'Імʼя...',
          required: true,
          style: { width: '100%', padding: '8px', marginBottom: '10px' }
        }),
        React.createElement(
          'button',
          { type: 'submit', style: { width: '100%', padding: '8px' } },
          'Увійти'
        )
      )
    );
  }

  return React.createElement(
    'div',
    { style: { display: 'flex', height: '100vh', fontFamily: 'sans-serif' } },
    React.createElement(
      'aside',
      { style: { width: '280px', borderRight: '1px solid #ccc', padding: '1rem' } },
      React.createElement('h3', null, 'Користувач: ', username),
      React.createElement(
        'button',
        {
          onClick: () => {
            localStorage.removeItem('chat_username');
            setIsUsernameSet(false);
          }
        },
        'Змінити імʼя'
      ),
      React.createElement('hr', null),
      React.createElement('h4', null, 'Кімнати'),
      React.createElement(
        'form',
        { onSubmit: handleCreateRoom },
        React.createElement('input', {
          type: 'text',
          value: newRoomName,
          onChange: (e) => setNewRoomName(e.target.value),
          placeholder: 'Нова кімната',
          style: { width: '70%', padding: '4px' }
        }),
        React.createElement('button', { type: 'submit' }, '+')
      ),
      React.createElement(
        'ul',
        { style: { listStyle: 'none', padding: 0 } },
        rooms.map((room) =>
          React.createElement(
            'li',
            {
              key: room.id,
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                background: currentRoom?.id === room.id ? '#eee' : 'transparent'
              }
            },
            React.createElement(
              'span',
              {
                onClick: () => {
                  socketRef.current?.send(
                    JSON.stringify({ type: 'JOIN_ROOM', roomId: room.id })
                  );
                },
                style: { cursor: 'pointer', flexGrow: 1 }
              },
              room.name
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                {
                  onClick: () => handleRenameRoom(room.id),
                  title: 'Перейменувати'
                },
                '✏️'
              ),
              React.createElement(
                'button',
                {
                  onClick: () => handleDeleteRoom(room.id),
                  title: 'Видалити'
                },
                '🗑️'
              )
            )
          )
        )
      )
    ),
    React.createElement(
      'main',
      { style: { flexGrow: 1, padding: '1rem', display: 'flex', flexDirection: 'column' } },
      currentRoom
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement('h2', null, currentRoom.name),
            React.createElement(
              'div',
              { style: { flexGrow: 1, overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' } },
              messages.map((m) =>
                React.createElement(
                  'div',
                  { key: m.id, style: { marginBottom: '8px' } },
                  React.createElement('strong', null, m.author),
                  ' ',
                  React.createElement(
                    'small',
                    { style: { color: '#888' } },
                    m.time ? new Date(m.time).toLocaleTimeString() : ''
                  ),
                  React.createElement('div', null, m.text)
                )
              )
            ),
            React.createElement(
              'form',
              {
                onSubmit: (e) => {
                  e.preventDefault();
                  if (!messageText.trim()) return;
                  socketRef.current?.send(
                    JSON.stringify({ type: 'SEND_MESSAGE', text: messageText })
                  );
                  setMessageText('');
                },
                style: { display: 'flex', gap: '8px' }
              },
              React.createElement('input', {
                type: 'text',
                value: messageText,
                onChange: (e) => setMessageText(e.target.value),
                placeholder: 'Повідомлення...',
                style: { flexGrow: '1', padding: '8px' }
              }),
              React.createElement('button', { type: 'submit' }, 'Надіслати')
            )
          )
        : React.createElement('p', null, 'Оберіть кімнату зліва')
    )
  );
}
