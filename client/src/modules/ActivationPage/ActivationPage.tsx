import { Box, Container, Heading } from 'react-bulma-components';
import { useLocation } from 'react-router-dom';
import { activateUser } from '../../api/auth/activateUser';
import { useEffect, useState } from 'react';

export const ActivationPage = () => {
  const [status, setStatus] = useState<boolean | undefined>();
  const location = useLocation();
  const token = location.pathname.split('/').slice(-1)[0];
  useEffect(() => {
    const activate = async () => {
      await activateUser(token);

      setStatus(true);
    };

    activate().catch((error) => {
      setStatus(false);
      // eslint-disable-next-line no-console
      console.error('Error activating user:', error);
    });
  }, [token]);

  return (
    <Container>
      <Box className="p-5 m-5">
        {status ? (
          <Heading size={5} className="has-text-success">
            Acount successfully activated
          </Heading>
        ) : (
          <Heading size={5} className="has-text-danger">
            Acount was not activated, please register again or contact
            administrators
          </Heading>
        )}
      </Box>
    </Container>
  );
};
