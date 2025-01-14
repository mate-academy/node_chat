const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const getUserInfoRoutes = require('./routes/getUserInfoRoutes');
const chatRoutes = require('./routes/chatRoutes');
const createNewChatRoutes = require('./routes/createNewChatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const logoutRoutes = require('./routes/logoutRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

app.use(morgan('combined'));

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/user', authMiddleware, getUserInfoRoutes);
app.use('/chats', authMiddleware, chatRoutes);
app.use('/createNewChat', authMiddleware, createNewChatRoutes);
app.use('/messages', authMiddleware, messageRoutes);
app.use('/logout', authMiddleware, logoutRoutes);

module.exports = app;
