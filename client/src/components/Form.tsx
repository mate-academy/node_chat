import React, { useState, type FormEvent } from 'react'
import type { Message } from '../types/Message';
import { messagesApi } from '../api';

type Props = {
  onCreate: (text: string) => void
}
const Form = ({onCreate}: Props) => {
  const [text, setText] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) =>{
    e.preventDefault();
    onCreate(text);
    setText('');
  }
  return (
    <form className='form' onSubmit={submit}>
      <input
        onChange={(e) => setText(e.target.value)}
        value={text}
        type="text"
        placeholder='Enter your message...'
        className='input'
      />
      <button className='button'>Send</button>
    </form>
  )
}

export default Form
