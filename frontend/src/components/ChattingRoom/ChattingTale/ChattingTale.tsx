import React from 'react';
import { Message } from '../../../types/message';
import { User } from '../../../types/user';
import './ChattingTale.scss';
import { formatDate } from '../../../utils/formatData';
import cn from 'classnames';
import { useAppSelector } from '../../../redux/custom.hooks.ts';
import { selectUser } from '../../../redux/slices/userSlice.ts';

interface Props {
  message: Message;
  user: User;
}

export const ChattingTale: React.FC<Props> = ({ message }) => {
  const userId = localStorage.getItem('id');
  const { users } = useAppSelector(selectUser);
  const sender = users.find((user) => user.id === message.senderId);

  return (
    <div
      className={cn({
        positionRelativeSender: message.senderId === JSON.parse(userId!),
      })}
    >
      <div className="ChattingTale">
        <p className="ChattingTale__content">{message.content}</p>
        <div className="ChattingTale__from">
          <p className="ChattingTale__from__title">From:</p>
          <span className="ChattingTale__from__user">{sender?.name}</span>
        </div>
        <span className="ChattingTale__time__value">
          {formatDate(message.createdAt)}
        </span>
      </div>
    </div>
  );
};
