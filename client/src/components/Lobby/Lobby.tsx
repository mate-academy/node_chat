import React, { useEffect, useState } from 'react';
import { requestCreateRoom } from '../../functions/requestCreateRoom';
import { Link, useNavigate } from 'react-router-dom';
import { requestJoinRoom } from '../../functions/requestJoinRoom';
import {
  AppBar,
  Container,
  Button,
  Typography,
  Avatar,
  Toolbar,
  ButtonGroup,
  TextField,
  Box,
} from '@mui/material';

import LaunchIcon from '@mui/icons-material/Launch';
import ErrorIcon from '@mui/icons-material/Error';

type LobbyState = 'create' | 'join' | null;

export const Lobby: React.FC = () => {
  const [lobbyState, setLobbyState] = useState<LobbyState>(null);
  const [inputValue, setInputValue] = useState<string | null>(null);
  const [inputLimit, setInputLimit] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userName = localStorage.getItem('name');

  const handleSubmit = async () => {
    const currentMethod = lobbyState;
    if (!inputValue || !currentMethod) {
      setError('inputValue or currentMethod is empty');
      return;
    }

    if (currentMethod === 'create') {
      const response = await requestCreateRoom(inputValue, inputLimit);
      if (response) {
        navigate(`/chat/${response.id}`);
        return;
      } else {
        setError('problem with creating room');
        return;
      }
    } else if (currentMethod === 'join') {
      const response = await requestJoinRoom(inputValue);

      if (response) {
        navigate(`/chat/${response.id}`);
        return;
      } else {
        setError('problem with joining to room');
        return;
      }
    }
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(null), 5000);
    }
  }, [error]);

  useEffect(() => {
    console.log('lobby changed' + lobbyState);
  }, [lobbyState]);

  return (
    <Container
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {error && (
  <Box
    sx={{
      position: 'absolute',
      top: '10%',
      left: '10%',
      transform: 'translateX(-50%)',
      bgcolor: 'error.main',
      color: 'white',
      px: 3,
      py: 2,
      borderRadius: 2,
      boxShadow: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      zIndex: 999,
    }}
  >
    <ErrorIcon />
    <Typography variant="body1">{error}</Typography>
  </Box>
)}

      <AppBar sx={{ minHeight: '60px' }} position="static">
        <Toolbar>
          <Avatar alt="Remy Sharp" src="/images/user2.png" />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {userName}
          </Typography>

          <Link
            target="_blank"
            href="https://github.com/nikalaiii/node_chat/tree/develop"
            color="white"
          >
            GitHub Repository
          </Link>
          <LaunchIcon />
        </Toolbar>
      </AppBar>

      <ButtonGroup sx={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '20px'}} variant="outlined" aria-label="Basic button group">
        <Button
          onClick={() => setLobbyState('create')}
        >
          Create a new Room
        </Button>
        <Button onClick={() => setLobbyState('join')}>
          Join to room
        </Button>
      </ButtonGroup>

      <Typography>
        Hello, this is your personal account, here you can join an existing
        room, or create a new one, you can read detailed information about your
        account by clicking on your avatar
      </Typography>
      {lobbyState && (
        <form style={{ minWidth: '50%', display: 'flex', flexDirection: 'column', gap: '1.3rem'}}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {lobbyState === 'create' ? 'Create a new Room' : 'Join to room'}
          </Typography>
          <label>
            <Typography
              variant="h6"
              sx={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {lobbyState === 'create'
                ? 'Enter your room name'
                : 'Enter room ID'}
            </Typography>
            <TextField
              label="Room Name"
              variant="standard"
              placeholder={
                lobbyState === 'create' ? 'enter room name' : 'enter room id'
              }
              value={inputValue ?? ''}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </label>
          {lobbyState === 'create' && (
            <label>
              <Typography  sx={{ fontFamily: "'Space Grotesk', sans-serif" }} >Select count of users limit</Typography>
              <TextField
              variant="standard"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '1.5rem',
                  },
                }}
                type="number"
                onChange={(e) => setInputLimit(Number(e.target.value))}
                inputProps={{ min: 2, max: 10 }}
                label="Users limit"
              />
            </label>
          )}
          <Button sx={{ width: '400px'}} color='success' variant='contained' type="submit">
            {lobbyState === 'create' ? 'Create room' : 'Join to room'}
          </Button>
        </form>
      )}
    </Container>
  );
};
