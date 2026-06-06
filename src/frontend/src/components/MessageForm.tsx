import { Send } from 'lucide-react';
import { useContext, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import type { Room } from '../types/Room';
import { createSocketMessage } from '../services/createSocketMessage';

type Props = {
  currentRoom: Room | null;
};

export const MessageForm: React.FC<Props> = ({ currentRoom }) => {
  const [text, setText] = useState('');
  const { socket } = useContext(SocketContext);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    if (!socket || !currentRoom) {
      return;
    }

    const message = createSocketMessage('SEND_MESSAGE', {
      roomId: currentRoom.id,
      text,
    });

    socket.send(message);

    setText('');
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-input message-input"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="message-button"
        type="submit"
      >
        <Send color="white" size={16} />
      </button>
    </form>
  );
};
