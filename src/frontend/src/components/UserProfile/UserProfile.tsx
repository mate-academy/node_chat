import { useContext } from 'react';
import style from './UserProfile.module.scss';
import { UserContext } from '../../context/UserContext';

export const UserProfile = () => {
  const { userName } = useContext(UserContext);

  return (
    <div className={style.userProfile}>
      <div className={style['userProfile__container']}>
        <div className={style['userProfile__avatar']}>
          {userName?.at(0)?.toUpperCase()}
        </div>
        <span>{userName}</span>
      </div>
    </div>
  );
};
