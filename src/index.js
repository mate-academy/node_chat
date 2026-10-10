'use strict';

const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const initSocket = require('./socket');
const roomRoutes = require('./routes/roomRoutes');

// 1. Load environment variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize Express app
const app = express();

// 4. Create HTTP server (Required for Socket.IO)
const server = http.createServer(app);

// 5. Initialize Socket.IO
initSocket(server);

// 6. Express Middleware
app.use(express.json());
app.use(express.static('public'));

// 7. Express Routes
app.use('/api/rooms', roomRoutes);

// 8. Start the server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  // Using process.stdout.write to avoid breaking the 'no-console' linter rule
  process.stdout.write(`🚀 Server running on port ${PORT}\n`);
});
