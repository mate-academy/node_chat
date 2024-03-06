import * as R from 'react';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { Room } from 'types/Room.type';
import { MessageAction, Message } from 'types/Message.type';
import * as messageApi from 'api/message.api';

export const AppContext = R.createContext<{
  user: string,
  setUser: (newV: string) => void,
  room: Room | null,
  setRoom: R.Dispatch<R.SetStateAction<Room>>,
  socket: WebSocket | null,
  setSocket: R.Dispatch<R.SetStateAction<WebSocket>>,
  messageSend: (action: MessageAction, text: string) => Promise<Message>,
}>({
  user: '',
  setUser: () => { },
  room: null,
  setRoom: () => { },
  socket: null,
  setSocket: () => { },
  messageSend: () => new Promise<Message>(() => { }),
});

type Props = {
  children: R.ReactNode;
};

export const AppProvider: R.FC<Props> = ({
  children,
}) => {
  const [user, setUser] = useLocalStorage('userLogin', '');
  const [room, setRoom] = R.useState<Room | null>(null);
  const [socket, setSocket] = R.useState<WebSocket | null>(null);

  const messageSend = (action: MessageAction, text: string) => {
    if (!room || !user) {
      throw new Error('cant send message')
    }

    return messageApi.create({ author: user, text, roomId: room.id });
  };

  const value = R.useMemo(() => ({
    user,
    setUser,
    room,
    setRoom,
    socket,
    setSocket,
    messageSend,
  }), [user, room, socket]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
