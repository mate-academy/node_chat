import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export async function getRooms() {
  const result = await pool.query('SELECT * FROM rooms ORDER BY name');
  return result.rows;
}

export async function createRoom(name) {
  const result = await pool.query(
    'INSERT INTO rooms (name) VALUES ($1) RETURNING *',
    [name],
  );
  return result.rows[0];
}

export async function renameRoom(roomId, newName) {
  const result = await pool.query(
    'UPDATE rooms SET name = $1 WHERE id = $2 RETURNING *',
    [newName, roomId],
  );
  return result.rows[0];
}

export async function deleteRoom(roomId) {
  await pool.query('DELETE FROM messages WHERE room_id = $1', [roomId]);
  await pool.query('DELETE FROM rooms WHERE id = $1', [roomId]);
}

export async function getMessages(roomId) {
  const result = await pool.query(
    'SELECT * FROM messages WHERE room_id = $1 ORDER BY time',
    [roomId],
  );
  return result.rows;
}

export async function addMessage(roomId, author, text) {
  const result = await pool.query(
    'INSERT INTO messages (room_id, author, text, time) VALUES ($1, $2, $3, NOW()) RETURNING *',
    [roomId, author, text],
  );
  return result.rows[0];
}
