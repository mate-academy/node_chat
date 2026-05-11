import type { LoginProps } from "../../types/LoginProps";
import './Login.scss';

export const Login = ({
  inputValue,
  setInputValue,
  handleLogin,
}: LoginProps) => {
  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">Log in</h1>

        <input
          className="login__input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your name"
        />
        
        <button
          className="login__button"
          onClick={handleLogin}
        >
          Log in
        </button>
      </div>
    </div>
  );
}
