import React, { useState, useEffect } from 'react';
import { messageService } from '../services/messageServise';
import * as Types from '../types/types';

interface MessageInputProps {
  chatId: number | null;
  editingMessage: Types.Message | null;
  onMessageSaved: (updatedMessage: Types.Message) => void;
  onMessageCreate: (newMessage: Types.MessageWithAuthor) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  editingMessage,
  onMessageSaved,
  onMessageCreate,
}) => {
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (editingMessage) {
      setMessageText(editingMessage.text);
    }
  }, [editingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) return;
    try {
      if (editingMessage) {
        const updatedMessage = await messageService.updateMessage(
          editingMessage.id,
          messageText,
        );
        debugger
        onMessageSaved(updatedMessage);
      } else {
        if (chatId) {
          const newMessage = await messageService.createMessage(
            messageText,
            chatId,
          );
          onMessageCreate(newMessage);
        }
      }

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input is-flex">
      <input
        className="input mr-2"
        type="text"
        placeholder="Type message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        required
      />
      <button className={`button is-${editingMessage ? 'warning' : 'primary'}`} type="submit">{editingMessage ? 'Update' : 'Send'}</button>
    </form>
  );
};

export default MessageInput;
