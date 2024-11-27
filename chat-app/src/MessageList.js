
export const MessageList = ({ messages, username }) => {

  return (
    <ul className="message-container">
      {messages.length > 0 ? (
        messages.map((message, index) => (
          <li
            key={index}
            className={`message ${message.username !== username ? 'message-left' : 'message-right'}`}
          >
            <p>
              <strong>{message.username}</strong>
              <span>{message.text}</span>
              <span>{new Date(message.time).toLocaleString()}</span>
            </p>
          </li>
          ))
        ) : (
        <li>Нет сообщений в этой комнате.</li>
      )}
    </ul>
  );
};



