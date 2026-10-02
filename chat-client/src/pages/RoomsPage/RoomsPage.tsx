import { useEffect, useState } from 'react';
import type { Room } from '../../types/room';
import './RoomsPage.scss';
import { RoomsList } from '../../components/RoomList/RoomsList';
import { CreateRoomModal } from '../../modal/CreateRoom/CreateRoom.modal';
import { sendMessage, ws } from '../../api/socket';

type Props = {
  name: string;
  clearName: () => void;
};



export const RoomsPage = ({ name, clearName }: Props) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === 'error') {
        return alert(data.error)
      }

      if (data.type === 'rooms') {
        setRooms(data.rooms)
        setIsLoading(false);
      }

    }
    ws.addEventListener('message', handleMessage);
    sendMessage({ type: 'getRooms' });

    return () => ws.removeEventListener('message', handleMessage);
  }, []);

  function handleDeleteRoom(roomId: string) {
    sendMessage({ type: 'removeRoom', roomId, owner: name })
  }

  function handleCreateRoom(roomName: string) {
    sendMessage({ type: 'createRoom', name: roomName, owner: name })

    setIsCreateModalOpen(false);
  }

  function handleRenameRoom(roomId: string, newName: string) {
    sendMessage({ type: 'renameRoom', roomId, newName, owner: name })
  }


  if (isLoading) {
    return <p className="roomsPage__loading">Loading rooms...</p>;
  }


  return (
    <div className="roomsPage">
      <h1 className="roomsPage__title">Rooms Page</h1>
      <p className="roomsPage__name">Welcome, {name}!</p>
      <div className="roomsPage__buttons">
        <button className="roomsPage__button" onClick={clearName}>
          Change Name
        </button>
        <button className="roomsPage__button" onClick={() => setIsCreateModalOpen(true)}>
          Create Room
        </button>
      </div>

      <RoomsList rooms={rooms} name={name} onDeleteRoom={handleDeleteRoom} onRenameRoom={handleRenameRoom} />

      {isCreateModalOpen && (
        <CreateRoomModal
          onCreateRoom={handleCreateRoom}
          onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>

  );
};
