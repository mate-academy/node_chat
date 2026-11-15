import './MessageList.css';

export const MessageList = ({ messages, userName }) => (
  <ul className="message-list">
    {messages.map((message) => {
      const isOwnMessage = message.author === userName;

      return (
        <li
          className={`chat-message ${isOwnMessage ? 'chat-message--own' : ''}`}
          key={message.id}
        >
          <span className="chat-message__meta">
            <span className="chat-message__author">{message.author}</span>
            <time dateTime={new Date(message.time).toISOString()}>
              {new Date(message.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </span>
          <span>{message.text}</span>
        </li>
      );
    })}
  </ul>
);
