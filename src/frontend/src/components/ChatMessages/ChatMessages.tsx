import type React from 'react';
import type { Room } from '../../type/Room';
import { NoRooms } from '../NoRooms/NoRooms';
import style from './ChatMessages.module.scss';
import { MessageForm } from '../MessageForm/MessageForm';
import { MessageItem } from '../MessageItem/MessageItem';
import { useEffect, useRef } from 'react';

type Props = {
  currentRoom: Room | null;
};

export const ChatMessages: React.FC<Props> = ({ currentRoom }) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [currentRoom?.messages]);

  if (!currentRoom) {
    return (
      <div className={style.chatMessages}>
        <NoRooms />
      </div>
    );
  }

  return (
    <div className={style.chatMessages}>
      <ul className={style.chatMessages__list} ref={listRef}>
        {currentRoom.messages.map((message) => (
          <MessageItem message={message} key={message.id} />
        ))}
      </ul>
      <MessageForm currentRoom={currentRoom} />
    </div>
  );
};
