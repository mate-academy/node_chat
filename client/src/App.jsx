import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { AppHeader } from './components/AppHeader';
import { ConnectionNotices } from './components/ConnectionNotices';
import { Conversation } from './components/Conversation';
import { RoomSidebar } from './components/RoomSidebar';
import { UsernameForm } from './components/UsernameForm';
import { useChatSocket } from './hooks/WebSocket';

const USERNAME_KEY = 'chat-username';

function getRoomId(room) {
  return String(room.id ?? room.name);
}

function normalizeRoom(room) {
  if (typeof room === 'string') {
    return { id: room, name: room };
  }

  return {
    ...room,
    id: getRoomId(room),
    name: String(room.name ?? room.id),
  };
}

function normalizeMessage(message) {
  return {
    ...message,
    author: String(message.author ?? message.username ?? 'Unknown'),
    time: message.time ?? message.timestamp ?? new Date().toISOString(),
    text: String(message.text ?? ''),
  };
}

export function App() {
  const [username, setUsername] = useState(
    () => window.localStorage.getItem(USERNAME_KEY) || '',
  );
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const usernameRef = useRef(username);
  const sendRef = useRef(null);

  usernameRef.current = username;

  const sendThroughSocket = useCallback((data) => {
    if (!sendRef.current) {
      throw new Error('Not connected to the chat server.');
    }

    sendRef.current(data);
  }, []);

  const handleServerMessage = useCallback((event) => {
    const data = typeof event.data === 'string'
      ? JSON.parse(event.data)
      : event.data;

    switch (data.type) {
      case 'rooms':
        setRooms(Array.isArray(data.rooms) ? data.rooms.map(normalizeRoom) : []);
        break;
      case 'room_created': {
        const room = normalizeRoom(data.room);

        setRooms(current => [
          ...current.filter(item => item.id !== room.id),
          room,
        ]);
        break;
      }
      case 'room_renamed': {
        const room = normalizeRoom(data.room);

        setRooms(current => current.map(item => (
          item.id === room.id ? room : item
        )));
        break;
      }
      case 'room_deleted':
        setRooms(current => current.filter(
          room => room.id !== String(data.roomId),
        ));
        setActiveRoomId(current => (
          current === String(data.roomId) ? null : current
        ));
        if (activeRoomId === String(data.roomId)) {
          setMessages([]);
        }
        break;
      case 'room_joined': {
        const room = normalizeRoom(data.room);

        setRooms(current => (
          current.some(item => item.id === room.id)
            ? current.map(item => item.id === room.id ? room : item)
            : [...current, room]
        ));
        setActiveRoomId(room.id);
        setMessages((data.messages || room.messages || []).map(normalizeMessage));
        break;
      }
      case 'history':
        setMessages((data.messages || []).map(normalizeMessage));
        break;
      case 'message': {
        const message = normalizeMessage(data.message);
        const messageRoomId = String(data.roomId ?? message.roomId ?? '');

        if (messageRoomId === activeRoomId) {
          setMessages(current => [...current, message]);
        }
        break;
      }
      case 'error':
        setError(data.message || 'The server rejected the request.');
        break;
      default:
        setError(`Unsupported server event: ${data.type || 'unknown'}`);
    }
  }, [activeRoomId]);

  const handleSocketError = useCallback((message) => {
    setError(message);
  }, []);

  const handleSocketOpen = useCallback(() => {
    setError('');
    if (usernameRef.current) {
      try {
        sendThroughSocket({ type: 'set_username', username: usernameRef.current });
        sendThroughSocket({ type: 'list_rooms' });
      } catch (sendError) {
        setError(sendError.message);
      }
    }
  }, [sendThroughSocket]);

  const {
    status: connectionStatus,
    send,
    reconnect,
  } = useChatSocket({
    onMessage: handleServerMessage,
    onError: handleSocketError,
    onOpen: handleSocketOpen,
  });
  sendRef.current = send;

  useEffect(() => {
    if (connectionStatus === 'connected' && username) {
      setError('');
    }
  }, [connectionStatus, username]);

  function submitUsername(value) {
    const nextUsername = value.trim();

    if (!nextUsername) {
      setError('Enter a username to join the chat.');
      return false;
    }

    try {
      send({ type: 'set_username', username: nextUsername });
      window.localStorage.setItem(USERNAME_KEY, nextUsername);
      usernameRef.current = nextUsername;
      setUsername(nextUsername);
      send({ type: 'list_rooms' });
      setError('');
      return true;
    } catch (sendError) {
      setError(sendError.message);
      return false;
    }
  }

  function changeUsername() {
    window.localStorage.removeItem(USERNAME_KEY);
    usernameRef.current = '';
    setUsername('');
    setRooms([]);
    setMessages([]);
    setActiveRoomId(null);
  }

  function createRoom(name) {
    try {
      send({ type: 'create_room', name });
      setError('');
      return true;
    } catch (sendError) {
      setError(sendError.message);
      return false;
    }
  }

  function joinRoom(roomId) {
    try {
      send({ type: 'join_room', roomId });
      setError('');
    } catch (sendError) {
      setError(sendError.message);
    }
  }

  function renameRoom(roomId, name) {
    try {
      send({ type: 'rename_room', roomId, name });
      setError('');
      return true;
    } catch (sendError) {
      setError(sendError.message);
      return false;
    }
  }

  function deleteRoom(roomId) {
    try {
      send({ type: 'delete_room', roomId });
      setError('');
    } catch (sendError) {
      setError(sendError.message);
    }
  }

  function sendChatMessage(text) {
    if (!activeRoomId) {
      return;
    }

    try {
      send({ type: 'send_message', roomId: activeRoomId, text });
      setError('');
    } catch (sendError) {
      setError(sendError.message);
      throw sendError;
    }
  }

  const activeRoom = rooms.find(room => room.id === activeRoomId);

  return (
    <main className="chat-app">
      <AppHeader connectionStatus={connectionStatus} />
      <ConnectionNotices
        error={error}
        connectionStatus={connectionStatus}
        onDismissError={() => setError('')}
        onReconnect={reconnect}
      />
      {!username ? (
        <UsernameForm
          connectionStatus={connectionStatus}
          onSubmit={submitUsername}
        />
      ) : (
        <div className="workspace">
          <RoomSidebar
            username={username}
            rooms={rooms}
            activeRoomId={activeRoomId}
            connectionStatus={connectionStatus}
            onChangeUsername={changeUsername}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onRenameRoom={renameRoom}
            onDeleteRoom={deleteRoom}
          />
          <Conversation
            room={activeRoom}
            messages={messages}
            disabled={connectionStatus !== 'connected'}
            onSendMessage={sendChatMessage}
          />
        </div>
      )}
    </main>
  );
}
