import React, { useRef, useState } from 'react';
import './CreateRoomFrom.scss';
import { useAppDispatch, useAppSelector } from '../../../redux/custom.hooks.ts';
import { initCreateRoom } from '../../../redux/slices/roomSlice.ts';
import { selectUser } from '../../../redux/slices/userSlice.ts';
import { CreateRoomDto } from '../../../types/room.ts';

interface Props {
  setStatusForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreateRoomFrom: React.FC<Props> = ({ setStatusForm }) => {
  const [nameRoom, setNameRoom] = useState('');
  const { user } = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (user) {
      const newRoom: CreateRoomDto = {
        name: nameRoom,
        createByUserId: user.id,
      };

      dispatch(initCreateRoom(newRoom)).then(() => {
        if (formRef && formRef.current) {
          formRef.current?.reset();
        }
      });
    }

    setStatusForm(false);
  };

  return (
    <form
      ref={formRef}
      onSubmit={(event) => handleSubmit(event)}
      className="CreateFrom"
      method="post"
    >
      <label className="CreateFrom__label" htmlFor="name__room">
        Enter room name:
      </label>

      <input
        onChange={(event) => setNameRoom(event.target.value)}
        className="CreateFrom__input"
        id="name__room"
        type="text"
        minLength={4}
        maxLength={16}
      />

      <div className="CreateForm__buttons">
        <button className="CreateFrom__buttons__button" type="submit">
          create
        </button>

        <button
          className="CreateFrom__buttons__button"
          onClick={() => setStatusForm(false)}
        >
          cancel
        </button>
      </div>
    </form>
  );
};
