// Todo: These email methods should be movable into a general utility

import Pop3Command from 'node-pop3'; // , {listify}
import Envelope from 'envelope';

let popActivatedAccount,
  NL_EMAIL_HOST,
  NL_EMAIL_USER,
  NL_EMAIL_PASS;

/**
 * @param {PlainObject} cfg
 * @param {string} cfg.NL_EMAIL_HOST
 * @param {string} cfg.NL_EMAIL_USER
 * @param {string} cfg.NL_EMAIL_PASS
 * @returns {void}
 */
export function setEmailConfig ({
  NL_EMAIL_HOST: host,
  NL_EMAIL_USER: user,
  NL_EMAIL_PASS: pass
}) {
  NL_EMAIL_HOST = host;
  NL_EMAIL_USER = user;
  NL_EMAIL_PASS = pass;
}

/**
 * @returns {Promise<string[]>} Message numbers
*/
async function connectAndGetMessages () {
  popActivatedAccount = new Pop3Command({
    host: NL_EMAIL_HOST,
    user: NL_EMAIL_USER,
    password: NL_EMAIL_PASS,

    // Todo: Make configurable
    port: 995, // 110 is insecure default for POP
    tls: true
  });
  // Should not get deleted messages, so safe to use results in
  //  queries like RETR which won't work against deleted
  const list = await popActivatedAccount.LIST();
  console.log('list', list);

  return [
    ...new Map(list).keys()
  ];
}

/**
* @external EnvelopeMessage
* @see https://github.com/jhermsmeier/node-envelope#user-content-parsing-an-email
*/

/**
 * @param {string|number} messageNum
 * @returns {Promise<EnvelopeMessage>}
 */
async function getEmail (messageNum) {
  const retrStreamString = await popActivatedAccount.RETR(messageNum);
  console.log('retrStreamString', retrStreamString);
  // console.log('retrStreamStringListified', listify(retrStreamString));

  // This is good to do, but may sometimes be problematic for
  //  a slow connection
  await popActivatedAccount.DELE(messageNum);
  console.log('deleted from server');
  return new Envelope(retrStreamString);
}

/**
 * Probably only needed in testing, not from command line API.
 * @param {PlainObject} [cfg]
 * @param {boolean} [cfg.lastItem=false]
 * @returns {Promise<EnvelopeMessage[]>}
 */
export async function getEmails ({lastItem} = {}) {
  let messageNums = await connectAndGetMessages();
  if (lastItem) {
    messageNums = messageNums.slice(-1);
  }

  console.log('getting messageNums', messageNums);
  const parsedMessages = await Promise.all(
    messageNums.map((msgNum) => getEmail(msgNum))
  );

  // Each has numbers as strings for each content-type ("0", "1"),
  //   and `header`)
  console.log('parsedMessages', parsedMessages);
  /*
  console.log(
    'parsedMessages[0].header.contentType',
    parsedMessages[0] && parsedMessages[0].header &&
      parsedMessages[0].header.contentType
  );
  */

  // We might not even want to wait here, but we do for now to get the error.
  try {
  /* const quitInfo = */ await popActivatedAccount.QUIT(); // No args
  } catch (err) {
    console.log(err);
  }
  // console.log(quitInfo);
  return parsedMessages;
}

/**
 * @async
 * @returns {Promise<null>} Cypress does not work with `undefined`-resolving
 * tasks; see {@link https://github.com/cypress-io/cypress/issues/6241}.
 */
export async function deleteEmails () {
  const messageNums = await connectAndGetMessages();

  console.log('deleting messageNums', messageNums);

  try {
    await Promise.all(
      messageNums.map((messageNum) => {
        return popActivatedAccount.DELE(messageNum);
      })
    );
    console.log('Finished delete commands...');

    // We should probably wait here as we do since the messages
    //  are only to be deleted after exiting.
    /* const quitInfo = */ await popActivatedAccount.QUIT(); // No args
    console.log('Successfully quit after deletion.');
  } catch (err) {
    console.log(err);
  }
  return null;
}

/**
 * Shouldn't be needed on command line.
 * @async
 * @param {PlainObject} cfg
 * @param {string} cfg.subject
 * @param {string[]} cfg.html
 * @returns {Promise<boolean>}
 */
export async function hasEmail (cfg) {
  const parsedMessages = await getEmails();
  // console.log('parsedMessages', parsedMessages.length, parsedMessages);
  return hasEmailAmongMessages(parsedMessages, cfg);
}

/**
 * @param {EnvelopeMessage[]} parsedMessages
 * @param {PlainObject} cfg
 * @param {string} cfg.subject
 * @param {string[]} cfg.html
 * @returns {boolean}
 */
export function hasEmailAmongMessages (parsedMessages, cfg) {
  const subjectIsNotString = typeof cfg.subject !== 'string';
  const htmlIsNotArray = !Array.isArray(cfg.html);

  return parsedMessages.some((msg) => {
    const html = msg[0][0] && msg[0][0].body;
    /*
    console.log(
      'cfg.subject', cfg.subject, '::', msg.header && msg.header.subject,
      cfg.subject === msg.header.subject
    );
    console.log(
      'html',
      html,
      'cfg.html',
      cfg.html
    );
    */
    return (
      (subjectIsNotString ||
        cfg.subject === msg.header.get('subject')) &&
      (htmlIsNotArray || cfg.html.every((requiredHTMLString) => {
        // console.log(
        //   'html', html, 'requiredHTMLString', requiredHTMLString
        // );
        return html.includes(requiredHTMLString);
      }))
    );
  });
}

/**
 * @async
 * @returns {Promise<HTMLAndSubject>}
 */
export async function getMostRecentEmail () {
  // Could be risk of race condition
  const parsedMessages = await getEmails({lastItem: true});
  const mostRecentEmail = parsedMessages[0];
  const {header} = mostRecentEmail;
  const subject = header.get('subject');

  const msg = mostRecentEmail[0][0];
  // console.log('parsed msg', msg);
  const html = msg && msg.body;
  return {html, subject};
}
