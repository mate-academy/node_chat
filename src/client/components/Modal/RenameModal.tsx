import { useNavigate } from 'react-router-dom';

import { Fields } from '../../types/Fields';
import { roomService } from '../../services/roomService';
import { SubmitCallback } from '../../types/SubmitCallback';
import { catchError } from '../../utils/catchError';
import { useError } from '../ErrorContext';
import { useChat } from '../ChatContext';

import { FormTemplate } from '../FormTemplate';

const fields = {
  roomName: { type: 'text', label: 'New name' },
} as Fields;

export const RenameModal = () => {
  const navigate = useNavigate();
  const { selectedRoom } = useChat();
  const { setError } = useError();

  const handleSubmit: SubmitCallback = async ({ roomName }, formikHelpers) => {
    formikHelpers.setSubmitting(true);

    roomService
      .renameRoom(selectedRoom?.id || '', roomName)
      .then(({ id }) => {
        navigate(`/rooms/${id}`);
      })
      .catch((e) => catchError(e, setError))
      .finally(() => formikHelpers.setSubmitting(false));
  };

  return (
    <div className="rename_box">
      <FormTemplate
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonName="Rename"
        formTitle={{ text: 'Rename room', size: 4 }}
        cancelCallback={() => navigate(`/rooms/${selectedRoom?.id}/settings`)}
      />
    </div>
  );
};
