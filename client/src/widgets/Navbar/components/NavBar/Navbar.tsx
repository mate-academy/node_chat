import { Container, Navbar, Nav, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../shared/hooks/reduxHooks';
import { removeUser } from '../../../../entities/User';
import { Notifications } from '../Notifications/Notifications';

export const NavBar = () => {
  const { user } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(removeUser())
  }

  return (
    <Navbar bg="dark" className='mb-4' style={{ height: '3.75rem' }}>
      <Container>
        <Link to='/' className='link-light text-decoration-none'>
          <h1>Node ChatApp</h1>
        </Link>

        {user && (
          <span className='text-warning'>Logged in as {user?.name}</span>
        )}

        <Nav>
          {!user ? (
            <Stack direction='horizontal' gap={3}>
              <Link to='/login' className='link-light text-decoration-none'>
                Login
              </Link>
              <Link to='/register' className='link-light text-decoration-none'>
                Registration
              </Link>
            </Stack>
          ) : (
            <Stack gap={3} direction='horizontal'>
              <Notifications />
              <Link
                to='/login'
                className='link-light text-decoration-none'
                onClick={handleLogout}
              >
                Logout
              </Link>
            </Stack>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}