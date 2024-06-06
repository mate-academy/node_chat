import { useState } from 'react';
import { postUser, setErrorUser } from '../../features/user/userSlice.js';
import './formInputName.css';
import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

export function FormInputName({
  userState
}) {
  const [userName, setUserName] = useState('');
  const dispatchUser = useDispatch();
  const navigator = useNavigate();


  function handlerInputName(e) {
    setUserName(e.target.value);
    dispatchUser(setErrorUser({ status: false, message: '' }));
  };

  async function submitFormName(e) {
    e.preventDefault();

    const res = await dispatchUser(postUser(userName));

    if (res.meta.requestStatus === 'rejected') {
      console.error('Error: ', res.payload);
    } else {
      setUserName('');
      navigator('/rooms');
    }
  }

  return (
    <form
      className='form-input-name'
      onSubmit={submitFormName}
    >
      <div className='form-input-wrapper'>
        <input
          value={userName}
          onChange={handlerInputName}
          className='input-name'
          type="text"
          placeholder='Type user name'
          required
        />

        <button type='submit' className={classnames({
          'btn-submit-name': true,
          'spin': userState?.loading,
          'error': userState?.error.status
        })}>Submit</button>
      </div>

      {userState?.error.status && (
        <p className='message-result'>{`error: ${userState?.error.message}`}</p>
      )}
    </form>
  );
};
