import { memo, useContext, useState } from 'react';
import { UserContext } from '../../store/UserContext';
import './NewMessageForm.css';

export const NewMessageForm = memo(({ socket }) => {
  const [message, setMessage] = useState('');

  const { user } = useContext(UserContext);

  const createMessage = async (e) => {
    e.preventDefault();
    if (!message) return;
    const userMessage = {
      event: 'message/create',
      text: message,
      userId: user.id,
    };
    socket.current.send(JSON.stringify(userMessage));
    setMessage('');
  };

  return (
    <form
      className="Chat__newMessageForm NewMessageForm"
      onSubmit={createMessage}
    >
      <input
        type="text"
        className="NewMessageForm__input"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="NewMessageForm__btn">
        🛩️
      </button>
    </form>
  );
});
