import moment from 'moment';
import { Stack } from 'react-bootstrap';

import { User } from '../../User/types/userTypes';
import { getRecipient } from '../helpers/getRecipient';
import { ChatType } from '../types/chatTypes';
import { useAppSelector } from '../../../shared/hooks/reduxHooks';
import { truncateText } from '../helpers/truncateText';

type Props = {
  chat: ChatType;
  user: User | null;
}

export const Chat: React.FC<Props> = ({ chat, user }) => {
  const { usersOnline } = useAppSelector(state => state.socket);
  const { unreadMessages } = useAppSelector(state => state.messages);

  const recipient = getRecipient(chat, user);
  const isOnline = usersOnline.some(el => el.userId === recipient?.id);
  const unread = unreadMessages.filter(msg => msg.chatId === chat.id);
  const { lastMessage } = chat;

  return (
    <Stack
      direction='horizontal'
      gap={3}
      className='user-card align-items-center p-2 justify-content-between'
      role='button'
    >
      <div className="d-flex">
        <div className="me-2">
          <img src="user.svg" alt="user" height='40' />
        </div>
        <div className="text-content">
          <div className="name"> {recipient?.name}</div>
          {lastMessage && (
            <div className="text"> {truncateText(lastMessage.text)}</div>
          )}
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        {lastMessage && (
          <div className="date">{moment(lastMessage.date).fromNow()}</div>
        )}
        {!!unread.length && (
          <div className="this-user-notifications">{unread.length}</div>
        )}
        <span className={isOnline ? 'user-online' : ''}></span>
      </div>
    </Stack>
  )
}
