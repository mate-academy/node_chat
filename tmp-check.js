const { Message } = require('./src/services/messages.service');

(async () => {
  const msg = await Message.create({ message: 'hello' });

  console.log('created', msg.id);

  try {
    await msg.update({ message: 'updated' });
    console.log('updated ok');
  } catch (error) {
    console.error('update error', error.message);
    process.exit(1);
  }
})();
