import React, { useState } from 'react';
import { RoomList } from '../RoomsList/RoomList.tsx';
import './Hub.scss';
import { CreateRoomFrom } from './CreateRoomForm/CreateRoomForm.tsx';

export const Hub: React.FC = () => {
  const userName = localStorage.getItem('name');
  const [statusForm, setStatusFrom] = useState(false);

  return (
    <main className="Hub">
      <div className="Hub__center">
        <h1 className="Hub__title">{`Welcome to your chatting rooms, ${userName}`}</h1>

        <div className="Hub__body">
          <h2 className="Hub__body__title">Rooms List</h2>

          <RoomList />

          {statusForm ? (
            <CreateRoomFrom setStatusForm={setStatusFrom} />
          ) : (
            <button
              onClick={() => setStatusFrom(true)}
              className="Hub__body__create-button"
            >
              create room
            </button>
          )}
        </div>
      </div>
    </main>
  );
};
