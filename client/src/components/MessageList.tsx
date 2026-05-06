import { Message } from '../types/message';

export const MessageList = ({ messages }: { messages: Message[] }) => (
  <div>
    <h4>Messages</h4>
    <ul>
      {messages.map(message => (
        <li key={message.id}>{message.time} author: {message.author} : {message.text}</li>
      ))}
    </ul>
  </div>
);
