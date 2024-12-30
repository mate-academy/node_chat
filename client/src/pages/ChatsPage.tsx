import { ChatNavigation } from '@/components/Chat/ChatNavigation';
import { ChatProvider } from '@/providers/ChatProvider';
import Grid from '@mui/material/Grid';
import { Outlet } from 'react-router-dom';

const ChatsPage = () => (
  <Grid
    container
    spacing={3}
    sx={{
      flexDirection: { xs: 'column', sm: 'row' },
    }}
  >
    <ChatProvider>
      <Grid item xs={12} sm={4} xl={2}>
        <ChatNavigation />
      </Grid>

      <Grid item xs={12} sm={8} xl={10}>
        <Outlet />
      </Grid>
    </ChatProvider>
  </Grid>
);

export default ChatsPage;
