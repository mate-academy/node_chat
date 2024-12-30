import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container
      maxWidth='sm'
      sx={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: 2,
      }}
    >
      <Box
        sx={{
          mb: 4,
        }}
      >
        <Typography variant='h1' component='h1' sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant='h5' sx={{ mb: 2, color: 'text.secondary' }}>
          Page Not Found
        </Typography>
        <Typography variant='body1' sx={{ mb: 4, color: 'text.secondary' }}>
          Sorry, the page you are looking for does not exist.
        </Typography>
      </Box>
      <Button variant='contained' color='primary' size='large' onClick={handleGoHome}>
        Go to Home
      </Button>
    </Container>
  );
};

export default NotFoundPage;
