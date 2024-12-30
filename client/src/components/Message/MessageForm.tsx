import { sendMessage } from '@/api/messages.api';
import { UserContext } from '@/context/UserContext';
import { SubmitButton } from '@/UI/SubmitButton';
import { Box, TextField } from '@mui/material';
import { ChangeEvent, FC, FormEvent, useContext, useState } from 'react';

interface Props {
  roomId: string;
}

export const MessageForm: FC<Props> = ({ roomId }) => {
  const [text, setText] = useState('');
  const { user } = useContext(UserContext);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !text.trim()) return;

    const { name, id } = user;

    sendMessage({ userName: name, text, userId: id, roomId });
    setText('');
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit}
      sx={{ display: 'flex', maxWidth: '100%', columnGap: '1rem', m: 'auto 0 2rem' }}
    >
      <TextField
        name='message'
        sx={{ flexBasis: '400%' }}
        autoFocus
        size='small'
        type='text'
        required
        value={text}
        fullWidth
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setText(e.target.value);
        }}
      />
      <SubmitButton title='Send ' />
    </Box>
  );
};
