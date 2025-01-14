import React, { useEffect, useState } from 'react';
import * as Types from '../types/types';
import { socket } from '../services/socketService';

interface ChatListProps {
  selectedChatId: number | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<Types.Chat | null>>;
  chats: Types.Chat[];
  setChats: React.Dispatch<React.SetStateAction<Types.Chat[]>>;
  unreadMessages: Record<number, Set<number>>;
  setUnreadMessages: React.Dispatch<
    React.SetStateAction<Record<number, Set<number>>>
  >;
  handleNewMessage: (chatId: number, messageId: number) => void;
  onSelectChat: (chat: Types.Chat) => void;
  onExitChat: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
  handleOpenModalToEditChat: (chat: Types.Chat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  selectedChatId,
  setSelectedChat,
  chats,
  setChats,
  unreadMessages,
  setUnreadMessages,
  handleNewMessage,
  onSelectChat,
  onExitChat,
  onDeleteChat,
  handleOpenModalToEditChat,
}) => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  useEffect(() => {
    const listener = (event: { data: string }) => {
      try {
        const incomingMessage: Types.WSEvent<string, any> = JSON.parse(
          event.data,
        );

        switch (incomingMessage.type) {
          case 'new_chat': {
            const newChat =
              incomingMessage.payload as Types.WSNewChat['payload'];
            setChats((prevChats) => [...prevChats, newChat]);
            break;
          }
          case 'chat_renamed': {
            const renamedChat =
              incomingMessage.payload as Types.WSChatRenamed['payload'];
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === renamedChat.id ? renamedChat : chat,
              ),
            );
            break;
          }
          case 'chat_deleted': {
            const deletedChatId =
              +incomingMessage.payload as Types.WSChatDeleted['payload'];
            setChats((prev) =>
              prev.filter((chat) => chat.id !== +deletedChatId),
            );
            if (selectedChatId === deletedChatId) {
              setSelectedChat(null);
            }
            setUnreadMessages((prevState) => {
              const newUnreadMessages = { ...prevState };
              delete newUnreadMessages[deletedChatId];
              return newUnreadMessages;
            });
            break;
          }
          case 'new_message': {
            const chatIdWithNewMessage = (incomingMessage as Types.WSMessage)
              .payload.message.ChatId;
            const idOfNewMessage = (incomingMessage as Types.WSMessage).payload
              .message.id;
            if (selectedChatId !== chatIdWithNewMessage) {
              handleNewMessage(chatIdWithNewMessage, idOfNewMessage);
            }
            break;
          }
          case 'delete_message': {
            const chatIdWithDeletedMessage = +(
              incomingMessage as Types.WSDeleteMessage
            ).payload.chatId;
            const idOfDeletedMessage = +(
              incomingMessage as Types.WSDeleteMessage
            ).payload.messageId;
            if (selectedChatId !== chatIdWithDeletedMessage) {
              setUnreadMessages((prevState) => {
                const newUnreadMessages = { ...prevState };
                newUnreadMessages[chatIdWithDeletedMessage].delete(
                  idOfDeletedMessage,
                );
                return newUnreadMessages;
              });
            }
            break;
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    socket.addEventListener('message', listener);
    return () => socket.removeEventListener('message', listener);
  }, [selectedChatId]);

  const toggleMenu = (chatId: number) => {
    setOpenMenu((prev) => (prev === chatId ? null : chatId));
  };

  const clearNotification = (chatId: number) => {
    setUnreadMessages((prevState) => {
      const newUnreadMessages = { ...prevState };
      delete newUnreadMessages[chatId];
      return newUnreadMessages;
    });
  };

  return (
    <section className="column is-one-third">
      <aside className="chat-list">
        <div className="box m-4">
          <p className="menu-label has-text-weight-bold">Chats</p>
          <ul className="menu-list">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <li
                  key={chat.id}
                  className={`box p-2 is-flex is-align-items-center ${
                    unreadMessages[chat.id]?.size > 0
                      ? 'has-background-warning-light'
                      : ''
                  }`}
                >
                  <a
                    onClick={() => {
                      onSelectChat(chat);
                      clearNotification(chat.id);
                    }}
                    className=" is-clickable"
                  >
                    {chat.name}
                    {unreadMessages[chat.id]?.size > 0 && (
                      <span className="tag is-warning ml-2">
                        {unreadMessages[chat.id].size}
                      </span>
                    )}
                  </a>
                  <div className="dropdown is-hoverable is-right">
                    <button
                      className="button is-small is-light"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(chat.id);
                      }}
                    >
                      ⋮
                    </button>
                    {openMenu === chat.id && (
                      <div className="dropdown-menu">
                        <div className="dropdown-content">
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              handleOpenModalToEditChat(chat);
                              setOpenMenu(null);
                            }}
                          >
                            Edit
                          </a>
                          <a
                            className="dropdown-item has-text-danger"
                            onClick={() => {
                              onExitChat(chat.id);
                              setOpenMenu(null);
                            }}
                          >
                            Exit
                          </a>
                          <a
                            className="dropdown-item has-text-danger"
                            onClick={() => {
                              onDeleteChat(chat.id);
                              setOpenMenu(null);
                            }}
                          >
                            Delete
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <div className="has-text-grey has-text-centered p-3">
                <p>...</p>
              </div>
            )}
          </ul>
        </div>
      </aside>
    </section>
  );
};
