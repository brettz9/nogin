'use strict';

const Pop3Command = require('node-pop3');

const {
  NL_EMAIL_HOST,
  NL_EMAIL_USER,
  NL_EMAIL_PASS
} = require('./node-login.js');

const pop3 = new Pop3Command({
  host: NL_EMAIL_HOST,
  user: NL_EMAIL_USER,
  password: NL_EMAIL_PASS
});

(async () => {
// These must be in order:
try {
  await pop3.connect();

  const [
    [statInfo],
    [retrInfo]
  ] = await Promise.all([
    pop3.command('STAT'),
    pop3.command('RETR', 1)
  ]);

  console.log(statInfo); // 100 102400
  console.log(retrInfo); // 1024 octets

  const [quitInfo] = await pop3.command('QUIT');
  console.log(quitInfo);
} catch (err) {
  console.log('Error', err);
}
})();
