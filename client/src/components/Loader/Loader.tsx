import { WHITE } from '@/constants/colors';
import { Backdrop, CircularProgress } from '@mui/material';

export const Loader = () => (
  <Backdrop sx={(theme) => ({ color: WHITE, zIndex: theme.zIndex.drawer + 1 })} open>
    <CircularProgress color='inherit' />
  </Backdrop>
);
