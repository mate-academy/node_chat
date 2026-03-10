import { useState } from 'react';
import PropTypes from 'prop-types';

export const MessageForm = ({ ws }) => {
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (!text.trim() || !ws || ws.readyState !== 1) {
      return;
    }

    ws.send(
      JSON.stringify({
        type: 'send_message',
        text: text.trim(),
      }),
    );

    setText('');
  }

  return (
    <form onSubmit={handleSubmit} className="field">
      <input
        type="text"
        className="input"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="button">Send</button>
    </form>
  );
};

MessageForm.propTypes = {
  ws: PropTypes.object,
};
