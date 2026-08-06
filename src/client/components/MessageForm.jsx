import { useState } from 'react';
import 'bulma/css/bulma.min.css';
import { MessageList } from './messagelist/MessageList';
import classNames from 'classnames';
import { useSocketHook } from '../utils/useSocketHook';
import { CreateForm } from './createForm/CreateForm';

export const MessageForm = () => {
  const [message, setMessage] = useState('');
  const [isMessage, setIsMessage] = useState(false);
  const [author, setAuthor] = useState('');
  const [isUser, setIsUser] = useState(false);

  const {
    roomCreate,
    roomSelected,
    sendMessage,
    rooms,
    rename,
    backMessages,
    deleteRoom,
    currentRoom,
    setCurrentRoom,
  } = useSocketHook();

  const handleMessage = (event) => {
    event.preventDefault();

    if (!author) {
      alert('Enter your username');
      setIsUser(true);

      return;
    }

    if (!message) {
      setIsMessage(true);

      return;
    }

    if (!currentRoom) {
      alert('Choose a room');

      return;
    }

    sendMessage(author, message);
    setMessage('');
  };

  return (
    <>
      <CreateForm
        roomCreate={roomCreate}
        roomSelected={roomSelected}
        rooms={rooms}
        rename={rename}
        deleteRoom={deleteRoom}
        currentRoom={currentRoom}
        setCurrentRoom={setCurrentRoom}
        author={author}
        setAuthor={setAuthor}
        isUser={isUser}
        setIsUser={setIsUser}
      />
      <MessageList messages={backMessages} />
      <form className="form__message" onSubmit={handleMessage}>
        <div className="field">
          <div className="form__control">
            <input
              value={message}
              onChange={(event) => {
                const value = event.target.value;

                setMessage(value);

                if (value) {
                  setIsMessage(false);
                }
              }}
              className={classNames('input', { 'is-danger': isMessage })}
              type="text"
              placeholder="Enter a message"
            />
            <button type="submit" className="button is-link">
              Send message
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
