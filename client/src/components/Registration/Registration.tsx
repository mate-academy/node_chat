import React, { useState } from 'react';
import { checkAuth } from '../../functions/checkAuth.ts';
import { Container, TextField } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import LaunchIcon from '@mui/icons-material/Launch';
import ChatIcon from '@mui/icons-material/Chat';
import { Link } from '@mui/material';

interface Props {
  onSubmit: (v: boolean) => void;
  onLoading: (v: boolean) => void;
}

export const Registration: React.FC<Props> = ({ onSubmit, onLoading }) => {
  const [name, setName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name) {
      localStorage.setItem('name', name);
      checkAuth(onSubmit, onLoading);
    }
  };
  return (
    <Container
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography  variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: "'Space Grotesk', sans-serif" }}>
            Node Chat
            <ChatIcon />
          </Typography>

          <Link
            target="_blank"
            href="https://github.com/nikalaiii/node_chat/tree/develop"
            color="inherit"
          >
            GitHub Repository
          </Link>
          <LaunchIcon />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: 400,
            gap: 16,
          }}
        >
          <Typography variant='h5' sx={{ fontFamily: "'Space Grotesk', sans-serif" }} >Enter your name</Typography>
          <TextField
            label="Your Name"
            variant="standard"
            value={name ?? ''}
            onChange={(e) => setName(e.target.value)}
          />
          <Button variant="contained" color="success" type="submit">
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};
