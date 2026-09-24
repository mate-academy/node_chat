'use strict';
import cors from 'cors';
import express from 'express';
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
