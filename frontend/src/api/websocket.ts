import { Message } from '../types/Message';
import { Room } from '../types/Room';

export type WebSocketEvent =
  | {
      type: 'addMessage';
      payload: Message;
    }
  | {
      type: 'deleteMessage';
      payload: Message;
    }
  | {
      type: 'updateMessage';
      payload: Message;
    }
  | {
      type: 'addRoom';
      payload: Room;
    }
  | {
      type: 'deleteRoom';
      payload: Room;
    }
  | {
      type: 'updateRoom';
      payload: Room;
    };

export function connectSocket(
  roomId: string,
  onMessage: (data: WebSocketEvent) => void,
) {
  const socket = new WebSocket('ws://localhost:3000');

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        type: 'joinRoom',
        roomId,
      }),
    );
  };

  socket.onmessage = (event) => {
    const data: WebSocketEvent = JSON.parse(event.data);

    onMessage(data);
  };

  return () => {
    socket.close();
  };
}

export function connectRoomsSocket(
  userId: string,
  onMessage: (data: WebSocketEvent) => void,
) {
  const socket = new WebSocket('ws://localhost:3000');

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        type: 'subscribeRooms',
        userId,
      }),
    );
  };

  socket.onmessage = (event) => {
    const data: WebSocketEvent = JSON.parse(event.data);

    onMessage(data);
  };

  return () => {
    socket.close();
  };
}
