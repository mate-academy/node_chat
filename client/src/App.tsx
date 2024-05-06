import React, { useEffect, useState } from 'react';
import './App.scss';
import { AuthorForm } from './components/AuthForm/AuthForm';
import { LogoutForm } from './components/LogoutForm/LogoutForm';
import { RoomPage } from './components/RoomsPage/RoomPage';
import { ChatPage } from './components/ChatPage/ChatPage';
import { ModalForm } from './components/ModalForm/ModalForm';
import { API_URL } from './utils/config';
import { User } from './types/user';
import { Room } from './types/room';
import { Error } from './types/error';
import axios from 'axios';

export const App: React.FC = () => {
  const [selectedRoom, setSelectRoom] = useState<Room | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const authorFromStorage = localStorage.getItem('author');

    if (authorFromStorage) {
      setAuthor(JSON.parse(authorFromStorage));
    } else {
      setAuthor(null);
    }
  }, []);

  const login = (user: User) => {
    setAuthor(user);
    setError(null);
    setSelectRoom(null);
  };

  const handleSelectRoom = (room: Room | null) => {
    if (room === null) {
      setSelectRoom(null);

      return;
    }

    axios
      .get(`${API_URL}room/getRoom/${room.id}`)
      .then((roomFromServer: any) => {
        setSelectRoom(roomFromServer.data as Room);
      })
      .catch((serverError: any) => {
        setError(serverError.response.data.errors);
      })
      .finally(() => {
        setRefresh(currentRefresh => !currentRefresh);
      });
  };

  const logout = () => {
    setAuthor(null);
    setError(null);
    localStorage.removeItem('author');
  };

  return (
    <>
      {author === null ? (
        <AuthorForm send={login} />
      ) : (
        <>
          <section className="section">
            <LogoutForm logout={logout} author={author} />
            <div className="section__block">
              <RoomPage
                setSelectRoom={handleSelectRoom}
                selectedRoom={selectedRoom}
                author={author}
                refresh={refresh}
                setRefresh={setRefresh}
              />
              <ChatPage
                author={author}
                setSelectRoom={handleSelectRoom}
                selectedRoom={selectedRoom}
                setRefresh={setRefresh}
                setError={setError}
              />
            </div>
          </section>
        </>
      )}
      {error && <ModalForm error={error} setError={setError} />}
    </>
  );
};
