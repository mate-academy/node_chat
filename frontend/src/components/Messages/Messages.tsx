import React, { useEffect } from 'react';
import { MessageElement } from '../MessageElement/MessageElement';
import { getAllByRoomId } from '../../api/messages';
import { Message } from '../../types/Message';
import { ErrorType } from '../../types/ErrorType';

interface Props {
  messageContainerRef: React.RefObject<HTMLDivElement>;
  roomId: string;
  loading: boolean;
  roomMessages: Message[];
  setRoomMessages: (roomMessages: Message[]) => void;
  setErrorMessage: (errorMessage: ErrorType) => void;
  hideError: () => void;
  onDelete: (id: string) => void;
  editedMessage: string;
  setEditedMessage: (message: string) => void;
  editedMessageId: string | null;
  setEditedMessageId: (id: string | null) => void;
  onUpdate: () => void;
  newMessageFocus: () => void;
}

export const Messages: React.FC<Props> = ({
  messageContainerRef,
  roomId,
  loading,
  roomMessages,
  setRoomMessages,
  setErrorMessage,
  hideError,
  onDelete,
  editedMessage,
  setEditedMessage,
  editedMessageId,
  setEditedMessageId,
  onUpdate,
  newMessageFocus,
}) => {
  useEffect(() => {
    getAllByRoomId(roomId)
      .then(setRoomMessages)
      .catch(() => {
        setErrorMessage(ErrorType.LoadMessagesError);
        hideError();
      });
  }, [roomId]);

  useEffect(() => {
    const container = messageContainerRef?.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [roomMessages]);

  return (
    <div ref={messageContainerRef} className="messages">
      {roomMessages.map((message) => (
        <MessageElement
          key={message.id}
          message={message}
          loading={loading}
          onDelete={onDelete}
          editedMessage={editedMessage}
          setEditedMessage={setEditedMessage}
          editedMessageId={editedMessageId}
          setEditedMessageId={setEditedMessageId}
          onUpdate={onUpdate}
          newMessageFocus={newMessageFocus}
        />
      ))}
    </div>
  );
};
