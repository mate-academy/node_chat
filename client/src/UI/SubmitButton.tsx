import { Button } from '@mui/material';
import { FC } from 'react';

interface Props {
  title: string;
}

export const SubmitButton: FC<Props> = ({ title }) => (
  <Button type='submit' variant='contained' style={{ display: 'block', width: '100%' }}>
    {title}
  </Button>
);
