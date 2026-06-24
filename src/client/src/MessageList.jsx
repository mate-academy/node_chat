export const MessageList = ({ messages }) => (
  <ul>
    {[...messages].reverse().map((message) => (
      <li key={message.time}>
        <strong>{message.author}</strong>: {message.text}
      </li>
    ))}
  </ul>
);
