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
    return cy.task('generatePasswordKey', {
      email: 'brettz9@example.com',
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
      cy.get('[data-name=reset-pass]').type('gggg1234');
      cy.get('[data-name="reset-password-submit"]').click();

      // Todo[>=1.7.0]: Check that password is actually reset

      // Todo[>=1.7.0]: For other UI tests, ensure important server state
      //   is checked not only resulting UI
    });
  });
});
