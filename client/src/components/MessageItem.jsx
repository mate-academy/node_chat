import { useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const MessageItem = ({
  message,
  isOwn,
  disabled,
  onUpdate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.text);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = () => {
    setText(message.text);
    setError('');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    const value = text.trim();

    if (!value || busy || disabled) {
      return;
    }

    if (value === message.text) {
      setEditing(false);

      return;
    }

    setBusy(true);
    setError('');

    try {
      await onUpdate(message.id, value);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy || disabled) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      await onDelete(message.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`message ${isOwn ? 'message-own' : ''}`}>
      <div className="message-meta">
        <strong>{message.author}</strong>

        <time dateTime={message.createdAt}>
          {dateFormatter.format(new Date(message.createdAt))}
        </time>
      </div>

      {editing ? (
        <form className="message-edit-form" onSubmit={handleUpdate}>
          <textarea
            aria-label="Edit message"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={255}
            disabled={busy || disabled}
            rows={3}
            autoFocus
            required
          />

          <div className="message-actions">
            <button disabled={busy || disabled || !text.trim()}>
              {busy ? 'Saving…' : 'Save'}
            </button>

            <button type="button" disabled={busy} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p>{message.text}</p>

          {isOwn && (
            <div className="message-actions">
              <button
                type="button"
                disabled={busy || disabled}
                onClick={handleEdit}
              >
                Edit
              </button>

              <button
                type="button"
                className="danger-button"
                disabled={busy || disabled}
                onClick={handleDelete}
              >
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
};