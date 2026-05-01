const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');
const http = require('http');
const pool = require('./db');

const app = express();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_chat', (chatId) => {
    socket.join(chatId.toString());
  });

  socket.on('disconnect', () => {});
});

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }),
);
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { name: userName, phone, email, password } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (name, email, password_hash, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email
    `;

    const values = [userName, email, hashedPassword, phone];

    const newUser = await pool.query(query, values);

    res.json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      return res.json({ id: user.id, name: user.name, email: user.email });
    }

    return res.status(401).json({ error: 'Incorrect password' });
  } catch (err) {
    return res.status(500).send('Server error');
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await pool.query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [id],
    );

    if (user.rows.length > 0) {
      return res.json(user.rows[0]);
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/chats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
    c.*,
    (SELECT u.name FROM chat_members cm2
     JOIN users u ON cm2.user_id = u.id
     WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1) as recipient_name,
    (SELECT content FROM messages
     WHERE chat_id = c.id
     ORDER BY created_at DESC LIMIT 1) as last_message,
    (SELECT created_at FROM messages
     WHERE chat_id = c.id
     ORDER BY created_at DESC LIMIT 1) as last_message_time,
    (SELECT COUNT(*) FROM messages
     WHERE chat_id = c.id
     AND sender_id != $1
     AND is_read = false) as unread_count
FROM chats c
JOIN chat_members cm ON c.id = cm.chat_id
WHERE cm.user_id = $1

ORDER BY COALESCE(
    (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1),
    c.created_at
) DESC;`,
      [userId],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats', async (req, res) => {
  const { name: chatName, number, creatorId } = req.body;

  try {
    await pool.query('BEGIN');

    const newChat = await pool.query(
      'INSERT INTO chats (name) VALUES ($1) RETURNING *',
      [chatName || null],
    );
    const chatId = newChat.rows[0].id;

    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)',
      [chatId, creatorId],
    );

    let otherUserName = null;

    if (number && number.trim() !== '') {
      const userResult = await pool.query(
        'SELECT id, name FROM users WHERE phone = $1',
        [number.trim()],
      );

      if (userResult.rows.length > 0) {
        const otherUser = userResult.rows[0];

        if (otherUser.id !== creatorId) {
          await pool.query(
            'INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)',
            [chatId, otherUser.id],
          );
          otherUserName = otherUser.name;
        }
      }
    }

    await pool.query('COMMIT');

    return res.json({
      ...newChat.rows[0],
      recipient_name: otherUserName,
      last_message: 'Chat created',
      unread_count: 0,
    });
  } catch (err) {
    await pool.query('ROLLBACK');

    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/chats/:chatId/members', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT u.id, u.name, u.phone
      FROM users u
      JOIN chat_members cm ON u.id = cm.user_id
      WHERE cm.chat_id = $1
    `,
      [req.params.chatId],
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats/:chatId/members', async (req, res) => {
  const { phone } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id) ' +
        'VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.chatId, userResult.rows[0].id],
    );

    return res.json({ message: 'Member added' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chats/:chatId/members/:userId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [req.params.chatId, req.params.userId],
    );

    return res.json({ message: 'Member removed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { chat_id: chatId, sender_id: senderId, content } = req.body;

    const newMessage = await pool.query(
      'INSERT INTO messages (chat_id, sender_id, content, is_read) ' +
        'VALUES ($1, $2, $3, false) RETURNING *',
      [chatId, senderId, content],
    );

    const messageData = newMessage.rows[0];

    io.to(chatId.toString()).emit('receive_message', messageData);
    io.to(chatId.toString()).emit('update_chat_list', messageData);

    return res.json(messageData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.created_at ASC`,
      [chatId],
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).send('Server Error');
  }
});

app.delete('/api/chats/:id', async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM messages WHERE chat_id = $1', [id]);
  await pool.query('DELETE FROM chats WHERE id = $1', [id]);

  return res.sendStatus(204);
});

app.put('/api/chats/:id', async (req, res) => {
  const { name: chatName } = req.body;

  await pool.query('UPDATE chats SET name = $1 WHERE id = $2', [
    chatName,
    req.params.id,
  ]);

  return res.json({ message: 'Chat name changed' });
});

app.put('/api/messages/read/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.body;

  try {
    await pool.query(
      'UPDATE messages SET is_read = true WHERE chat_id = $1 ' +
        'AND sender_id != $2',
      [chatId, userId],
    );

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});
// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
