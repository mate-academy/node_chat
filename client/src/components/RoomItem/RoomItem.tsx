/* eslint-disable react/prop-types */
import './RoomItem.scss';
import classNames from 'classnames';
import { Button } from '../Button/Button';
import * as Types from '../../types/types';

interface Props {
  room: Types.Room,
  selectedRoom: Types.Room | null,
  author: Types.User | null,
  onClick: (roomToSelect: Types.Room) => void,
}

export const RoomItem: React.FC<Props> = ({ room, selectedRoom, author, onClick }) => (
  <li
    className={classNames('room', {
      'room__selected': room.id == selectedRoom?.id,
      'room__no-display': !author,
    })}
    onClick={() => onClick(room)}
  >
    <Button type={Types.Button.Room} />
    <h1 className="room__name">{room.name}</h1>
  </li>
)
