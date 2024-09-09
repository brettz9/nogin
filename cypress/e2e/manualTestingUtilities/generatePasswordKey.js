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
      // eslint-disable-next-line sonarjs/no-hardcoded-ip -- Testing
      ip: '::ffff:127.0.0.1'
    }).then((key) => {
      cy.log(encodeURIComponent(key));
    });
  });
});
