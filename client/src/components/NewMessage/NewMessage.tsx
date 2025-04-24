import { useState } from 'react';
import { Box } from 'react-bulma-components';

interface Props {
  onAction: (message: string) => void | Promise<void>;
}

export const NewMessage: React.FC<Props> = ({ onAction }) => {
  const [message, setMessage] = useState<string>('');

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onAction(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };
  return (
    <Box style={{ width: '100%' }}>
      <div className="field  is-flex">
        <div className="control is-flex-grow-1 pr-3">
          <textarea
            className="textarea"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="control">
          <button className="button is-info" onClick={handleSubmit}>
            Send message
          </button>
        </div>
      </div>
    </Box>
  );
};
