import React, { useState } from 'react';
import { Box, Button, Form, Heading, Icon } from 'react-bulma-components';
import { ModalError } from '../../components/ModalError';
import { Link, useNavigate } from 'react-router-dom';
import { ModalLoader } from '../../components/ModalLoader';
import { userLogin } from '../../api/auth/userLogin';
import { AxiosError } from 'axios';
import { useAppDispatch } from '../../app/hooks';
import * as authActions from '../../features/authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { type LoginCredentials, type LoginResponse } from '../../types/login';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const credentials: LoginCredentials = { userName, password };
    userLogin(credentials)
      .then((res: LoginResponse) => {
        dispatch(authActions.actions.loginSuccess(res.data));
        navigate('/account');
      })
      .catch((err: unknown) => {
        if (err instanceof AxiosError) {
          setError(
            typeof err.response?.data?.message === 'string'
              ? String(err.response?.data?.message)
              : 'Unexpected Error Occurred'
          );
        } else {
          setError('Unexpected Error Occured');
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      <ModalLoader isActive={!!loading} />

      <ModalError
        title="Error"
        body={error}
        isActive={!!error}
        onClose={() => setError('')}
      />

      <Box
        backgroundColor="primary"
        style={{ width: 400 }}
        className="form mx-auto my-6"
      >
        <Heading className="">Please Log in.</Heading>

        <form method="POST" onSubmit={(e) => handleSubmit(e)} id="logInForm">
          <Form.Field>
            <Form.Label>Username</Form.Label>
            <Form.Control>
              <Form.Input
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. John Doe"
                type="text"
              />

              <Icon align="left" size="small">
                <FontAwesomeIcon icon={faUser} />
              </Icon>
            </Form.Control>
          </Form.Field>

          <Form.Field>
            <Form.Label>Password</Form.Label>
            <Form.Control>
              <Form.Input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                type="password"
              />

              <Icon align="left" size="small">
                <FontAwesomeIcon icon={faLock} />
              </Icon>
            </Form.Control>
          </Form.Field>

          <Form.Field>
            <Form.Control className="is-flex mt-6">
              <Button type="submit" form="logInForm">
                Login
              </Button>

              <Link to="/password-reset" className="ml-auto">
                Reset password
              </Link>
            </Form.Control>
          </Form.Field>
        </form>
      </Box>
    </>
  );
};
