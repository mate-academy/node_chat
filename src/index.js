'use strict';

import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Порт
const port = process.env.PORT || 3005;

// Роут
app.get('/', (req, res) => {
  res.send('Hello bro, server is listening!');
});

// Запуск сервера
app.listen(port, () => {
  // console.log(`Server started on http://localhost:${port}`);
});
