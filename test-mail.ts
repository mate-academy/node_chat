import { mailer } from './src/utils/mailer.js';

await mailer.send('yosis76890@atebin.com', 'test', 'test123');

console.log('Mail sent');
