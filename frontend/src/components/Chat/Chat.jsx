import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addMessage, getChat, postMessage } from '../../features/chat/chatSlice';
import './chat.css';
import classnames from 'classnames';
import socket from '../../utils/socket';
import { getNameRoom } from '../../services/getNameRoom';
import { getTime } from '../../services/getTime';

export function Chat() {
  const messagesEndRef = useRef(null);
  const { idRoom } = useParams();
  const userState = useSelector(state => state.user);
  const {rooms} = useSelector(state => state.rooms);
  const { chat } = useSelector(state => state.chat);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(getChat(idRoom));
    socket.emit('joinRoom', idRoom);

    socket.on('newMessage', (newMessage) => {
      dispatch(addMessage(newMessage));
    })

    return  () => {
      socket.emit('leaveRoom', idRoom);
      socket.off('newMessage');
    }
  }, [dispatch, idRoom]);

  useEffect(() => {
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chat]);

  function handlerBackClick() {
    navigate(-1);
  }

  async function handlerMessageSubmit(e) {
    e.preventDefault();

    if (!message.trim()) return;

    const data = {
      idRoom,
      idUser: userState.user.id,
      message,
    };

    socket.emit('sendMessage', data);
    setMessage('')
  }

  return (
    <div className='container-rooms'>
      <button
        className='back'
        onClick={handlerBackClick}
      >
        &larr;
      </button>
      <h1>room - {getNameRoom(rooms, idRoom)}</h1>

      <div className='container-rooms'>
        <div className='container-rooms overflow'  ref={messagesEndRef}>
          <ul className='list-of-messages'>
            {chat.map(({ id, message, user, createdAt }) => (
              <li key={id} className={classnames({
                'message-right': userState.user?.id === user?.id
              })}>
                <div className='message'>
                  <p>{message}</p>
                  <span className='author'>{user.username}</span>
                  <span className='time'>{getTime(createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        <form
            className='form-add-room form-full'
            onSubmit={handlerMessageSubmit}
          >
            <input
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              type="text"
              placeholder='message'
            />

            <button
              type='submit'
              className='btn-action add'
            >send</button>
          </form>
        </div>
      </div>
    </div>
  )
};
