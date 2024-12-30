import { BLUE, PINK, RED } from '@/constants/colors';
import { ChatContext } from '@/context/ChatContext';
import { UserContext } from '@/context/UserContext';
import { Box, ListItem } from '@mui/material';
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavList = styled.ul`
  a {
    text-decoration: none;
    color: ${BLUE};
  }
  .current {
    color: ${PINK};
  }

  li {
    padding: 0;
  }
`;

export const ChatNavigation = () => {
  const { chats } = useContext(ChatContext);
  const { handleLogOut } = useContext(UserContext);

  return (
    <Box>
      <NavList
        style={{
          width: '100%',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          rowGap: '1rem',
        }}
      >
        {chats.map(({ name, id }) => (
          <ListItem key={id}>
            <NavLink to={`/chat/${id}`} className={({ isActive }) => (isActive ? 'current' : '')}>
              {name}
            </NavLink>
          </ListItem>
        ))}

        <ListItem>
          <NavLink to='/chat/create' className={({ isActive }) => (isActive ? 'current' : '')}>
            Create Chat
          </NavLink>
        </ListItem>

        <ListItem style={{ color: RED, fontWeight: 'bold', cursor: 'pointer' }} onClick={handleLogOut}>
          Log Out
        </ListItem>
      </NavList>
    </Box>
  );
};
