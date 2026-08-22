import React, { useState } from 'react';

const MessageForm = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText || disabled) {
      return;
    }

    onSend(trimmedText);

    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field has-addons mb-0">
        <div className="control is-expanded">
          <input
            className="input"
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Write a message..."
            disabled={disabled}
          />
        </div>

        <div className="control">
          <button
            type="submit"
            className="button is-primary"
            disabled={disabled || !text.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageForm;
