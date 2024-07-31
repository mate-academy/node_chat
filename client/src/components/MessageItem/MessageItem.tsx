/* eslint-disable react/prop-types */
import './MessageItem.scss';
import classNames from 'classnames';
import { Message, MessageParam, User } from '../../types/types';
import { getMessageTime } from '../../service/service';

interface Props {
  message: Message,
  author: User | null,
}

export const MessageItem: React.FC<Props> = ({ message, author }) => {
  const { userId, time, text, userName } = message;
  const isAuthor = author?.id === userId;

  const getStyle = (messageType: MessageParam, isAuthor: boolean) => {
    return classNames(messageType, { [`${messageType}` + '--right']: isAuthor });
  };
  
  return (
    <li className={getStyle(MessageParam.Container, isAuthor)}>
      <div className={getStyle(MessageParam.Position, isAuthor)}>
        <p className={getStyle(MessageParam.Username, isAuthor)}>
          {isAuthor ? 'Ви' : userName}
        </p>
        <p className={getStyle(MessageParam.Text, isAuthor)}>{text}</p>
        <p className={getStyle(MessageParam.Time, isAuthor)}>{getMessageTime(time)}</p>
      </div>
    </li>
  );
}
