describe('Reset password', function () {
  beforeEach(() => {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
  });

  // https://www.npmjs.com/package/cypress-axe
  it('reset-password has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/reset-password');
  });

  it('Visit reset password', function () {
    cy.visit('/reset-password');
  });

  it('Visit reset password (after login)', function () {
    // eslint-disable-next-line promise/prefer-await-to-then
    return cy.task('hackEnv').then(({
      NL_EMAIL_USER,
      NL_EMAIL_PASS
    }) => {
      // eslint-disable-next-line promise/no-nesting
      return cy.task('generatePasswordKey', {
        email: NL_EMAIL_USER,
        // ipv6 read by Express
        ip: '::ffff:127.0.0.1'
      // Cypress won't run the tests with an `await` here
      // eslint-disable-next-line max-len
      // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
      }).then((key) => {
        cy.log(key);
        cy.visit('/reset-password?key=' + encodeURIComponent(key));
        cy.get('[data-name=enter-new-pass-label]').contains(
          'Please enter your new password'
        );
        cy.get('[data-name=reset-pass]').type(NL_EMAIL_PASS);
        cy.get('[data-name="reset-password-submit"]').click();

        cy.validUserPassword({
          user: 'bretto',
          pass: NL_EMAIL_PASS
        });
      });
    });
  });
});
