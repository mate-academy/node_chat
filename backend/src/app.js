import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';

export const app = express();

app.use(express.json());
app.use(cors());
app.use(router);
