import { useCallback, useEffect, useRef, useState } from 'react';
import { Rooms } from './Rooms';
import { socket } from '../api/socket';
import { Chat } from './Chat';
import type { Message } from '../types/Message';
import { RoomOptions } from './RoomOptions';

interface Props {
  username: string;
}

export const Messenger: React.FC<Props> = ({ username }) => {
  const [rooms, setRooms] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentHistory, setCurrentHistory] = useState<Message[]>([]);

  const currentRoomRef = useRef<string | null>(null);

  useEffect(() => {
    socket.emit('GetMyRooms');

    const handleRoomsList = (myRooms: string[]) => {
      setRooms(myRooms);
    };

    const handleRoomHistory = ({
      room,
      history,
    }: {
      room: string;
      history: Message[];
    }) => {
      if (currentRoomRef.current === room) {
        setCurrentHistory(history);
      }
    };

    const handleNewMessage = (message: Message) => {
      if (currentRoomRef.current === message.room) {
        setCurrentHistory((curHistory) => [...curHistory, message]);
      }
    };

    socket.on('MyRoomsList', handleRoomsList);
    socket.on('RoomHistory', handleRoomHistory);
    socket.on('NewMessage', handleNewMessage);

    return () => {
      socket.off('MyRoomsList', handleRoomsList);
      socket.off('RoomHistory', handleRoomHistory);
      socket.off('NewMessage', handleNewMessage);
    };
  }, []);

  const onRoomSelect = useCallback((room: string) => {
    setCurrentRoom(room);
    setCurrentHistory([]);
    currentRoomRef.current = room;

    socket.emit('GetRoomHistory', { room });
  }, []);

  const onAddRoom = useCallback((room: string) => {
    if (!room.trim()) {
      return;
    }

    socket.emit('JoinToRoom', { room });
    socket.emit('GetRoomHistory', { room });

    setRooms((currentRooms) => {
      if (currentRooms.includes(room)) {
        return currentRooms;
      }
      return [...currentRooms, room];
    });

    setCurrentRoom(room);
    currentRoomRef.current = room;
    setCurrentHistory([]);
  }, []);

  const onDeleteRoom = useCallback((roomToDelete: string) => {
    socket.emit('DeleteRoom', { room: roomToDelete });

    setRooms((currentRooms) =>
      currentRooms.filter((room) => room !== roomToDelete),
    );

    if (currentRoomRef.current === roomToDelete) {
      setCurrentRoom(null);
      currentRoomRef.current = null;
      setCurrentHistory([]);
    }
  }, []);

  const onRenameRoom = useCallback(
    (name: string, newName: string) => {
      if (!newName.trim() || newName === name || rooms.includes(newName)) {
        return;
      }

      socket.emit('RenameRoom', { room: name, newRoom: newName });

      setRooms((currentRooms) =>
        currentRooms.map((room) => (room === name ? newName : name)),
      );

      if (currentRoomRef.current === name) {
        setCurrentRoom(newName);
        currentRoomRef.current = newName;
      }
    },
    [rooms],
  );

  const onAddUserToRoom = useCallback(
    (room: string, username: string) => {
      if (!username.trim() || !rooms.includes(room)) {
        return;
      }

      socket.emit('RequestToRoom', { room, targetUsername: username });
    },
    [rooms],
  );

  const onSendMessage = useCallback(
    (text: string) => {
      if (!currentRoom || !text.trim()) return;

      socket.emit('SendMessage', { room: currentRoom, text });
    },
    [currentRoom],
  );

  return (
    <div className="h-full w-full grid grid-cols-[300px_1fr] grid-rows-[auto_1fr] main-color ">
      <div className="col-start-1 col-end-2 row-start-1 row-end-2 p-3 border-b secondary-color">
        <h2 className="text-sm font-bold truncate">{username}</h2>
      </div>

      <Rooms
        className={
          'overflow-y-auto flex flex-col col-start-1 col-end-2 row-start-2 row-end-3 secondary-color'
        }
        onAddRoom={onAddRoom}
        currentRoom={currentRoom}
        rooms={rooms}
        onRoomSelect={onRoomSelect}
      />

      {currentRoom ? (
        <>
          <div className=" w-full flex justify-between col-start-2 col-end-3 row-start-1 row-end-2 p-3 border-l secondary-color">
            <h2 className="text-sm font-bold truncate">{currentRoom}</h2>

            <RoomOptions
              onDeleteRoom={onDeleteRoom}
              currentRoom={currentRoom}
              onRenameRoom={onRenameRoom}
              onAddUserToRoom={onAddUserToRoom}
            />
          </div>

          <Chat
            className={'col-start-2 col-end-3 row-start-2 row-end-3 main-color'}
            currentHistory={currentHistory}
            onSendMessage={onSendMessage}
            username={username}
          />
        </>
      ) : (
        <div className="col-start-2 col-end-3 row-start-1 row-end-3 flex items-center justify-center">
          <h2 className="text-sm font-bold truncate leading-none elements-color rounded-2xl px-3 py-1.5">
            Select a chat to start messaging
          </h2>
        </div>
      )}
    </div>
  );
};
