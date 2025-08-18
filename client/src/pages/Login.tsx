import React, { useEffect, useState, type FormEvent } from 'react'
import type { User } from '../types/User'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const userName = form.get('name') as string;

    localStorage.setItem('user', userName);
    setUser({name: userName});

    e.currentTarget.reset();
  }

  useEffect(()=>{
    if(user) {
      navigate('/rooms');
    }
  }, [user])

  return (
    <main className='main'>
      <h1>Log in</h1>

      <form onSubmit={submit} className='form'>
        <input className='input' type="text" name='name' placeholder='Your name...'/>
        <button className='button'>Create</button>
      </form>
    </main>
  )
}

export default Login
