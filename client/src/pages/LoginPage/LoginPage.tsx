import * as R from "react";
import * as RRD from "react-router-dom";
import cn from "classnames";

// import { useLocalStorage } from "../../hooks/useLocalStorage";

import { PageRoute } from "../../types/PageRoutes";
import { AppContext } from "store/AppContext";

export const LoginPage = () => {
  const navigate = RRD.useNavigate();
  const { state } = RRD.useLocation();
  const [value, setValue] = R.useState('');
  const { setUser } = R.useContext(AppContext);

  const handleLogin = (event: R.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUser(value);

    console.info(value);

    navigate(state?.pathname || PageRoute.NONE, { replace: true });
  };

  return (
    <div className="box">
      <form onSubmit={handleLogin} className="login-form">
        <div className="field">
          <label className="label">UserChatName</label>
          {/* <div className="control has-icons-left has-icons-right"> */}
          <div className="control">
            <input
              className={cn('input', {
                'is-success': value,
                'is-danger': !value,
              })}
              type="text"
              placeholder="Please, write your username"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />

            {/* <span className="icon is-small is-left">
            <i className="fas fa-user"></i>
          </span>

          <span className="icon is-small is-right">
            <i className="fas fa-check"></i>
          </span> */}
          </div>

          {/* <p className="help is-success">This username is available</p> */}
        </div>

        <div className="control">
          <button
            className="button is-link"
            type="submit"
            disabled={!value}
          >
            Login
          </button>
        </div>
      </form>
    </div>

  );
};