import * as R from 'react';
import cn from 'classnames';

import type { Message } from '../../types/Message.type';
import { AppContext } from 'store/AppContext';

import './MessageList.scss';

type Props = {
  messages: Message[],
};

export const MessageList: R.FC<Props> = ({
  messages,
}) => {
  const { user } = R.useContext(AppContext);

  return (
    <>
      {messages.map(message => (
        <article
          key={message.createdAt}
          className={cn(
            'message',
            'is-info',
            'MessageList__item', {
            'mr-auto': message.author === user,
            'ml-auto': message.author !== user,
          })}
        >
          <div className="message-header">
            <p>{message.author}</p>
          </div>

          <div className="message-body">
            {message.text}
          </div>
        </article>
      ))}
    </>
  );
}
