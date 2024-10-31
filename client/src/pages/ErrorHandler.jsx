import { useContext, useEffect } from 'react';
import { Context } from '../context/context';

export const ErrorHandler = ({ touched, error }) => {
  const { setAnyError } = useContext(Context);

  useEffect(() => {
    if (touched && error) {
      setAnyError(error);
    } else {
      setAnyError(null);
    }
  }, [touched, error, setAnyError]);

  return null;
};
