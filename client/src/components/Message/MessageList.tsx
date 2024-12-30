import { getMessages } from '@/api/messages.api';
import { Message } from '@/types/Message';
import notification from '@/utils/notification';
import { List } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { MessageItem } from './MessageItem';
import { useMessageSocket } from '@/hooks/useMessageSocket';

interface Props {
  roomId: string;
}

export const MessageList: FC<Props> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useMessageSocket(roomId, setMessages);

  useEffect(() => {
    getMessages(roomId)
      .then((fetchedMessages) => {
        setMessages(fetchedMessages);
      })
      .catch((err) => notification('error', err.message));
  }, [roomId]);

  return (
    <List style={{ display: 'flex', flexDirection: 'column' }}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </List>
  );
};
