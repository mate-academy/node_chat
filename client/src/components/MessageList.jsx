export const MessageList = ({ messages }) => (
  <ul>
    {messages.map((message) => (
      <li key={message.time}>
        <b>{message.username}</b>{" "}
        <small>
          {new Date(message.time).toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })}
        </small>
        : {message.text}
      </li>
    ))}
  </ul>
);
