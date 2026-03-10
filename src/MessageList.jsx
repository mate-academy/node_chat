import PropTypes from 'prop-types';

export const MessageList = ({ messages }) => (
  <>
    {messages.map((msg) => (
      <div key={msg.id} className="message">
        <div className="message-meta">
          <span className="message-author">{msg.author}</span>
          <span className="message-time">
            {new Date(msg.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="message-text">{msg.text}</div>
      </div>
    ))}
  </>
);

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
};
