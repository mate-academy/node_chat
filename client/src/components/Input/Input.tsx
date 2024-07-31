/* eslint-disable react/prop-types */
import './Input.scss';
import { useEffect, useRef } from 'react';
import * as Types from '../../types/types';

interface Props {
  type: Types.Input,
  value: string,
  placeholder: string,
  onChange: (value: string) => void,
  onBlur?: () => void,
}

export const Input: React.FC<Props> = ({ type, value, placeholder, onChange, onBlur }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const getInputRef = () => {
    switch (type) {
      case Types.Input.Login:
      case Types.Input.RoomRename:
        return inputRef;
      default:
        return null;
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <input
      ref={getInputRef()}
      required
      type='text'
      placeholder={placeholder}
      className={`inp inp__${type}`}
      value={value}
      onChange={event => onChange(event.target.value)}
      onBlur={onBlur}
    />
  );
};
