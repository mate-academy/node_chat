import { useState } from "react";
import './CreateRoom.modal.scss';

type Props = {
  onCreateRoom: (roomName: string) => void;
  onClose: () => void;
};

export const CreateRoomModal = ({ onCreateRoom, onClose }: Props) => {
  const [draftRoomName, setDraftRoomName] = useState('');

  return (
    <div className="overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal-window">
        <h2 className="modal__title">Create Room</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const roomName = draftRoomName.trim();
          if (roomName) {
            onCreateRoom(roomName);
          }
        }}>
          <input type="text" className="modal__input" placeholder="Room Name" value={draftRoomName} onChange={(e) => setDraftRoomName(e.target.value)} />
          <button className="modal__button" type="submit">
            Create
          </button>
          <button className="modal__button" type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div >
  )
}
