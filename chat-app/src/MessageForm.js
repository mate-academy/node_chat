// import 'dotenv/config';
import { useState } from 'react';

export const MessageForm = ({ messageText, setMessageText, sendMessage }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendMessage();
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
    className="message-form"
    id="message-form"
    onSubmit={handleSubmit}
    >

    <input
      type="text"
      name="message"
      id="message-input"
      className="message-input"
      value={messageText}
      onChange={(event) => setMessageText(event.target.value)}
      placeholder='Type your message...'
      disabled = {loading}
    />
    <div className="v-divider"></div>
    <button type="submit" className="send-button" disabled={loading}>
      Send
      </button>
      {error && <p className="error-message">{error}</p>}
  </form>
  );
};
