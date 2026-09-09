/**
 * @typedef {Window & {Nogin: {postLoginRedirectPath?: string}}} NoginWindow
 */

describe(
  'Root postLoginRedirectPath to root',
  function () {
    beforeEach(function () {
      cy.task('deleteAllAccounts');
      cy.task('addAccount');
      cy.visit('/');
      cy.window().then((win) => {
        const pageWindow = /** @type {NoginWindow} */ (
          /** @type {unknown} */ (win)
        );
        if (pageWindow.Nogin.postLoginRedirectPath !== '/') {
          // eslint-disable-next-line mocha/no-pending-tests -- Special config
          this.skip();
        }
      });
    });

    it(
      'does not loop when redirect target equals root for a session user',
      function () {
        cy.loginWithSession();
        cy.visit('/');

        cy.location('pathname', {
          timeout: 10000
        }).should('eq', '/');
        cy.contains('custom logged-in root');
        cy.get('[data-name="login"]').should('not.exist');
      }
    );
  }
);
