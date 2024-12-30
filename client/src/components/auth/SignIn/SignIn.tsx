import { ChangeEvent, FormEvent, ReactNode, useContext, useState } from 'react';

import { TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { SubmitButton } from '@/UI/SubmitButton';
import { FormContainer } from '@/UI/FormContainer';
import { UserContext } from '@/context/UserContext';

const SignIn = (): ReactNode => {
  const [name, setName] = useState('');

  const { handleSignIn } = useContext(UserContext);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleSignIn(name).then(() => setName(''));
  };

  return (
    <FormContainer handleSubmit={handleSubmit}>
      <TextField
        label='Name'
        name='name'
        autoFocus
        size='medium'
        type='text'
        required
        fullWidth
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setName(e.target.value);
        }}
      />
      <SubmitButton title='Sign In' />
      <p style={{ margin: '0' }}>OR</p>

      <Link
        to='/signup'
        style={{ textDecoration: 'none', color: '#1976d2', textTransform: 'uppercase', fontWeight: 'bold' }}
      >
        Sign Up
      </Link>
    </FormContainer>
  );
};

export default SignIn;
