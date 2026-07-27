/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useContext } from 'react';
import { Message } from '../../types/Message';
import classNames from 'classnames';
import { AuthContext } from '../../contexts/AuthContext';

interface Props {
  message: Message;
  loading: boolean;
  onDelete: (id: string) => void;
  editedMessage: string;
  setEditedMessage: (message: string) => void;
  editedMessageId: string | null;
  setEditedMessageId: (id: string | null) => void;
  onUpdate: () => void;
  newMessageFocus: () => void;
}

export const MessageElement: React.FC<Props> = ({
  message,
  loading,
  onDelete,
  editedMessage,
  setEditedMessage,
  editedMessageId,
  setEditedMessageId,
  onUpdate,
  newMessageFocus,
}) => {
  const { currentUser } = useContext(AuthContext);
  const editInputRef = React.useRef<HTMLInputElement>(null);

  const handleEditClick = (id: string, currentMessage: string) => {
    setEditedMessageId(id);
    setEditedMessage(currentMessage);
  };

  const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (editedMessageId && editedMessage.trim()) {
        onUpdate();
      }
    }
  };

  const handleEditBlur = () => {
    setEditedMessageId(null);
    newMessageFocus();
  };

  React.useEffect(() => {
    if (editedMessageId === message.id) {
      editInputRef.current?.focus();
    }
  }, [editedMessageId]);

  return (
    <div
      data-cy="element"
      className={classNames('element element-message', {
        'message--mine': currentUser?.id === message.userId,
      })}
    >
      <div className="message__header">
        <strong>{message.username ? message.username : 'deleted user'}</strong>

        <span className="message__date">
          {new Date(
            message.edited ? message.updatedAt : message.createdAt,
          ).toLocaleString()}
        </span>
      </div>
      {currentUser && currentUser.id === message.userId && (
        <button
          type="button"
          className="message__edit"
          onClick={() => handleEditClick(message.id, message.message)}
        >
          <i className="fas fa-pen message__edit--icon" />
        </button>
      )}
      {editedMessageId !== message.id ? (
        <>
          <span className="element__title">{message.message}</span>

          {message.edited && <span className="message__edited">edited</span>}
          {currentUser && currentUser.id === message.userId && (
            <button
              type="button"
              className="element__remove"
              onClick={() => onDelete(message.id)}
            >
              ×
            </button>
          )}
        </>
      ) : (
        <form>
          <input
            ref={editInputRef}
            data-cy="elementTitleField"
            type="text"
            className="element__title-field"
            onChange={(e) => {
              setEditedMessage(e.target.value);
            }}
            value={editedMessage}
            onKeyDown={(e) => handleEditKeyPress(e)}
            onBlur={handleEditBlur}
          />
        </form>
      )}

      <div
        data-cy="elementLoader"
        className={classNames('modal overlay', {
          'is-active': loading,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
