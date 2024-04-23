import { useEffect, useState } from "react";
import { clearUnreadMessages, getUnread as getUnreadMessage, readMessages } from "../../../../entities/Message";
import { readAll as readAllMessages } from '../../../../entities/Message';
import { useAppDispatch, useAppSelector } from "../../../../shared/hooks/reduxHooks";

export const Notifications = () => {
  const dispatch = useAppDispatch();
  const { currentChat, chats } = useAppSelector(state => state.chats)
  const { unreadMessages } = useAppSelector(state => state.messages)
  const { user } = useAppSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const chatIds = chats.map(el => el.id)

    dispatch(getUnreadMessage({ userId: user.id, chatIds: chatIds }))
  }, [user, chats]);

  useEffect(() => {
    if (!currentChat) return;

    dispatch(readMessages(currentChat.id))
  }, [currentChat])

  const handleClick = () => {
    if (!user) return;

    const userId = user?.id;
    const userChats = chats.map(({ id, ...rest }) => id)

    readAllMessages(userId, userChats)
      .then(() => dispatch(clearUnreadMessages()))
      .catch(err => console.log(err));
  }

  return (
    <div className="notifications">
      <div className="notifications-icon" onClick={() => setIsOpen(!isOpen)}>
        <img src="icons/notification.svg" alt="notification" />
        {!!unreadMessages.length && (
          <span className="notification-count">{unreadMessages.length}</span>
        )}
      </div>
      {isOpen && (
        <div className="notifications-box">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="mark-as-read" onClick={() => handleClick()}>Mark all as read</div>
          </div>
        </div>
      )}
    </div>
  );
}