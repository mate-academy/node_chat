import { useEffect } from 'react';
import './App.css';
import { Chat } from './components/Chat';
import {FormInputName} from './components/FormInputName';
import {Rooms} from './components/Rooms';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { getUser } from './features/user/userSlice';
import { getRooms } from './features/rooms/roomsSlice';

function App() {
  const userState = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
    dispatch(getRooms());
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Routes>
          <Route path="/" element={
            <FormInputName userState={userState} />
          } />

          <Route
            path="/rooms"
            element={<Rooms user={userState.user} userLoading={userState.loading} />}
          />

          <Route
            path="/chat/:idRoom"
            element={<Chat />}
          />
        </Routes>
      </header>
    </div>
  );
}

export default App;
