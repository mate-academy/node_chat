import { useEffect, useState } from 'react';
import { api } from '../api';
import { socket } from '../socket';
import type { Room } from '../types';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const load = () => {
      api.getRooms().then(setRooms).catch(console.error);
    };

    const handleCreated = (room: Room) => {
      setRooms((prev) =>
        prev.some((r) => r.id === room.id) ? prev : [...prev, room],
      );
    };

    const handleRenamed = (room: Room) => {
      setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));
    };

    const handleDeleted = ({ id }: { id: string }) => {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    };

    load();

    socket.on('connect', load);
    socket.on('room_created', handleCreated);
    socket.on('room_renamed', handleRenamed);
    socket.on('room_deleted', handleDeleted);

    return () => {
      socket.off('connect', load);
      socket.off('room_created', handleCreated);
      socket.off('room_renamed', handleRenamed);
      socket.off('room_deleted', handleDeleted);
    };
  }, []);

  return rooms;
}
