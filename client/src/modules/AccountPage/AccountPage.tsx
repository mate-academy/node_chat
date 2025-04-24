import { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { getUserData } from '../../api/users/users';
import { Box, Container, Heading } from 'react-bulma-components';
import { ModalLoader } from '../../components/ModalLoader';
import { ModalError } from '../../components/ModalError';

interface UserData {
  id: number;
  userName: string;
  email: string;
}

export const AccountPage = () => {
  const state = useAppSelector((state) => state.auth);
  const userId: number | undefined = state?.user?.id;
  const token: string | undefined = state?.accessToken;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [userData, setUserData] = useState<UserData | undefined>();

  useEffect(() => {
    setLoading(true);
    getUserData(userId as number, token as string)
      .then((res: { data: UserData }) => {
        setUserData(res.data);
      })
      .catch((err: { message?: string }) => {
        setError(err?.message as string);
      })
      .finally(() => setLoading(false));
  }, [token, userId]);

  return (
    <>
      <ModalLoader isActive={loading} />

      <ModalError
        title="Error"
        body={error ?? 'Unexpected Error'}
        isActive={!!error}
        onClose={() => setError('')}
      />
      <Container className="p-5">
        <Heading className="has-text-centered">User Information</Heading>
        <Box>
          <Heading subtitle>{`ID: ${userData?.id}`}</Heading>
          <Heading subtitle>{`User name: ${userData?.userName}`}</Heading>
          <Heading subtitle>{`Email: ${userData?.email}`}</Heading>
        </Box>
      </Container>
    </>
  );
};
