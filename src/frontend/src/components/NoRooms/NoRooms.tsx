import { Icon } from '../Icon/Icon';
import style from './NoRooms.module.scss';

export const NoRooms = () => {
  return (
    <div className={style.noRooms}>
      <div className={style['noRooms__container']}>
        <Icon className={style['noRooms__icon']} nameIcon='chat' />
      </div>
      <h2 className={style['noRooms__title']}>Welcome to chat</h2>
       <p className={style['noRooms__info']}>Create a room or join an existing one to start a conversation</p>
    </div>
  )
}
