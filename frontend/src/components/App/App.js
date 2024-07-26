import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/custom.hooks.ts';
import { selectRooms } from '../../redux/slices/roomSlice.ts';
import { selectUser } from '../../redux/slices/userSlice.ts';
import { AuthUser } from '../AuthUser/AuthUser.tsx';
import { ChattingRoom } from '../ChattingRoom/ChattingRoom.tsx';
import { Hub } from '../Hub/Hub.tsx';
import './App.scss';
import { SERVER_URL } from '../../utils/const.js';
import { selectMessage, setMessage } from '../../redux/slices/messageSlice.ts';

function App() {
  const { responseUser } = useAppSelector(selectUser);
  const { selectedRoom } = useAppSelector(selectRooms);
  const { messages } = useAppSelector(selectMessage);
  const dispatch = useAppDispatch();
  const socket = useRef();

  useEffect(() => {
    socket.current = new WebSocket(`${SERVER_URL}`);

    socket.current.onopen = () => {};

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      dispatch(setMessage([...messages, message]));
      console.log(messages);
    };
  });

  if (selectedRoom) {
    return <ChattingRoom room={selectedRoom} />;
  }

  return <div className="App">{!responseUser ? <AuthUser /> : <Hub />}</div>;
}

export default App;
