import './MessageList.scss'
export const MessageList = ({ messages }) => (
  
  <ul>
    {messages.map(message => (
      <li key={message.id}
      className='messageBox'>
        <span className='text' >{`${message.userName} from ${message.data}`}
          
        </span>
        <p className='textMessage'>{message.text}</p>
        
        
      </li>
    ))}
  </ul>
);
