import React, { useState, useEffect } from 'react';
import * as Types from '../types/types';
import { messageService } from '../services/messageServise';
import MessageInput from './MessageInput';
import { useUser } from '../context/UserContext';
import { socket } from '../services/socketService';

interface ChatWindowProps {
  chatId: number | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Types.MessageWithAuthor[]>([]);
  const [editingMessage, setEditingMessage] = useState<Types.Message | null>(
    null,
  );
  const { user } = useUser();
  const [activeMessage, setActiveMessage] = useState<Types.Message | null>(
    null,
  );

  useEffect(() => {
    if (!chatId) {
      return;
    }
    messageService
      .getMessages(chatId)
      .then((fetchedMessages) => {
        setMessages(fetchedMessages);
      })
      .catch(console.error);

    const listener = (event: { data: string }) => {
      try {
        const incomingMessage: Types.WSEvent<string, any> = JSON.parse(
          event.data,
        );

        switch (incomingMessage.type) {
          case 'new_message': {
            const newMessage =
              incomingMessage.payload as Types.WSMessage['payload'];
            if (newMessage.message.ChatId === chatId) {
              setMessages((prev) => [...prev, newMessage]);
            }
            break;
          }
          case 'updated_message': {
            const updatedMessage =
              incomingMessage.payload as Types.WSUpdatedMessage['payload'];
            setMessages((prev) =>
              prev.map((msg) =>
                msg.message.id === updatedMessage.id
                  ? { ...msg, message: updatedMessage }
                  : msg,
              ),
            );
            break;
          }
          case 'delete_message': {
            const messageId = +(incomingMessage as Types.WSDeleteMessage)
              .payload.messageId;
            setMessages((prev) =>
              prev.filter((msg) => msg.message.id !== messageId),
            );
            break;
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    socket.addEventListener('message', listener);
    return () => socket.removeEventListener('message', listener);
  }, [chatId]);

  const handleDeleteMessage = async (messageId: number, chatId: number) => {
    try {
      await messageService.deleteMessage(messageId, chatId);
      setMessages((prev) => prev.filter((msg) => msg.message.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEditMessage = (message: Types.Message) => {
    setEditingMessage(message);
    setActiveMessage(null);
  };

  const handleSaveMessage = async (updatedMessage: Types.Message) => {
    try {
      if (chatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.message.id === updatedMessage.id
              ? { ...msg, message: updatedMessage }
              : msg,
          ),
        );
        setEditingMessage(null);
        setActiveMessage(null);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleCreateMessage = (newMessage: Types.MessageWithAuthor) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const sendGreeting = async () => {
    try {
      if (chatId) {
        const createdMessage = await messageService.createMessage('👋', chatId);
        handleCreateMessage(createdMessage);
      }
    } catch (error) {
      console.error('Error sending greeting:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <section className="column chat-window panel">
      {messages.length === 0 ? (
        <div className="has-text-centered p-6">
          <p className="has-text-grey mb-4">No massages?</p>
          <button className="button is-primary" onClick={sendGreeting}>
            👋 Hi!!!
          </button>
        </div>
      ) : (
        <div className="messages-list">
            {messages.map(({ message, author }) => (
            <div
              key={message.id}
              className={`box mb-2 is-flex is-align-items-center is-justify-content-space-between`}
            >
              <p>
                <strong>{author}:</strong> {message.text}
              </p>
              <p className="has-text-grey is-size-7">
                {formatDate(message.createdAt)}
              </p>
              {message.UserId === user?.id && (
                <div className="dropdown is-hoverable is-right">
                  <button
                    className="button is-small is-light"
                    onClick={() =>
                      setActiveMessage(
                        activeMessage?.id === message.id ? null : message,
                      )
                    }
                  >
                    ⋮
                  </button>
                  {activeMessage?.id === message.id && chatId && (
                    <div className="dropdown-menu">
                      <div className="dropdown-content">
                        <a
                          className="dropdown-item"
                          onClick={() => handleEditMessage(message)}
                        >
                          Edit
                        </a>
                        <a
                          className="dropdown-item has-text-danger"
                          onClick={() =>
                            handleDeleteMessage(message.id, chatId)
                          }
                        >
                          Delete
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <MessageInput
        chatId={chatId}
        editingMessage={editingMessage}
        onMessageSaved={handleSaveMessage}
        onMessageCreate={handleCreateMessage}
      />
    </section>
  );
};

export default ChatWindow;
