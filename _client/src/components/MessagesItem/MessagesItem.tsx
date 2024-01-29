import React from 'react';

import './MessagesItem.scss';
import { Message } from '../../helpers/types/Message';

type Props = {
  message: Message,
};

export const MessagesItem: React.FC<Props> = ({
  message: { author, time, text },
}) => {
  const dateFromTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);

    return date.toLocaleString();
  };

  return (
    <div className="MessagesItem">
      <div className="MessagesItem__top">
        <span className="MessagesItem__author">
          {author}
        </span>

        <span className="MessagesItem__time">
          {dateFromTimestamp(time)}
        </span>
      </div>

      <p className="MessagesItem__text">
        {text}
      </p>
      <br />
    </div>
  );
};
