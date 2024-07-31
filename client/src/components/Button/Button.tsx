/* eslint-disable react/prop-types */
import * as Types from '../../types/types';
import './Button.scss';

interface Props {
  type: Types.Button,
  onCLick?: () => void,
}

export const Button: React.FC<Props> = ({ type, onCLick }) => {
  if (type === Types.Button.Login) {
    return <button className='btn__login'>Ввійти</button>;
  }

  if (type === Types.Button.Room) {
    return <div className="btn btn__room" />;
  }

  return (
    <button
      type={type === Types.Button.Refresh ? 'button' : 'submit'}
      className={`btn__container btn__container--${type}`}
      onClick={onCLick}
    >
      <div className={`btn btn__${type}`} />
    </button>
  );
};
