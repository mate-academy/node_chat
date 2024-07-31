/* eslint-disable react/prop-types */
import './SecureComponent.scss';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { User } from '../../types/types';

interface Props { author: User | null }

export const SecureComponent: React.FC<Props> = ({ author }) => {
  const [status, setStatus] = useState(false);

  useEffect(() => setStatus(!!author), [author]);

  const secureStyles = classNames('secure', {
    'secure__hidden': status,
    'secure__no-display': status,
  });

  return <li className={secureStyles} />;
};
