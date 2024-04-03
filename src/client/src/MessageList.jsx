import './styles/style.css';
import moment from 'moment';

export const MessageList = ({ messages }) => {
  return (
    <ul>
      {messages.map(message => {
        const messageCreatedAt = message.createdAt;
        const time = moment(messageCreatedAt).format('HH:mm:ss');
        const { id, userName, text} = message;
        return (
          <li key={id}>
            <span className="username">{userName}</span>
            <span className="text">{text}</span>
            <span className="time">{time}</span>
          </li>
        )
      })}
    </ul>
  )
};
