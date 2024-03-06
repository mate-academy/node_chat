import * as R from 'react';
import * as RRD from 'react-router-dom';
import { PageRoute } from '../../types/PageRoutes';
import { AppContext } from '../../store/AppContext';


export function LoginRequire() {
  const { user } = R.useContext(AppContext);
  const { pathname } = RRD.useLocation();

  console.info(user);

  if (!user) {
    return <RRD.Navigate
      to={PageRoute.LOGIN}
      state={{ pathname }}
      replace
    />;
  }

  return <RRD.Outlet />;
}