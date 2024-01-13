import './MessageList.css';

const convertToHours = time => {
  const date = new Date(time);

  return `${date.getHours()}:${date.getMinutes()}`;
};

export const MessageList = ({ messages }) => (
  <ul className="messageList">
    {messages.map(message => (
      <li
        className="messageList__item message"
        key={message.time}
      >
        <p className="message__text">{message.text}</p>
        <div className="message__details">
          <p>{message.author}</p>
          <p>{convertToHours(message.time)}</p>
        </div>
      </li>
    ))}
  </ul>
);
