export const MessageList = ({ messages }) => (
  <ul>
    {messages.map(message => (
      <li key={message.time}>
        {message.text}
      </li>
    ))}
  </ul>
);
