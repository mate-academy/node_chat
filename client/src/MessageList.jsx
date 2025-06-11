export const MessageList = ({ messages }) => (
  <ul>
    {messages.map(message => (
      <li key={message.time}>
        <b>{message.author}</b> [{new Date(message.time).toLocaleTimeString()}]: {message.text}
      </li>
    ))}
  </ul>
);
