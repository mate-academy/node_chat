import { useEffect, useRef, useState } from 'react';
import { type Message } from '../../types/messagesResponce';
import { ChatMessage } from '../ChatMessage';
import { type User } from '../../types/userResponce';
import { useAppSelector } from '../../app/hooks';

interface MessagesBoxProps {
  messagesData: Message[];
}

export const MessagesBox = ({ messagesData }: MessagesBoxProps) => {
  const { users: storeUsers } = useAppSelector((state) => state.chatRooms);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(messagesData ?? []);
    setUsers(storeUsers);
  }, [messagesData, storeUsers]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollElement = scrollContainerRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollContainerRef}
      className="box is-flex is-flex-direction-column"
      style={{
        flex: '1 1 0',
        overflowY: 'auto',
        minHeight: '0',
        padding: '1rem',
      }}
    >
      <div className="is-flex is-flex-direction-column-reverse is-flex-grow-1">
        {messages.map((message) => {
          return (
            <ChatMessage
              key={message.id}
              userName={
                users.find((user) => user.id === message.userId)?.userName ?? ''
              }
              createdAt={new Date(message.createdAt)}
              text={message.text}
            />
          );
        })}
      </div>
    </div>
  );
};
