describe('Home', function () {
  it(
    'Visit Home and be redirected when no session (no post to `/`, ' +
    '`/home` or GET to auto-login at `/` (from previous-set cookie ' +
    'posting to `/`)).',
    function () {
      cy.visit('/home');
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    }
  );
  it('Visit Home after login', function () {
    cy.visit('/home');

    // Todo[>=1.7.0]: (and do good and bad delete)
  });
  // https://www.npmjs.com/package/cypress-axe
  it('Home after login has no detectable a11y violations on load', () => {
    // Todo[>=1.7.0]: ensure logged in
    cy.visitURLAndCheckAccessibility('/home');
  });
});
