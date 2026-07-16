import { Message } from '../types/message';

export const MessageList = ({ messages }: { messages: Message[] }) => (
  <ul>
    {messages.map(message => (
      <li key={message.time}>
        <strong>{message.author}:</strong> {message.text}
      </li>
    ))}
  </ul>
);
