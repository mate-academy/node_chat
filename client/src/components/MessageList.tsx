import type { Message } from '../types';

type Props = { messages: Message[] };

export const MessageList = ({ messages }: Props) => (
  <ul>
    {messages.map((message) => (
      <li key={message.time + message.author}>
        <b>{message.author}</b>{' '}
        <small>{new Date(message.time).toLocaleTimeString()}</small>
        <p>{message.text}</p>
      </li>
    ))}
  </ul>
);
