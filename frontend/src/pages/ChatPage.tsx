/* eslint-disable function-paren-newline */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  addMessage,
  deleteMessage,
  getAllByRoomId,
  updateMessage,
} from '../api/messages';
import {
  addRoom,
  deleteRoom,
  getRooms,
  updateRoomName,
  addExistingRoom,
  searchRooms,
} from '../api/rooms';
import { NewMessage } from '../components/NewMessage';
import { Error } from '../components/Error';
import { ErrorType } from '../types/ErrorType';
import { RoomElement } from '../components/RoomElement/RoomElement';
import { Messages } from '../components/Messages/Messages';
import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';
import { connectSocket, connectRoomsSocket } from '../api/websocket';
import { Room } from '../types/Room';
import classNames from 'classnames';

export const ChatPage: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  const [editedMessage, setEditedMessage] = useState<string>('');
  const [editedMessageId, setEditedMessageId] = useState<string | null>(null);

  const { rooms, setRooms, roomMessages, setRoomMessages } =
    useContext(DataContext);
  const [editedRoomName, setEditedRoomName] = useState<string>('');
  const [editedRoomId, setEditedRoomId] = useState<string | null>(null);
  const [pickedRoomId, setPickedRoomId] = useState<string | null>(null);
  const [pickedRoomeName, setPickedRoomName] = useState<string>('');
  const [pickedRoomUser, setPickedRoomUser] = useState<string>('');

  const [newRoom, setNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Room[]>([]);

  const [newMessage, setNewMessage] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorType>(
    ErrorType.NoError,
  );

  const editRoomRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const timerId = useRef(0);

  const newMessageFocus = () => {
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

  const hideError = () => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    timerId.current = window.setTimeout(() => {
      setErrorMessage(ErrorType.NoError);
    }, 3000);
  };

  const handleSearchOpen = () => {
    setNewRoom(false);
    setNewRoomName('');

    setEditedRoomId(null);
    setEditedRoomName('');

    setSearchOpen(true);

    searchRooms('')
      .then(setSearchResults)
      .catch((error) => {
        throw error;
      });

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearch('');
    setSearchResults([]);
  };

  const handleAddExistingRoom = (room: Room) => {
    addExistingRoom(room.id)
      .then(() => {
        setRooms((prev) => {
          if (prev.some((r) => r.id === room.id)) {
            return prev;
          }

          return [...prev, room];
        });

        handleSearchClose();
      })
      .catch((error) => {
        throw error;
      });
  };

  const handleEditClick = () => {
    setSearchOpen(false);
    setSearch('');
    setSearchResults([]);

    setEditedRoomId(pickedRoomId);
    setEditedRoomName(pickedRoomeName);

    setTimeout(() => {
      editRoomRef.current?.focus();
    }, 0);
  };

  const handleNewMessageChange = (newMsg: string) => {
    setNewMessage(newMsg);
  };

  const handleNewMessageSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newMessage.trim() || !pickedRoomId || !currentUser) {
      return;
    }

    setLoading(true);

    addMessage(newMessage, pickedRoomId, currentUser.id, currentUser.username)
      .then(() => {
        setNewMessage('');
        newMessageFocus();
      })
      .catch((error) => {
        setErrorMessage(ErrorType.AddMessageError);
        hideError();
        throw error;
      })
      .finally(() => {
        setLoading(false);
        setEditedRoomId(null);
      });
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id)
      .then(() => {
        setRoomMessages((prevMessages) => {
          const filteredMsgs = prevMessages.filter((msg) => msg.id !== id);

          return filteredMsgs;
        });

        newMessageFocus();
      })
      .catch((error) => {
        throw error;
      });
  };

  const handleUpdateMessage = () => {
    setLoading(true);

    if (!editedMessageId) {
      return;
    }

    const id = editedMessageId;

    updateMessage(id, editedMessage)
      .then((updMsg) => {
        setRoomMessages((prevMsgs) => {
          const updMsgs = prevMsgs.map((msg) => (msg.id === id ? updMsg : msg));

          return updMsgs;
        });
        setEditedMessage('');
        setEditedMessageId(null);
        newMessageFocus();
      })
      .catch((error) => {
        setErrorMessage(ErrorType.UpdateMessageError);
        hideError();
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteRoom = (id: string) => {
    deleteRoom(id)
      .then(() => {
        setRooms((prevRooms) => {
          const filteredRooms = prevRooms.filter((room) => room.id !== id);

          return filteredRooms;
        });

        setPickedRoomId(null);
      })
      .catch((error) => {
        throw error;
      });
  };

  const handleRoomAdd = () => {
    setSearchOpen(false);
    setSearch('');
    setSearchResults([]);

    setNewRoom(true);
    setEditedRoomId(null);
    setNewRoomName('');

    setTimeout(() => {
      editRoomRef.current?.focus();
    }, 0);
  };

  const handleCreateKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (!newRoomName || !currentUser) {
        return;
      }

      addRoom(newRoomName, currentUser.id)
        .then((room) => {
          setNewRoom(false);
          setPickedRoomId(room.id);
          setPickedRoomName(room.roomName);
          setPickedRoomUser(room.userId);
          setEditedRoomId(null);
          newMessageFocus();
          handleAddExistingRoom(room);
        })
        .catch((error) => {
          setErrorMessage(ErrorType.AddRoomError);
          throw error;
        });
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (!editedRoomId) {
        return;
      }

      const id = editedRoomId;

      setLoading(true);

      updateRoomName(id, editedRoomName)
        .then((updRoom) => {
          setRooms((prevRooms) => {
            return prevRooms.map((room) => (room.id === id ? updRoom : room));
          });
          setPickedRoomName(editedRoomName);
          setEditedRoomId(null);
          setEditedRoomName('');
          newMessageFocus();
        })
        .catch((error) => {
          setErrorMessage(ErrorType.UpdateMessageError);
          hideError();
          throw error;
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleEditRoomBlur = () => {
    setEditedRoomId(null);
    newMessageFocus();
  };

  const handleNewRoomBlur = () => {
    setNewRoom(false);
    newMessageFocus();
  };

  useEffect(() => {
    setLoading(true);

    getRooms()
      .then(setRooms)
      .catch((error) => {
        setErrorMessage(ErrorType.LoadRoomsError);
        hideError();
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!pickedRoomId) {
      return;
    }

    setRoomMessages([]);

    getAllByRoomId(pickedRoomId).then(setRoomMessages);

    const disconnect = connectSocket(pickedRoomId, (event) => {
      if (event.type === 'addMessage') {
        setRoomMessages((prev) => [...prev, event.payload]);
      }

      if (event.type === 'deleteMessage') {
        setRoomMessages((prev) =>
          prev.filter((msg) => msg.id !== event.payload.id),
        );
      }

      if (event.type === 'updateMessage') {
        setRoomMessages((prev) =>
          prev.map((msg) =>
            msg.id === event.payload.id ? event.payload : msg,
          ),
        );
      }
    });

    return disconnect;
  }, [pickedRoomId]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const disconnect = connectRoomsSocket(currentUser.id, (event) => {
      if (event.type === 'addRoom') {
        setRooms((prev) => {
          if (prev.some((room) => room.id === event.payload.id)) {
            return prev;
          }

          return [...prev, event.payload];
        });
      }

      if (event.type === 'deleteRoom') {
        setRooms((prev) => prev.filter((room) => room.id !== event.payload.id));

        setPickedRoomId((prev) => (prev === event.payload.id ? null : prev));
      }

      if (event.type === 'updateRoom') {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === event.payload.id ? event.payload : room,
          ),
        );
      }
    });

    return disconnect;
  }, [currentUser]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchRooms(search)
        .then(setSearchResults)
        .catch((error) => {
          throw error;
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="chatapp">
      <div className="chatapp__content">
        <section className="chatapp__main">
          <div className="chatapp__block chatapp__block--rooms">
            <div className="chatapp__rooms-top">
              {pickedRoomUser === currentUser?.id &&
                pickedRoomId &&
                !newRoom &&
                !editedRoomId &&
                !searchOpen && (
                  <button
                    type="button"
                    className="message__edit"
                    onClick={() => handleEditClick()}
                  >
                    <i className="fas fa-pen message__edit--icon" />
                  </button>
                  // eslint-disable-next-line indent
                )}
              {pickedRoomId && !editedRoomId && !newRoom && !searchOpen && (
                <span className="room__title">{pickedRoomeName}</span>
              )}
              {editedRoomId && (
                <form className="room__form">
                  <input
                    key="editRoom"
                    ref={editRoomRef}
                    data-cy="elementTitleField"
                    type="text"
                    className="room__title room__title--field"
                    onChange={(e) => {
                      setEditedRoomName(e.target.value);
                    }}
                    value={editedRoomName}
                    onKeyDown={(e) => handleEditKeyPress(e)}
                    onBlur={() => handleEditRoomBlur()}
                  />
                </form>
              )}
              {newRoom && (
                <form className="room__form">
                  <input
                    key="newRoom"
                    ref={editRoomRef}
                    data-cy="elementTitleField"
                    type="text"
                    className="room__title room__title--field"
                    onChange={(e) => {
                      setNewRoomName(e.target.value);
                    }}
                    value={newRoomName}
                    onKeyDown={(e) => handleCreateKeyPress(e)}
                    onBlur={() => handleNewRoomBlur()}
                  />
                </form>
              )}
              {!newRoom && !editedRoomId && (
                <div className="chatapp__rooms-actions">
                  {searchOpen ? (
                    <form className="room__form">
                      <i className="fas fa-search room__search-icon" />

                      <input
                        ref={searchInputRef}
                        type="text"
                        className={classNames(
                          'room__title room__title--field room__title--search',
                        )}
                        placeholder="Search rooms"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onBlur={() => {
                          setTimeout(handleSearchClose, 150);
                        }}
                      />

                      {searchResults.length > 0 && (
                        <div className="room__search-results">
                          {searchResults
                            .filter(
                              (result) =>
                                !rooms.some((room) => room.id === result.id),
                            )
                            .map((room) => (
                              <button
                                type="button"
                                key={room.id}
                                className="room__search-item"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleAddExistingRoom(room);
                                  handleSearchClose();
                                }}
                              >
                                {room.roomName}
                              </button>
                            ))}
                        </div>
                      )}
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="message__edit"
                      onClick={handleSearchOpen}
                    >
                      <i className="fas fa-search message__edit--icon" />
                    </button>
                  )}

                  <button
                    type="button"
                    className="message__edit"
                    onClick={handleRoomAdd}
                  >
                    <i className="fas fa-plus message__edit--icon" />
                  </button>
                </div>
              )}
            </div>
            {rooms.map((room) => (
              <RoomElement
                key={room.id}
                room={room}
                loading={loading}
                onDelete={handleDeleteRoom}
                setPickedRoomId={setPickedRoomId}
                setPickedRoomName={setPickedRoomName}
                setEditedRoomId={setEditedRoomId}
                setEditedRoomName={setEditedRoomName}
                setNewRoom={setNewRoom}
                newMessageFocus={newMessageFocus}
                setPickedRoomUser={setPickedRoomUser}
              />
            ))}
          </div>
          <div className="chatapp__block chatapp__block--messages">
            {pickedRoomId && (
              <>
                <Messages
                  key={pickedRoomId}
                  messageContainerRef={messagesContainerRef}
                  roomId={pickedRoomId}
                  loading={loading}
                  roomMessages={roomMessages}
                  setRoomMessages={setRoomMessages}
                  setErrorMessage={setErrorMessage}
                  hideError={hideError}
                  onDelete={handleDeleteMessage}
                  editedMessage={editedMessage}
                  setEditedMessage={setEditedMessage}
                  editedMessageId={editedMessageId}
                  setEditedMessageId={setEditedMessageId}
                  onUpdate={handleUpdateMessage}
                  newMessageFocus={newMessageFocus}
                />
                <NewMessage
                  newMessage={newMessage}
                  onMessageSubmit={handleNewMessageSubmit}
                  onMessageChange={handleNewMessageChange}
                  loading={loading}
                  messageInputRef={messageInputRef}
                />
              </>
            )}
          </div>
        </section>
        <Error
          errorMessage={errorMessage}
          onRemoveError={() => setErrorMessage(ErrorType.NoError)}
        />
      </div>
    </div>
  );
};
