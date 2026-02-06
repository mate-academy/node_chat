'use strict';

import { server } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3232;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
