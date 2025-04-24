import React from 'react';
import classNames from 'classnames';
import { Loader } from '../Loader';

interface Prop {
  isActive?: boolean;
}
export const ModalLoader: React.FC<Prop> = ({ isActive = true }) => {
  return (
    <div
      className={classNames('modal', {
        'is-active': isActive,
      })}
    >
      <div className="modal-background"></div>
      <div className="modal-content" style={{ height: '200px' }}>
        <Loader />
      </div>
    </div>
  );
};
