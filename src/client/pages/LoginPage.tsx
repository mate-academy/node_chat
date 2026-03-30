import { useNavigate } from 'react-router-dom';

import { Fields } from '../types/Fields';
import { usernameService } from '../services/usernameService';
import { SubmitCallback } from '../types/SubmitCallback';
import { userIdService } from '../services/userIdService';
import { userService } from '../services/userService';
import { catchError } from '../utils/catchError';

import { FormTemplate } from '../components/FormTemplate';
import { useError } from '../components/ErrorContext';
import { useChat } from '../components/ChatContext';

const fields = {
  username: { type: 'text', label: 'Username' },
} as Fields;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setError } = useError();
  const { setCurrentUser } = useChat();

  const handleSubmit: SubmitCallback = async ({ username }, formikHelpers) => {
    formikHelpers.setSubmitting(true);

    userService
      .createUser(username)
      .then((user) => {
        usernameService.save(user.username);
        userIdService.save(user.id);
        setCurrentUser({ id: user.id, username: user.username });
        navigate('/rooms');
      })
      .catch((e) => catchError(e, setError))
      .finally(() => formikHelpers.setSubmitting(false));
  };

  return (
    <div className="login">
      <FormTemplate
        fields={fields}
        onSubmit={handleSubmit}
        formTitle={{ text: 'Node chat' }}
        submitButtonName="Join"
        removeCancelButton
      />
    </div>
  );
};
