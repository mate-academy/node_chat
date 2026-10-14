import React from 'react';
import style from './ChatInfo.module.scss';
import type { Room } from '../../type/Room';
import { Icon } from '../Icon/Icon';

type Props = {
  currentRoom: Room | null;
};

export const ChatInfo: React.FC<Props> = ({ currentRoom }) => {
  return (
    <div className={style.chatInfo}>
      {currentRoom && (
        <>
          <div className={style['chatInfo__name']}>
            <Icon nameIcon="iconTag" className={style.chatInfo__icon} />
            {currentRoom.roomName}
          </div>
          <span
            className={style['chatInfo__numbers']}
          >{`${currentRoom?.users.length} numbers`}</span>
        </>
      )}
    </div>
  );
};
