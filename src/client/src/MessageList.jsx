import './styles/style.css'; 
import moment from 'moment';

export const MessageList = ({ messages }) => {
  return (
    <ul>
      {messages.map(message => {
        const dateString = message.createdAt;
        const time = moment(dateString).format('HH:mm:ss');
        return (
          <li key={message.id}>
            <span className="username">{message.userName}</span>
            <span className="text">{message.text}</span>
            <span className="time">{time}</span>
          </li>
        )
      })}
    </ul>
  )
};
