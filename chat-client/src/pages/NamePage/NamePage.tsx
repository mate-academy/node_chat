import { useState } from 'react'

import './NamePage.scss';

type Props = {
  onSetName: (name: string) => void;
};


export const NamePage = ({ onSetName }: Props) => {
  const [draftName, setDraftName] = useState('')


  return (
    <div className="namePage">
      <h1 className="namePage-title">Node Chat</h1>
      <form className="namePage-form" onSubmit={(e) => {
        if (draftName.trim() !== '') {
          onSetName(draftName.trim());
        }
        e.preventDefault();
      }}
      >
        <input
          type="text"
          placeholder='Enter your name'
          value={draftName}
          onChange={(e) => {
            setDraftName(e.target.value)
          }}
        />
        <button type="submit" className="namePage-button">
          Join Chat
        </button>
      </form>
    </div>
  )
}

export default NamePage;
