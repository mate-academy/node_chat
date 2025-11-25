'use strict';

import { server } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3232;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
