import { useEffect, useState } from 'react';
import { RoomCard } from './RoomCard';
import Chat from '../services/web-chat';
import type { Page } from '../App';

export interface IRoom {
  id: number;
  name: string;
}

type Props = {
  onPage: (page: Page) => void;
  onSetId: (id: string) => void;
};

export default function Room({ onPage, onSetId }: Props) {
  const [roomName, setRoomName] = useState('');
  const [room, setRoom] = useState<IRoom[] | []>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!roomName.trim()) return;
    await Chat.createRoom(roomName);
    const { data } = await Chat.getRooms();
    setRoom(data);
    setRoomName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      return;
    }
    await Chat.removeRoom(id);
    const { data } = await Chat.getRooms();
    setRoom(data);
  };

  const handleRename = async (id: string, name: string) => {
    if (!id) return;
    if (!name) return;

    await Chat.renameRoom(name, id);
    const { data } = await Chat.getRooms();
    setRoom(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data } = await Chat.getRooms();

        setRoom(data);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-white">Create Room</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Room name..."
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <button
          onClick={handleSubmit}
          disabled={!roomName.trim()}
          className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-40"
        >
          Create
        </button>
      </div>

      <div className="mt-10 flex gap-5">
        {isLoading && <p>loading...</p>}

        {!room.length && !isLoading ? (
          <p>Empty. Please Create your Room and join!</p>
        ) : (
          room.map((r) => {
            return (
              <RoomCard
                key={r.id}
                id={r.id.toString()}
                name={r.name}
                membersCount={0}
                onJoin={(id) => {
                  onSetId(id.toString());
                  onPage('chat');
                }}
                onDelete={(id) => handleDelete(id || r.id.toString())}
                onRename={(id, newName) => handleRename(id.toString(), newName)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
