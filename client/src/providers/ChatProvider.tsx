import { createRoom, getRooms, removeRoom } from '@/api/rooms.api';
import { ChatContext } from '@/context/ChatContext';
import { Room } from '@/types/Room';
import notification from '@/utils/notification';
import { ReactNode, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ChatProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [chats, setChats] = useState<Room[]>([]);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    getRooms()
      .then(setChats)
      .catch((err) => notification('error', err));
  }, []);

  const createChat = useCallback(
    async (name: string): Promise<void> => {
      try {
        const chat = await createRoom(name);
        setChats((state) => [...state, chat]);

        navigate(`/chat/${chat.id}`);
      } catch (err) {
        notification('error', err as string);
      }
    },
    [navigate],
  );

  const removeChat = useCallback(
    async (chatid: string) => {
      try {
        await removeRoom(chatid);

        navigate('/chat');
      } catch (err) {
        notification('error', err as string);
      }
    },
    [navigate],
  );

  const store = useMemo(() => ({ chats, createChat, removeChat }), [chats, createChat, removeChat]);

  return <ChatContext.Provider value={store}>{children}</ChatContext.Provider>;
};
