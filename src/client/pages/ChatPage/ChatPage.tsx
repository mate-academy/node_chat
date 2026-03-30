import { Outlet } from 'react-router-dom';

import styles from './ChatPage.module.scss';

import { Rooms } from '../../components/Rooms';

export const ChatPage = () => {
  return (
    <div className={styles.chat_page}>
      <Rooms />
      <Outlet />
    </div>
  );
};
