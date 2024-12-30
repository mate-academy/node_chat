import { BLACK, BLUE, LIGHT_GREY, WHITE } from '@/constants/colors';
import { UserContext } from '@/context/UserContext';
import { Message } from '@/types/Message';
import { geTime } from '@/utils/date';
import { ListItem } from '@mui/material';
import { FC, useContext } from 'react';

interface IProps {
  message: Message;
}
export const MessageItem: FC<IProps> = ({ message }) => {
  const { user } = useContext(UserContext);

  const isCurrentUser = user?.id === message.userId;

  return (
    <ListItem
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCurrentUser ? 'flex-end' : 'self-start',
        width: '48%',
        rowGap: '5px',
        backgroundColor: isCurrentUser ? BLUE : LIGHT_GREY,
        color: isCurrentUser ? WHITE : BLACK,
        marginLeft: isCurrentUser ? 'auto' : '0',
        borderRadius: '10px',
        marginBlock: '10px',
      }}
    >
      <span style={{ fontSize: '12px', color: isCurrentUser ? WHITE : BLUE, fontWeight: 'bold' }}>
        {message.userName}
      </span>
      <span style={{ alignSelf: 'flex-start' }}>{message.text}</span>
      <span style={{ fontSize: '10px', alignSelf: 'flex-end' }}>{geTime(message.createdAt)}</span>
    </ListItem>
  );
};
