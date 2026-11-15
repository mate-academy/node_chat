import { chatStore } from '../models/chatStore.js';

export function authenticate(req, res) {
  const userName = req.body?.userName?.trim();

  if (!userName) {
    res.status(400).send({ text: 'Username is required' });

    return;
  }

  const user = chatStore.registerUser(userName);

  if (!user) {
    res.status(409).send({ text: 'Username already exists' });

    return;
  }

  res.send(user.userName);
}
