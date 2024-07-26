import React, { useEffect, useState } from 'react';
import { Room } from '../../types/room';
import { useAppDispatch, useAppSelector } from '../../redux/custom.hooks.ts';
import {
  initCreateMessage,
  initMessage,
  selectMessage,
} from '../../redux/slices/messageSlice.ts';
import { setSelectRoom } from '../../redux/slices/roomSlice.ts';
import './ChattingRoom.scss';
import { CreateMessageI } from '../../types/message.ts';
import { selectUser } from '../../redux/slices/userSlice.ts';
import { ChattingTale } from './ChattingTale/ChattingTale.tsx';

interface Props {
  room: Room;
}

export const ChattingRoom: React.FC<Props> = ({ room }) => {
  const [textMessage, setTextMessage] = useState('hi');
  const { messages: message } = useAppSelector(selectMessage);
  const { user } = useAppSelector(selectUser);

  const dispatch = useAppDispatch();

  const filteredMEssage = message.filter(
    (message) => message.roomId === room.id,
  );

  useEffect(() => {
    dispatch(initMessage());
    console.log(message);
  }, []);

  const handleSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newMessage: CreateMessageI = {
      content: textMessage,
      roomId: room.id,
      senderId: user!.id,
    };

    dispatch(initCreateMessage(newMessage));
  };

  return (
    <div className="ChattingRoom">
      <div className="ChattingRoom__center">
        <h1 className="ChattingRoom__title">Chat</h1>
        <button
          onClick={() => dispatch(setSelectRoom(null))}
          className="ChattingRoom__close"
        >
          X
        </button>

        <section className="ChattingRoom__message">
          {filteredMEssage.map((message) => (
            <ChattingTale key={message.id} message={message} user={user!} />
          ))}
        </section>

        <form
          onSubmit={(event) => {
            handleSubmitForm(event);
          }}
          action=""
          className="ChattingRoom__form"
        >
          <div className="Chatting__from__center">
            <label htmlFor="send-message" className="ChattingRoom__form__label">
              Write your massage here:
            </label>

            <div className="ChattingRoom__form__button">
              <input
                id="send-message"
                maxLength={500}
                type="text"
                className="ChattingRoom__form__button__input"
              />
              <button type="submit" className="ChattingRoom__form__button">
                send
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
