import React, { useState } from 'react';
import * as Types from '../types/types';
// import '../style/ChatList.scss';

interface ChatListProps {
  chats: Types.Chat[];
  onSelectChat: (chat: Types.Chat) => void;
  onRenameChat: (chatId: number) => void;
  onExitChat: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onSelectChat,
  onRenameChat,
  onExitChat,
  onDeleteChat,
}) => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const toggleMenu = (chatId: number) => {
    setOpenMenu((prev) => (prev === chatId ? null : chatId));
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
                  className=" box p-2 is-flex is-align-items-center"
                >
                  <a
                    onClick={() => onSelectChat(chat)}
                    className=" is-clickable"
                  >
                    {chat.name}
                  </a>
                  <div className="dropdown is-hoverable is-right">
                  <button
                    className="button is-small is-light"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(chat.id);
                      }
                    }
                  >
                    ⋮
                  </button>
                  {openMenu === chat.id && (
                    <div className="dropdown-menu">
                      <div className="dropdown-content">
                        <a
                          className="dropdown-item"
                          onClick={() => {
                              onRenameChat(chat.id);
                              setOpenMenu(null);
                            }
                          }
                        >
                          Rename
                        </a>
                        <a
                          className="dropdown-item has-text-danger"
                          onClick={() => {
                              onExitChat(chat.id);
                              setOpenMenu(null);
                            }
                          }
                          >
                            Exit
                        </a>
                        <a
                          className="dropdown-item has-text-danger"
                          onClick={() => {
                              onDeleteChat(chat.id);
                              setOpenMenu(null);
                            }
                          }
                          >
                            Delete
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                  {/* <div className="dropdown is-right is-hoverable">
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
                              onRenameChat(chat.id);
                              setOpenMenu(null);
                            }}
                          >
                            Rename
                          </a>
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              onExitChat(chat.id);
                              setOpenMenu(null);
                            }}
                          >
                            Exit
                          </a>
                          <a
                            className="dropdown-item"
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
                  </div> */}
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
