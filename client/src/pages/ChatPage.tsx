import { useQuery } from '@tanstack/react-query';
import { getRoomById } from '@/api/rooms.api';
import { Chat } from '@/components/Chat/Chat';
import { Loader } from '@/components/Loader/Loader';
import { Room } from '@/types/Room';
import { useParams, Navigate } from 'react-router-dom';

const ChatPage = () => {
  const { chatid } = useParams();

  const { isLoading, error, data } = useQuery<Room, Error>({
    queryKey: ['chat', chatid],
    queryFn: () => getRoomById(chatid as string),
    enabled: !!chatid,
  });

  if (isLoading) {
    return <Loader />;
  }

  return error || !data ? <Navigate to='*' replace /> : <Chat chat={data} />;
};

export default ChatPage;
