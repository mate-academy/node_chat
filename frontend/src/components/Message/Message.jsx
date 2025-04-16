import { useContext, useRef, useState } from 'react';
import { UserContext } from '../../store/UserContext';
import classNames from 'classnames';
import './Message.css';

export const Message = ({ socket, message }) => {
  const { user } = useContext(UserContext);
  const [isEditting, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const saveButtonRef = useRef(null);

  const handleDelete = (e) => {
    e.preventDefault();
    socket.current.send(
      JSON.stringify({
        event: 'message/delete',
        user: user,
        id: message.id,
      }),
    );
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText(message.text);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editedText === message.text || !editedText) {
      setIsEditing(false);
      return;
    }

    socket.current.send(
      JSON.stringify({
        event: 'message/update',
        user: user,
        id: message.id,
        text: editedText,
      }),
    );
    setIsEditing(false);
  };

  const handleBlur = (e) => {
    if (
      saveButtonRef.current &&
      saveButtonRef.current.contains(e.relatedTarget)
    ) {
      return;
    }
  };

  const isDisabled = user.name !== 'admin' && message.authorId !== user.id;
  const messageClass = classNames('Message Chat__Message', {
    'Message--me': message.author.id === user.id,
    'Message--editable': user.name === 'admin',
  });

  return (
    <div className={messageClass}>
      <div className="Message__cnt Message__cnt--left">
        <span className="Message__author">{message.user.name}: </span>

        {isEditting ? (
          <input
            type="text"
            className="Message__edit"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave(e);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="Message__text"
            onDoubleClick={() => !isDisabled && setIsEditing(true)}
          >
            {message.text}
          </span>
        )}
      </div>
      <div className="Message__cnt Message__cnt--right">
        {isEditting ? (
          <div className="Message__btns">
            <button
              onClick={handleCancel}
              className="Message__btn Message__btn--cancel"
            >
              ❌
            </button>

            <button
              ref={saveButtonRef}
              className="Message__btn Message__btn--save"
              onClick={handleSave}
              disabled={editedText === message.text}
            >
              💾
            </button>
          </div>
        ) : (
          <div className="Message__btns">
            <button
              onClick={handleDelete}
              disabled={isDisabled}
              className="Message__btn Message__btn--delete"
            >
              🗑️
            </button>

            <button
              className="Message__btn Message__btn--edit"
              disabled={isDisabled}
              onClick={handleEdit}
            >
              ✏️
            </button>
          </div>
        )}

        <span className="Message__date">
          {message.createdAt !== message.updatedAt && (
            <span className="Message__alert">edited</span>
          )}
          {new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
      </div>
    </div>
  );
};
