/* eslint-disable react/prop-types */
import './LoginForm.scss';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import * as Types from '../../types/types';
import { requestCreator } from '../../service/service';

interface Props {
  onLogin: (user: Types.User) => void,
}

export const LoginForm: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim()) {
      setUsername('')
      return;
    }

    requestCreator({
      type: Types.RequestType.Login,
      actions: { onLogin },
      body: { name: username.trim() },
      errorText: Types.RequestError.Login,
    });
  };

  return (
    <section className='login'>
      <form className='login__form' onSubmit={handleSubmit}>
        <h1 className='login__form--title'>Авторизація</h1>

        <Input
          type={Types.Input.Login}
          value={username}
          placeholder={Types.PlaceHolder.Login}
          onChange={setUsername}
        />

        <Button type={Types.Button.Login} />
      </form>
    </section>
  )
};
