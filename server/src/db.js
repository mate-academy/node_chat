const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'my_chat_db',
  password: 'postgres',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    // eslint-disable-next-line no-console
    return console.error('Connection error:', err.stack);
  }
  // eslint-disable-next-line no-console
  console.log('Connection to the database was established successfully.!');
  release();
});
module.exports = pool;
