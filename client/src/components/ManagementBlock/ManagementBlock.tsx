/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/prop-types */
import './ManagementBlock.scss';
import * as Types from '../../types/types';
import { useState } from 'react';
import { SecureComponent } from '../SecureComponent/SecureComponent';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { RoomItem } from '../RoomItem/RoomItem';
// import { API_URL } from '../../constants/constants';
// import axios from 'axios';
import { requestCreator } from '../../service/service';

interface Props {
  author: Types.User | null,
  rooms: Types.Room[],
  selectedRoom: Types.Room | null,
  setRooms: (value: React.SetStateAction<Types.Room[]>) => void,
  setSelectedRoom: (value: Types.Room) => void,
  setRoomIsChanging: React.Dispatch<React.SetStateAction<boolean>>,
  setNewNameOfRoom: (value: string) => void,
  setNewMessageText: (value: string) => void,
  onLogout: () => void,
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>,
}

export const ManagementBlock: React.FC<Props> = ({
  author,
  rooms,
  selectedRoom,
  setRooms,
  setSelectedRoom,
  setRoomIsChanging,
  setNewNameOfRoom,
  setNewMessageText,
  onLogout,
  setRefresh,
}) => {
  const [newRoomName, setNewRoomName] = useState('');

  const handleLogout = () => {
    setNewRoomName('');

    requestCreator({
      type: Types.RequestType.Logout,
      actions: { onLogout },
      body: { user: author },
      errorText: Types.RequestError.Logout,
    });
  };

  const handleCreateRoom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newRoomName.trim()) {
      setNewRoomName('');

      return;
    }

    requestCreator({
      type: Types.RequestType.RoomCreate,
      actions: { setRooms, setNewRoomName },
      body: { userId: author?.id, name: newRoomName.trim() },
      errorText: Types.RequestError.RoomCreate,
    });
  };

  const handleSelectRoom = (roomToSelect: Types.Room) => {
    setSelectedRoom(roomToSelect);
    setNewNameOfRoom(roomToSelect.name);
    setRoomIsChanging(false);
    setNewMessageText('');
  };

  const refreshRooms = () => setRefresh(prevRefresh => !prevRefresh);

  return (
    <section className='magagement'>
      <article className="magagement__user-block">
        <h1 className="magagement__user-block--title">{author ? author.name : 'Author name'}</h1>

        <Button type={Types.Button.Logout} onCLick={handleLogout} />
      </article>

      <article className="magagement__line" />

      <form className="magagement__creator" onSubmit={handleCreateRoom}>
        <div className="magagement__creator--top">
          <h1 className="magagement__creator--title">Ваші чати:</h1>

          <div className="magagement__creator--buttons">
            <Button type={Types.Button.Refresh} onCLick={refreshRooms} />
            <Button type={Types.Button.Create} />
          </div>
        </div>

        <Input
          type={Types.Input.RoomCreate}
          value={newRoomName}
          placeholder={Types.PlaceHolder.RoomCreate}
          onChange={setNewRoomName}
        />
      </form>

      <ul className='magagement__rooms'>
        <SecureComponent author={author} />

        {rooms.map(room => (
          <RoomItem
            key={room.id}
            room={room}
            selectedRoom={selectedRoom}
            author={author}
            onClick={handleSelectRoom}
          />
        ))}
      </ul>
    </section>
  );
}
