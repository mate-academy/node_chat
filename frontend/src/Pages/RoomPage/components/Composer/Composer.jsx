import { useContext, useState } from 'react';
import styles from './Composer.module.scss';
import { Send } from 'lucide-react';
import { RoomsContext } from '../../../../Context/RoomsContext';

export const Composer = ({ roomId, user }) => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useContext(RoomsContext);

  const handleSend = (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    sendMessage('SEND_MESSAGE', { roomId, text: message, author: user });
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (message.trim().length > 0) {
        handleSend(e);
      }
    }
  };

  return (
    <div className={styles.composer}>
      <form className={styles.form} onSubmit={handleSend}>
        <textarea
          value={message}
          className={styles.textarea}
          placeholder="Type message"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>
        <button
          className={styles.button}
          type="submit"
          disabled={message.trim().length === 0}
        >
          <Send />
        </button>
      </form>
    </div>
  );
};
