import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import router from './routes/chatsRoutes.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);

app.use(express.json());
app.use('/', router);
app.use(errorHandler);

export default app;
