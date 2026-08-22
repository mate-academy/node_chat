import React, { useEffect, useState } from 'react';

const CreateRoomModal = ({
  isOpen,
  room,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(room?.name || '');
    }
  }, [isOpen, room]);

  if (!isOpen) {
    return null;
  }

  const isEditing = Boolean(room);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    await onSubmit(trimmedName);

    setName('');
  };

  return (
    <div className="modal is-active">
      <div
        className="modal-background"
        onClick={onClose}
      />

      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            {isEditing ? 'Rename room' : 'Create room'}
          </p>

          <button
            className="delete"
            aria-label="close"
            onClick={onClose}
          />
        </header>

        <form onSubmit={handleSubmit}>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">
                Room name
              </label>

              <div className="control">
                <input
                  className="input"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter room name"
                  autoFocus
                />
              </div>
            </div>
          </section>

          <footer className="modal-card-foot">
            <button
              type="submit"
              className="button is-primary"
            >
              {isEditing ? 'Save' : 'Create'}
            </button>

            <button
              type="button"
              className="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
