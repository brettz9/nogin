describe('Generate password key (for `/reset-password`)', function () {
  let NL_EMAIL_USER;
  before(() => {
    ({
      NL_EMAIL_USER
    } = Cypress.env());
  });
  it('Visit reset password (after login)', function () {
    return cy.task('generatePasswordKey', {
      email: NL_EMAIL_USER,
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1'
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line max-len
    // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
    }).then((key) => {
      cy.log(encodeURIComponent(key));
    });
  });
});
