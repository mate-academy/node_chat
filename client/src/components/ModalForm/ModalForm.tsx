import React from 'react';
import './ModalForm.scss';

import { Error } from '../../types/error';

type Props = {
  error: Error;
  setError: (error: Error | null) => void;
};

export const ModalForm: React.FC<Props> = ({ error, setError }) => {
  return (
    <div className="modalError modalError--active">
      <div className="modalError__blur"></div>
      <div className="modalError__wrapper">
        <div className="modalError__modal">
          <h2 className="modalError__title">Error</h2>
          <p className="modalError__text">
            {error?.message || 'Unknown error'}
          </p>
          <button
            className="modalError__button button"
            onClick={() => setError(null)}
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};
