import {
  Block,
  Box,
  Button,
  Container,
  Heading,
  Form,
  Icon,
} from 'react-bulma-components';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { AxiosError } from 'axios';
import { ModalError } from '../../components/ModalError';
import { ModalLoader } from '../../components/ModalLoader';
import { ModalSuccess } from '../../components/ModalSuccess';
import { useLocation, useNavigate } from 'react-router-dom';
import { setNewPassword } from '../../api/auth/setNewPassword';
import { type CustomAxiosError } from '../../types/customAxiosError';

const initValidErrors = {
  password: {
    message: 'Password valid',
    error: false,
    visible: false,
  },
  confirmPassword: {
    message: 'Password valid',
    error: false,
    visible: false,
  },
};

export const NewPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validError, setValidError] = useState(initValidErrors);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const token = location.pathname.split('/').slice(-1)[0];

  interface HandleSubmitEvent extends React.FormEvent<HTMLButtonElement> {}

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setNewPassword(password, confirmPassword, token)
      .then(() => {
        setValidError(() => {
          const allVisibleErrors = Object.keys(initValidErrors).reduce(
            (acc: typeof initValidErrors, key) => {
              acc[key as keyof typeof initValidErrors] = {
                ...initValidErrors[key as keyof typeof initValidErrors],
                visible: true,
              };
              return acc;
            },
            { ...initValidErrors }
          );

          return allVisibleErrors;
        });

        setSuccess('Congragulation password was updated.');
      })
      .catch((error: AxiosError | Error) => {
        setValidError(initValidErrors);

        if (error instanceof AxiosError && error.status === 422) {
          const axiosError = error as CustomAxiosError;
          if (axiosError.response?.data?.errors) {
            const errors = axiosError.response?.data?.errors;

            setValidError(initValidErrors);

            Object.values(errors).forEach((e: any) => {
              const key = e.context?.label;

              setValidError((prev) => {
                if (key in prev) {
                  return {
                    ...prev,
                    [key]: {
                      message: e.message,
                      error: true,
                      visible: true,
                    },
                  };
                }
                return prev;
              });
            });
          } else {
            setError(`An unexpected error occurred: ${error.message}`);
          }
        } else if (error instanceof AxiosError && error.status === 400) {
          const errMsg = error?.response?.data?.message;

          if (errMsg === 'Email already exist') {
            setValidError((prev) => ({
              ...prev,
              email: {
                message: 'Email already exist',
                error: true,
                visible: true,
              },
            }));
            setError('Email already exist');
          } else if (errMsg === 'User name already exist') {
            setValidError((prev) => ({
              ...prev,
              userName: {
                message: 'User name already exist',
                error: true,
                visible: true,
              },
            }));
            setError('User name already exist');
          } else {
            setError('An unexpected error occurred');
          }
        } else if (error instanceof Error) {
          setError(`An unexpected error occurred: ${error.message}`);
        } else {
          setError(`An unexpected error occurred: ${String(error)}`);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <ModalLoader isActive={loading} />

      <Container className="py-3">
        <Box className=" p-2 mx-auto" style={{ maxWidth: '500px' }}>
          <Heading size={4} className=" has-text-centered mt-2 mb-2">
            Reset Password
          </Heading>

          <Block className="p-0">
            <Form.Field>
              <Form.Label>Password</Form.Label>

              <Form.Control>
                <Form.Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Icon align="left" size="small">
                  <FontAwesomeIcon icon={faLock} />
                </Icon>

                <Form.Help
                  color={classNames({
                    success: !validError.password.error,
                    danger: validError.password.error,
                  })}
                  className={classNames({
                    'is-hidden': !validError.password.visible,
                  })}
                >
                  {validError.password.message}
                </Form.Help>
              </Form.Control>
            </Form.Field>

            <Form.Field>
              <Form.Label>Confirm password</Form.Label>

              <Form.Control>
                <Form.Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Icon align="left" size="small">
                  <FontAwesomeIcon icon={faLock} />
                </Icon>

                <Form.Help
                  color={classNames({
                    success: !validError.confirmPassword.error,
                    danger: validError.confirmPassword.error,
                  })}
                  className={classNames({
                    'is-hidden': !validError.confirmPassword.visible,
                  })}
                >
                  {validError.confirmPassword.message}
                </Form.Help>
              </Form.Control>
            </Form.Field>

            <Button onClick={handleSubmit}>Submit</Button>
          </Block>
        </Box>
      </Container>

      <ModalSuccess
        title="Success"
        body={success}
        isActive={!!success}
        onClose={() => {
          setSuccess('');
          void navigate('/login');
        }}
      />

      <ModalError title="Error" body={error} isActive={!!error} />
    </>
  );
};
