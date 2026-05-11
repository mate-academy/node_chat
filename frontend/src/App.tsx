import { useContext, useState, useEffect } from 'react';
import { SocketContext } from "./context/SocketContext";
import { ChatWindow } from './components/ChatWindow/ChatWindow';
import { RoomList } from './components/RoomList/RoomList';
import type { Room } from './types/RoomListProps';
import type { Message } from './types/ChatWindowProps';
import { Login } from './components/Login/Login';
import './App.scss';

export const App = () => {
  const socket = useContext(SocketContext);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') || ''
  );
  const [inputValue, setInputValue] = useState('');

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      return;
    }

    socket?.emit('createRoom', {roomName: newRoomName, owner: username});
    setNewRoomName('');
  }

  const handleDeleteRoom = (roomId: number) => {
    socket?.emit('deleteRoom', roomId);
  }

  const handleRenameRoom = (roomId: number, currentName: string) => {
    const newName = window.prompt('Enter new name:', currentName);

    if (!newName || !newName.trim()) {
      return;
    }

    socket?.emit('renameRoom', {roomId, newName: newName});
  }

  const handleJoinRoom = (room: Room) => {
    setActiveRoom(room);
    socket?.emit('joinRoom', room.id);
  }

  const handleSendMessage = (newMessageText: string) => {
    if (!newMessageText) {
      return;
    }

    socket?.emit('sendMessage', {
      roomId: activeRoom?.id,
      text: newMessageText,
      author: username,
    });

    setNewMessageText('');
  }

  const handleLogin = () => {
    if (!inputValue.trim()) {
      return;
    }

    localStorage.setItem('username', inputValue);
    setUsername(inputValue);
  }

  useEffect(() => {
    if (!socket) return;

    socket.on('roomsList', (roomsFromServer: Room[]) => {
      setRooms(roomsFromServer);
    });

    socket.on('roomMessages', (messagesFromRoom: Message[]) => {
      setMessages(messagesFromRoom);
    });

    socket.on('newMessage', (newMessage: Message) => {
      setMessages((prevMess) => [...prevMess, newMessage]);
    });

    socket.on('error', (errorMessage: string) => {
      alert(errorMessage);
    });

    return () => {
      socket.off('roomsList');
      socket.off('roomMessages');
      socket.off('newMessage');
      socket.off('error');
    };
  }, [socket]);

  return (
    <div className="app-container">
      {!username ? (
        <Login
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleLogin={handleLogin}
        />
      ) : (
        <div className="messenger">
          <div className="messenger__sidebar">
            <RoomList
              handleCreateRoom={handleCreateRoom}
              handleJoinRoom={handleJoinRoom}
              handleRenameRoom={handleRenameRoom}
              handleDeleteRoom={handleDeleteRoom}
              setNewRoomName={setNewRoomName}
              newRoomName={newRoomName}
              rooms={rooms}
              username={username}
            />
          </div>

          <div className="messenger__chat-area">
            {activeRoom ? (
              <ChatWindow
                setActiveRoom={setActiveRoom}
                setNewMessageText={setNewMessageText}
                handleSendMessage={handleSendMessage}
                activeRoom={activeRoom}
                messages={messages}
                newMessageText={newMessageText}
                username={username}
              />
            ) : (
              <div className="messenger__placeholder">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
