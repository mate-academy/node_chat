import React, { useState } from 'react';

interface Props {
  onSubmit: (name: string) => void;
  buttonText: string;
}

const ModalForm: React.FC<Props> = ({ onSubmit, buttonText }) => {
  const [input, setInput] = useState('');

  const submit = () => {
    if (input.trim() !== '') {
      if (buttonText === 'Register') {
        localStorage.setItem('username', input);
      }

      onSubmit(input);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl mb-4">{buttonText}</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="border border-gray-400 rounded px-3 py-2 mb-4"
      />
      <button
        type="button"
        onClick={submit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ModalForm;
