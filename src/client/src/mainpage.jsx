import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './App.css'

function Mainpage() {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const API_URL = 'http://localhost:3000';

  function HandleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrors('');

    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          setErrors(data.errors || data.message || 'Login failed');
          return;
        }


        // беремо наший токен, він зберігається в браузері і потім його можна використати
        // в файлі profile
        // navigate('/chat');
        localStorage.setItem('username', name);
        navigate('/MainChat');
      })
      .catch(() => setErrors('Server is not available'))
      .finally(() => { setName(''); setIsLoading(false); });
  }

  useEffect(() => {
    if (localStorage.getItem('username')) {
      navigate('/MainChat');
    }
  }, [navigate]);


  return (
    <>
      <div>
        <form onSubmit={HandleSubmit}>
          <p className="Name Sign">Email</p>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          {/* errors.name && <p className="error">{errors.name}</p> */}


          {errors && <p className="error">{errors}</p>}

          <button className="button_Sign" type="submit" disabled={isLoading}>
            {isLoading ? 'loading' : `Log in`}
          </button>

        </form>
      </div>
    </>
  )
}

export default Mainpage;
