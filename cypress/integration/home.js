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
  describe('Pre-logging in with session', function () {
    beforeEach(() => {
      cy.loginWithSession();
    });
    it('Visit Home after login', function () {
      cy.visit('/home');

      const expressSessionID = 'connect.sid';
      cy.getCookie(expressSessionID).should('exist');

      cy.get('[data-name="navbar-brand"]', {
        timeout: 10000
      }).contains('Control Panel');

      // Todo[>=1.7.0]: Check good and bad delete and update

      // Home after login has no detectable a11y violations on load
      // https://www.npmjs.com/package/cypress-axe
      return cy.visitURLAndCheckAccessibility('/home');
    });
  });
});
