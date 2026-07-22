import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Room } from "../utils/types";
import { useAuth } from "./authContext";
import { clientApi } from "../api/clientApi";

type RoomMessageContextType = {
  currentRoom: Room | null;
  setCurrentRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  rooms: Room[];
};

const RoomMessageContext = createContext<RoomMessageContextType | null>(null);

export function RoomMessageProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let socket: WebSocket | null = null;

    if (user) {
      socket = new WebSocket(`ws://localhost:3005?userId=${user.id}`);
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "room:delete":
            setRooms((prev) =>
              prev.filter((item) => item.id !== message.payload)
            );
            break;

          case "room:post":
            setRooms((prev) => [...prev, message.payload]);
            break;

          case "room:rename":
            setRooms((prev) =>
              prev.map((room) =>
                room.id === message.payload.id
                  ? { ...room, name: message.payload.name }
                  : room
              )
            );

            break;

          case "room:addMember":
            setRooms((prev) => {
              if (prev.find((item) => item.id === message.payload.id)) {
                return prev.map((room) =>
                  room.id === message.payload.id
                    ? { ...room, usersId: message.payload.usersId }
                    : room
                );
              }
              return [...prev, message.payload];
            });
            break;

          case "room:deleteMember":
            setRooms((prev) => {
              
              const updatedRooms = prev.map((room) => {
                return room.id === message.payload.id
                  ? { ...room, usersId: message.payload.usersId as string[] }
                  : room;
              });
              return updatedRooms.filter((room) => {
                return (
                  room.ownerId === user.id || room.usersId.includes(user.id)
                );
              });
            });

            break;
        }
      });

      clientApi.getRooms().then((res) => {
        const rooms = res.data;
        setRooms(rooms);
      });
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user]);

  return (
    <RoomMessageContext.Provider value={{ rooms, currentRoom, setCurrentRoom }}>
      {children}
    </RoomMessageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRoomMessage() {
  const context = useContext(RoomMessageContext);

  if (!context) {
    throw new Error("useRoom must be used within RoomProvider");
  }

  return context;
}

