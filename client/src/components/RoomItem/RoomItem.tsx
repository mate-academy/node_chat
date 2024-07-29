// @ts-ignore
import deleteIcon from '../../images/delete.png';
// @ts-ignore
import editIcon from '../../images/edit.png';

import React, { useEffect, useState } from "react";
import classNames from "classnames";
import './RoomItem.scss';
import { Message } from '../../types/types';
import axios from 'axios';
import { SERVER_API } from '../../constants/constants.ts';

type Props = {
  roomId: number,
  userId: number,
  roomName: string,
  isSelected: boolean;
  hasRights: boolean;
  onClick: (roomId: number, userId: number, name: string) => void;
  deleteRoom: (roomId: number) => void;
  renameRoom: (roomId: number, newRoomName: string) => void;
}

export const RoomItem: React.FC<Props> = ({
  roomId,
  userId,
  roomName,
  isSelected,
  hasRights,
  onClick,
  deleteRoom,
  renameRoom,
}) => {

  const [isEditing, setIsEditing] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

  const handleRenameRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    renameRoom(roomId, newRoomName);
    setIsEditing(false);
    setNewRoomName('')
  }

  useEffect(() => {
    const fetchLastMessage = async () => {
      try {
        const response = await axios.post(`${SERVER_API}/message/last`, { roomId });
        setLastMessage(response.data);
      } catch (error) {
        console.error('Failed to fetch last message:', error);
        setLastMessage(null);
      }
    };

    fetchLastMessage();
  }, [roomId, setLastMessage]);

  return (
    <div
      className={classNames('room', {
        'room__selected': isSelected,
      })}
      onClick={() => onClick(roomId, userId, roomName)}
    >
      <div className='room__left'>
        <div className="room__icon">{roomName.slice(0, 2).toUpperCase()}</div>
        <div className="room__block">
          {!isEditing ? (
            <div className="room__block--name">{roomName}</div>
          ) : (
            <form
              className='room__block--nameChangeForm'
              onSubmit={(e) => handleRenameRoom(e)}
            >
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder='New Room Name'
                className='room__block--nameChange'
              />
              <button
                className='room__block--nameChangeButton'
              >
                RENAME
              </button>
            </form>
          )}
          <div className="room__block--lastMessage">{lastMessage?.messageText}</div>
        </div>
      </div>
      {(isSelected && hasRights) && (
        <div className='room__delete'>
          <img
            src={editIcon}
            alt="editIcon"
            className='room__delete--item'
            onClick={() => setIsEditing(true)}
          />
          <img
            src={deleteIcon}
            alt="deleteIcon"
            className='room__delete--item'
            onClick={() => deleteRoom(roomId)}
          />
        </div>
      )}
    </div>
  );
};