// eslint-disable-next-line
import type React from 'react';
import icons from '../../icons/icons.svg';

type Props = {
  className: string;
  nameIcon: string;
};

export const Icon: React.FC<Props> = ({ className, nameIcon }) => {
  return (
    <svg className={className}>
      <use href={`${icons}#${nameIcon}`}></use>
    </svg>
  );
};
