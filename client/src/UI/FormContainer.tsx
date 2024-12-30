import { Box } from '@mui/material';
import { FC, FormEvent, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const FormContainer: FC<Props> = ({ children, handleSubmit }) => (
  <Box
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '90vh',
    }}
  >
    <Box
      component='form'
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        maxWidth: '300px',
        flexDirection: 'column',
        rowGap: '20px',
        alignItems: 'center',
      }}
    >
      {children}
    </Box>
  </Box>
);
