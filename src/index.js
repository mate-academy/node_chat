'use strict';

import express from 'express';
import cors from 'cors';
import roomRoutes from './routers/roomRouters.js';
import messageRoutes from './routers/messageRouters.js';
import { errorMiddleWares } from './middleWares/errorMiddleWares.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3005;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use(express.static(path.join(dirname, 'client')));

app.use(express.json());
app.use(cors());

app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);

app.use(errorMiddleWares);

// Маршрут для завантаження index.html за замовчуванням
app.get('/', (req, res) => {
  res.sendFile(path.join(dirname, 'client', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

export default app;
