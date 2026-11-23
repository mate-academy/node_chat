import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCurrentRoom, clearCurrentRoom } from '../store/slices/currentRoomSlice';
import { setMessages, addMessage, clearMessages } from '../store/slices/messagesSlice';
import { setRooms } from '../store/slices/roomsSlice';
import type { Message } from '../types/message';
import type { Room } from '../types/room';
import type { WebSocketClient } from '../types/socket';
import { WebSocketContext } from './WebSocketContext';

interface Props {
  username: string;
  children: ReactNode;
}

interface ServerMessage {
  type: string;
  rooms?: Room[];
  room?: Room & { messages?: Message[] };
  message?: Message;
  roomId?: string;
}


export const WebSocketProvider = ({username, children}: Props) => {
  const [socket, setSocket] = useState<WebSocketClient | null>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const ws: WebSocketClient = Object.assign(
      new WebSocket('ws://localhost:3000'),
      {
        user: {
          name: username.trim(),
          roomId: null,
        },
      },
    );

    ws.onopen = () => {
      ws.send(JSON.stringify(ws.user));
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerMessage;

      switch (data.type) {
        case 'ROOMS_LIST':
          if (data.rooms) {
            dispatch(setRooms(data.rooms));
          }
          break;

        case 'JOINED_ROOM':
          if (data.room) {
            ws.user.roomId = data.room.id;

            const { messages, ...roomInfo } = data.room;

            dispatch(setCurrentRoom(roomInfo));
            dispatch(setMessages(messages ?? []));
          }
          break;

        case 'NEW_MESSAGE':
          if (data.message) {
            dispatch(addMessage(data.message));
          }
          break;

        case 'ROOM_UPDATED':
          if (data.room) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { messages, ...roomInfo } = data.room;

            dispatch(setCurrentRoom(roomInfo));
          }
          break;

        case 'ROOM_DELETED':
          ws.user.roomId = null;

          dispatch(clearCurrentRoom());
          dispatch(clearMessages());
          break;
      }
    };

    ws.onclose = () => {
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [username, dispatch]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
