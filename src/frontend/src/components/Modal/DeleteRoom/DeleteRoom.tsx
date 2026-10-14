import type React from 'react';
import { Icon } from '../../Icon/Icon';
import style from './DeleteRoom.module.scss';

type Props = {
  closeModal: () => void,
  handleDeleteRoom: () => void,
}

export const DeleteRoom: React.FC<Props> = ({closeModal, handleDeleteRoom}) => {
  return (
    <div className={style.roomDel}>
      <div className={style.roomDel__top}>
        <h2 className={style.roomDel__title}>Delete room</h2>
        <button className={style.roomDel__iconContainer} onClick={closeModal}>
          <Icon className={style.roomDel__icon} nameIcon="close" />
        </button>
      </div>

      <span>Are you sure you want to delete this room? This action cannot be undone.</span>

      <div className={style.roomDel__buttons}>
        <button
          className={`${style.roomDel__button} ${style['roomDel__button--cancel']}`}
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          className={`${style.roomDel__button} ${style['roomDel__button--create']}`}
          onClick={handleDeleteRoom}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
