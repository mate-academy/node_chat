import React, { useState } from "react"
import './Username.scss';
import { saveUser } from "../../services/userApi";
import type { User } from "../../types/User";

type Props = {
  onSet: (user: User) => void;
}


export const UsernameForm: React.FC<Props> = ({ onSet }) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      return;
    }

    const user: User = await saveUser(input);
    localStorage.setItem('userId', user.id);

    onSet(user);
  }

  return (
    <form className="usernameForm" onSubmit={handleSubmit}>
      <p className="usernameForm__label">Enter the username:</p>
      <input
        className="usernameForm__input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit" className="usernameForm__btn">Submit</button>
    </form>
  )
}
