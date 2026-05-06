const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error('Connection error:', err.stack);

    return;
  }
  // eslint-disable-next-line no-console
  console.log('Connection to the database was established successfully.!');
  release();
});
module.exports = pool;
