import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AuthContext } from '../contexts/AuthContext.js';
import { Loader } from '../components/Loader.js';

export const EmailConfirmationPage = () => {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const { confirmEmail } = useContext(AuthContext);
  const { emailToken } = useParams();

  useEffect(() => {
    if (!emailToken) {
      setError('Wrong email confirmation link');
      setDone(true);

      return;
    }

    confirmEmail(emailToken)
      .catch((err) => {
        setError(
          err.response?.data?.message || 'Wrong email confirmation link',
        );
      })
      .finally(() => {
        setDone(true);
      });
  }, []);

  if (!done) {
    return <Loader />;
  }

  return (
    <>
      <h1 className="title">Email confirmation</h1>

      {error ? (
        <p className="notification is-danger is-light">{error}</p>
      ) : (
        <p className="notification is-success is-light">
          Your email has been successfully changed
        </p>
      )}
    </>
  );
};
