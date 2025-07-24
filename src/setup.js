import { Message } from './models/Message.route.js';
import { Room } from './models/Room.model.js';
import { User } from './models/User.model.js';

async function setup() {
  try {
    await User.sync({ force: true });
    await Room.sync({ force: true });
    await Message.sync({ force: true });

    // eslint-disable-next-line no-console
    console.log('Tables synced!');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error syncing:', err);
  }
}

setup();
