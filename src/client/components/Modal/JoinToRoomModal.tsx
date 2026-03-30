import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { useError } from '../ErrorContext';
import { catchError } from '../../utils/catchError';
import { useChat } from '../ChatContext';
import { Fields, FormTitle } from '../../types/Fields';
import { SubmitCallback } from '../../types/SubmitCallback';
import { roomService } from '../../services/roomService';

import { FormTemplate } from '../FormTemplate';
import { Modal } from './Modal';

const fields: { [key: string]: Fields } = {
  join: {
    roomId: { type: 'text', label: 'Room id' },
  },
  create: {
    roomName: { type: 'text', label: 'Room name' },
  },
};

const formTitles: { [key: string]: FormTitle } = {
  join: { text: 'Join to room' },
  create: { text: 'Create room' },
};

export const JoinToRoomModal = () => {
  const navigate = useNavigate();
  const { setError } = useError();
  const { currentUser } = useChat();
  const { addMode } = useParams();

  const handleSubmit: { [key: string]: SubmitCallback } = {
    join: async ({ roomId }, formikHelpers) => {
      formikHelpers.setSubmitting(true);

      roomService
        .joinToRoom(roomId, currentUser.id)
        .then(() => {
          navigate(`/rooms/${roomId}`);
        })
        .catch((e) => catchError(e, setError))
        .finally(() => formikHelpers.setSubmitting(false));
    },

    create: async ({ roomName }, formikHelpers) => {
      formikHelpers.setSubmitting(true);

      roomService
        .createRoom(roomName, currentUser.id)
        .then(({ id }) => {
          navigate(`/rooms/${id}`);
        })
        .catch((e) => catchError(e, setError))
        .finally(() => formikHelpers.setSubmitting(false));
    },
  };

  return (
    <Modal isOpen={!!addMode} onClose={() => navigate('/rooms')}>
      <div className="box modal_box has_margin_top">
        <nav
          className="navbar has-shadow"
          role="navigation"
          aria-label="main navigation"
        >
          <NavLink
            className={({ isActive }) =>
              `navbar-item ${isActive ? 'is-active' : ''}`
            }
            to={'/rooms/add/join'}
          >
            Join
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `navbar-item ${isActive ? 'is-active' : ''}`
            }
            to={'/rooms/add/create'}
          >
            Create
          </NavLink>
        </nav>

        {addMode && (
          <FormTemplate
            fields={fields[addMode]}
            onSubmit={handleSubmit[addMode]}
            submitButtonName={addMode[0].toUpperCase() + addMode.slice(1)}
            formTitle={formTitles[addMode]}
            cancelCallback={() => navigate('/rooms')}
          />
        )}
      </div>
    </Modal>
  );
};
