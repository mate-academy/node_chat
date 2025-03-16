import { SchemaMessage } from '../helpers/schemas_message';
import { createMessage } from '../services/message.service';

const create = async (req, res) => {
  const { author, text, id } = req.body;

  await SchemaMessage.validate({ author, text, id });

  const messagem = await createMessage(author, text, id);

  res.status(201).send(messagem);
};

export const messageController = {
  create,
};
