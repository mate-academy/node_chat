import { ChatContext } from '@/context/ChatContext';
import { FormContainer } from '@/UI/FormContainer';
import { SubmitButton } from '@/UI/SubmitButton';
import { TextField } from '@mui/material';
import { ChangeEvent, FormEvent, useContext, useState } from 'react';

export const ChatForm = () => {
  const [name, setName] = useState('');

  const { createChat } = useContext(ChatContext);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    createChat(name);
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

      <SubmitButton title='Create Room' />
    </FormContainer>
  );
};
