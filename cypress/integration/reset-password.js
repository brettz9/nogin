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
    return cy.login({
      user: 'bretto',
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1'
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line max-len
    // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
    }).then((key) => {
      cy.visit('/reset-password?key=' + encodeURIComponent(key));
    });
  });
});
