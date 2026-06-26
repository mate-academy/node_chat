import { useMemo } from 'react';

export const MessageList = ({ messages }) => {
  const reversed = useMemo(() => [...messages].reverse(), [messages]);

  return (
    <ul>
      {reversed.map((message) => (
        <li key={message.time}>
          <strong>{message.author}</strong>: {message.text}
        </li>
      ))}
    </ul>
  );
};