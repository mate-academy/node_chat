import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Form,
  Icon,
  Button,
} from 'react-bulma-components';
import { sendResetPassword } from '../../api/auth/sendResetPassword';
import { AxiosError } from 'axios';
import { ModalLoader } from '../../components/ModalLoader';
import { ModalError } from '../../components/ModalError';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ModalSuccess } from '../../components/ModalSuccess';
import { useNavigate } from 'react-router-dom';
import {
  type AxiosErrorResponse,
  type ResetPasswordResponse,
} from '../../types/passwords';

export const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    sendResetPassword(email)
      .then((res: ResetPasswordResponse) => {
        if (res.status === 200) {
          setSuccess(true);
        } else {
          setError('Uknown error occured');
        }
      })
      .catch((err: AxiosError & AxiosErrorResponse) => {
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

      <ModalSuccess
        title="Success"
        body="Reset link was sent."
        isActive={success}
        onClose={() => {
          navigate('/');
        }}
      />

      <Container className="m-5">
        <Box>
          <Heading subtitle>Enter email to reset password</Heading>
          <form
            method="POST"
            onSubmit={(e) => handleSubmit(e)}
            id="resetPassword"
          >
            <Form.Field>
              <Form.Label>Password</Form.Label>
              <Form.Control>
                <Form.Input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.smith@email.com"
                  type="email"
                />

                <Icon align="left" size="small">
                  <FontAwesomeIcon icon={faEnvelope} />
                </Icon>
              </Form.Control>
            </Form.Field>

            <Form.Field>
              <Form.Control>
                <Button type="submit" form="resetPassword" color="grey-light">
                  Send Reset Email
                </Button>
              </Form.Control>
            </Form.Field>
          </form>
        </Box>
      </Container>
    </>
  );
};
