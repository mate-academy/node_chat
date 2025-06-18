import { Menu } from '../../components/Menu/Menu';
import { Room } from '../../components/Room/Room';
import styles from './HomePage.module.scss';

export const HomePage = () => {
  return (
    <div className={styles.home}>
      <Menu />

      <Room />
    </div>
  );
};
