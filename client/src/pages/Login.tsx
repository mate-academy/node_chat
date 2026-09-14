import { useState } from 'react';
import { useWebSocket } from '../WebSocketContext.tsx';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { userName, login } = useWebSocket();
  const [value, setValue] = useState<string>(userName);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(value);
    navigate('/');
  };

  return (
    <section className="hero ">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-5-tablet is-4-desktop is-3-widescreen">
              <form onSubmit={handleSubmit} className="box">
                <div className="field">
                  <label htmlFor="user" className="label">
                    User
                  </label>
                  <div className="control has-icons-left">
                    <input
                      id="user"
                      type="text"
                      placeholder="John Doe"
                      className="input"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      required
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-user"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <button className="button is-success">Login</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
