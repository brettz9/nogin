'use strict';

const Pop3Command = require('node-pop3');
const getStream = require('get-stream');

const {
  NL_EMAIL_HOST,
  NL_EMAIL_USER,
  NL_EMAIL_PASS
} = require('./node-login.js');

const pop3 = new Pop3Command({
  host: NL_EMAIL_HOST,
  user: NL_EMAIL_USER,
  password: NL_EMAIL_PASS,

  // Tried for SSL/TLS, but after apparent login, got errors
  port: 995,
  tls: true
});

(async () => {
// These must be in order:
try {
  await pop3.connect();

  console.log('1111');
  const [
    [statInfo],
    [retrInfo, retrStream]
  ] = await Promise.all([
    // Get number of messages and size
    pop3.command('STAT'), // no args

    // Retrieval of message
    pop3.command('RETR', 2) // requires msg number (and returns stream)
  ]);

  console.log(statInfo); // 100 102400
  console.log(retrInfo); // 1024 octets

  console.log('getStream', await getStream(retrStream));

  // Mark message as deleted
  // const [deleInfo] = await pop3.command('DELE', 1); // requires msg number
  // console.log('deleInfo', deleInfo);

  // Unmark deleted as such
  // const [rsetInfo] = await pop3.command('RSET'); // No args
  // console.log('rsetInfo', rsetInfo);

  // Just gets a positive success message from server
  // const [noopInfo] = await pop3.command('NOOP'); // No args
  // console.log('noopInfo', noopInfo);

  // List info on message
  const [
    listInfo, listStream
  // Takes optional msg number (and returns stream)
  ] = await pop3.command('LIST');
  console.log('listInfo', listInfo);
  console.log('listStream', await getStream(listStream));

  // 1. TOP (required msg number and required non-negative number of line)
  //    - i.e., get specific message; returns stream
  const [topInfo, topStream] = await pop3.command(
    'TOP', 2, 10000
  ); // Takes optional msg number
  console.log('topInfo', topInfo);
  console.log('topStream', await getStream(topStream));

  // 2. UIDL (optional msg number)
  //    - i.e., unique-id listing
  // Takes optional msg number and returns stream
  const [uidlInfo, uidlStream] = await pop3.command('UIDL');
  console.log('uidlInfo', uidlInfo);
  console.log('uidlStream', await getStream(uidlStream));

  const [uidlInfo2, uidlStream2] = await pop3.command(
    'UIDL', 2
  ); // Takes optional msg number
  console.log('uidlInfo2', uidlInfo2);
  console.log('uidlStream2', await getStream(uidlStream2));

  // Errors out for this non-command
  // const [badInfo] = await pop3.command('ABCD');
  // console.log('badInfo', badInfo);

  // Other commands (all optional):
  // 1. TOP (required msg number and required non-negative number of line)
  //    - i.e., get specific message
  // 2. UIDL (optional msg number)
  //    - i.e., unique-id listing
  // 3. USER (required name)
  // 4. PASS (required server/mailbox-specific string)
  // 5. APOP (required mailbox string and MD5 digest string)
  //    - i.e., alternate authentication to USER/PASS exchange

  // Commands from https://tools.ietf.org/html/rfc5034
  // 1. AUTH (required mechanism and optional initial-response)

  // Commands from https://tools.ietf.org/html/rfc2595
  // 1. STLS (no args)
  // 1. STARTTLS (no args)

  // Commands from https://tools.ietf.org/html/rfc2449
  // 1. CAPA (no args)
  // 2. SASL, RESP-CODES, LOGIN-DELAY, PIPELINING, EXPIRE
  //    and IMPLEMENTATION

  // Removes all messages marked as deleted; removes any lock
  //   and closes connection
  const [quitInfo] = await pop3.command('QUIT'); // No args
  console.log(quitInfo);
} catch (err) {
  console.log('Error', err);
}
})();
