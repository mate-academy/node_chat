import { ChatContext } from '@/context/ChatContext';
import { Room } from '@/types/Room';
import { Box, Button, Typography } from '@mui/material';
import { FC, useContext } from 'react';
import { MessageForm } from '../Message/MessageForm';
import { MessageList } from '../Message/MessageList';

interface Props {
  chat: Room;
}

export const Chat: FC<Props> = ({ chat }) => {
  const { removeChat } = useContext(ChatContext);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Typography component='h2' sx={{ textAlign: 'center', m: '1rem' }}>
        {chat.name}
      </Typography>
      <MessageList roomId={chat.id} />
      <MessageForm roomId={chat.id} />
      <Button
        type='button'
        variant='contained'
        onClick={() => {
          removeChat(chat.id);
        }}
        sx={{ display: 'block', m: '0 auto 2rem ' }}
      >
        Delete Chat
      </Button>
    </Box>
  );
};
