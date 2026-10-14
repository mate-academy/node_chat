import type React from 'react';
import { Icon } from '../../Icon/Icon';
import style from './RoomModal.module.scss';

type Props = {
  inputValue: string;
  error: string;
  placeholder: string;
  label: string;
  title: string;
  closeModal: () => void;
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => void;
  handleCreate: () => void;
};

export const RoomModal: React.FC<Props> = ({
  inputValue,
  error,
  closeModal,
  handleChange,
  handleCreate,
  placeholder,
  label,
  title
}) => {
  return (
    <div className={style.roomModal}>
      <div className={style.roomModal__top}>
        <h2 className={style.roomModal__title}>{title}</h2>
        <button className={style.roomModal__iconContainer} onClick={closeModal}>
          <Icon className={style.roomModal__icon} nameIcon="close" />
        </button>
      </div>

      <div className={style.roomModal__containerImput}>
        <label htmlFor="roomName">{error || label}</label>
        <input
          className={style.roomModal__input}
          id="roomName"
          type="text"
          value={inputValue}
          onChange={handleChange}
          name="roomName"
          placeholder={placeholder}
        />
      </div>
      <div className={style.roomModal__buttons}>
        <button
          className={`${style.roomModal__button} ${style['roomModal__button--cancel']}`}
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          className={`${style.roomModal__button} ${style['roomModal__button--create']}`}
          onClick={handleCreate}
        >
          Save
        </button>
      </div>
    </div>
  );
};
