import React, { createContext, useContext, useEffect, useState } from "react";
import type { Room } from "../types/room";
import api from "../api/axios";

interface RoomsCtx {
  rooms: Room[];
  currentRoomId: string | null;
  setCurrentRoom: (id: string | null) => void;
  createRoom: (name: string) => Promise<void>;
  renameRoom: (id: string, name: string) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
}

const RoomsContext = createContext<RoomsCtx | null>(null);

export const useRooms = () => {
  const c = useContext(RoomsContext);
  if (!c) throw new Error("useRooms must be inside RoomsProvider");
  return c;
};

export const RoomsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Room[]>("/rooms").then((res) => {
      setRooms(res.data);
      setCurrentRoomId(res.data[0]?.id ?? null);
    });
  }, []);

  const createRoom = async (name: string) => {
    const res = await api.post<Room>("/rooms", { name });
    setRooms((prev) => [...prev, res.data]);
    setCurrentRoomId(res.data.id);
  };

  const renameRoom = async (id: string, name: string) => {
    const res = await api.put<Room>(`/rooms/${id}`, { name });
    setRooms((prev) => prev.map((r) => (r.id === id ? res.data : r)));
  };

  const deleteRoom = async (id: string) => {
    await api.delete(`/rooms/${id}`);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setCurrentRoomId((prev) => (prev === id ? null : prev));
  };

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        currentRoomId,
        setCurrentRoom: setCurrentRoomId,
        createRoom,
        renameRoom,
        deleteRoom,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
};
