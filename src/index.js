// 'use strict';

// import express from 'express';
// import cors from 'cors';

// const app = express();

// app.use(cors({ origin: '*' }));
// app.use(express.json());

// const messages = [];

// app.get('/', (req, res) => {
//   res.send('Hello World');
// });

// app.post('/message', (req, res) => {
//   const { author, text } = req.body;

//   if (!author || !text) {
//     return res.status(400).send({ error: 'Author and text are required' });
//   }

//   const message = {
//     author,
//     text,
//     time: new Date(),
//   };

//   messages.push(message);

//   res.status(201).send(message);
// });

// app.get('/messages', (req, res) => {
//   res.status(200).send(messages);
// });

// const PORT = 3001;

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
