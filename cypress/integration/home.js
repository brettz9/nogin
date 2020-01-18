describe('Home', function () {
  it('Visit Home', function () {
    cy.visit('/home');
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/');
  });
  it('Visit Home after login', function () {
    cy.visit('/home');

    // Todo (and do good and bad delete)
  });
  // https://www.npmjs.com/package/cypress-axe
  it('Home after login has no detectable a11y violations on load', () => {
    // Todo: ensure logged in
    cy.visitURLAndCheckAccessibility('/home');
  });
});
