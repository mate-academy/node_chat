import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  const result = await AppDataSource.query('SELECT NOW() AS now');
  res.json({ status: 'ok', dbTime: result[0].now });
});

async function main() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
