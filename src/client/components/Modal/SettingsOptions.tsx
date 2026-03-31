import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useError } from '../ErrorContext';
import { useChat } from '../ChatContext';

export const SettingsOptions = () => {
  const navigate = useNavigate();
  const { selectedRoom } = useChat();
  const { setError } = useError();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      setError('Failed to copy: ' + err);
    }
  };

  return (
    <>
      <div className="settings_options">
        <button className="button" onClick={() => navigate('rename')}>
          Rename
        </button>
        {selectedRoom?.id && (
          <button
            className="button"
            onClick={() => handleCopy(selectedRoom?.id || '')}
          >
            {copied ? '✓' : 'Copy room ID'}
          </button>
        )}
        <button className="button" onClick={() => navigate('leave')}>
          Leave the room
        </button>
      </div>

      <button
        className="button is-danger is-dark"
        onClick={() => navigate('delete')}
      >
        Delete
      </button>
    </>
  );
};
