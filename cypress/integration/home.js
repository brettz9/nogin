describe('Home', function () {
  it(
    'Visit Home and be redirected when no session (no post to `/`, ' +
    '`/home` or GET to auto-login at `/` (from previous-set cookie ' +
    'posting to `/`)).',
    function () {
      cy.task('deleteAllAccounts');
      cy.visit('/home');
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    }
  );
  it('Visit Home after login', function () {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
    // Not just login, but get session
    return cy.request({
      url: '/',
      method: 'POST',
      body: {
        user: 'bretto',
        pass: 'abc123456'
      }
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      cy.visit('/home');

      const expressSessionID = 'connect.sid';
      cy.getCookie(expressSessionID).should('exist');

      return cy.get('[data-name="navbar-brand"]', {
        timeout: 10000
      }).contains('Control Panel');

      // Todo[>=1.7.0]: Check good and bad delete

    // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      // Home after login has no detectable a11y violations on load
      return cy.visitURLAndCheckAccessibility('/home');
    });
  });
  // https://www.npmjs.com/package/cypress-axe
});
