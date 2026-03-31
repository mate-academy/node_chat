import { useNavigate } from 'react-router-dom';

import { roomService } from '../../services/roomService';
import { catchError } from '../../utils/catchError';
import { useError } from '../ErrorContext';
import { useChat } from '../ChatContext';

export const DeleteModal = () => {
  const navigate = useNavigate();
  const { selectedRoom } = useChat();
  const { setError } = useError();

  const handleDeleteRoom = () => {
    roomService
      .deleteRoom(selectedRoom?.id || '')
      .then(() => {
        navigate('/rooms');
      })
      .catch((e) => catchError(e, setError));
  };

  return (
    <>
      <p className="subtitle">Do you really want to delete the room?</p>
      <div className="buttons">
        <button
          className="button is-danger is-dark is-outlined"
          onClick={handleDeleteRoom}
        >
          Yes
        </button>
        <button
          className="button is-success is-dark"
          onClick={() => navigate(`/rooms/${selectedRoom?.id}/settings`)}
        >
          No
        </button>
      </div>
    </>
  );
};
