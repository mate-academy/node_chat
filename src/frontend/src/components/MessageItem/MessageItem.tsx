import type React from 'react';
import style from './MessageItem.module.scss';
import type { Message } from '../../type/Message';
import { Icon } from '../Icon/Icon';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import classNames from 'classnames';

type Props = {
  message: Message;
};

export const MessageItem: React.FC<Props> = ({ message }) => {
  const { userName } = useContext(UserContext);

  const { text, user, createAt } = message;
  const time = new Date(createAt);
  const formatedTime = time.toLocaleTimeString();

  return (
    <li
      className={classNames(style.message, {
        [style['message--current']]: userName === user,
        [style['message--system']]: message.type === 'system',
      })}
    >
      {message.type === 'system' ? (
        <span className={style.message__system}>{text}</span>
      ) : (
        <>
          <div>
            <Icon nameIcon="avatar" className={style.message__iconAvatar} />
          </div>

          <div className={style.message__content}>
            <div className={style.message__info}>
              <div className={style.message__name}>{user}</div>
              <div className={style.message__time}>{formatedTime}</div>
            </div>

            <span className={style.message__text}>{text}</span>
          </div>
        </>
      )}
    </li>
  );
};
