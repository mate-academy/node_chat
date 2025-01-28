'use strict';

import express from 'express';
import cors from 'cors';
import roomRoutes from './routers/roomRouters.js';
import messageRoutes from './routers/messageRouters.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

const port = process.env.PORT || 3005;

app.use(express.json());

app.use(cors());

app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);

app.listen(port, () => {
  // console.log(`Server started on http://localhost:${port}`);
});
app.use(errorMiddleware);

export default app;
