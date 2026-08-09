// Dedicated opt-in coverage for postLoginRedirectPath='/' scenarios.
// This spec is skipped by default because regular test startup does not
// pass --postLoginRedirectPath and may not provide a non-login root handler.

describe(
  'Root postLoginRedirectPath to root',
  function () {
    beforeEach(() => {
      cy.task('deleteAllAccounts');
      cy.task('addAccount');
    });

    it(
      'does not loop when redirect target equals root for a session user',
      function () {
        cy.env(['RUN_POST_LOGIN_REDIRECT_ROOT_TESTS']).then(({
          RUN_POST_LOGIN_REDIRECT_ROOT_TESTS
        }) => {
          const shouldRun =
            RUN_POST_LOGIN_REDIRECT_ROOT_TESTS === true ||
            RUN_POST_LOGIN_REDIRECT_ROOT_TESTS === 'true';

          if (!shouldRun) {
            cy.log('Skipping assertions without env flag');
            return;
          }

          cy.loginWithSession();
          cy.visit('/');

          cy.location('pathname', {
            timeout: 10000
          }).should('eq', '/');

          // If we reached a custom logged-in root, login form should be absent.
          // This assertion is only meaningful in environments configured with
          // a non-login root handler.
          cy.get('[data-name="login"]').should('not.exist');
        });
      }
    );
  }
);
