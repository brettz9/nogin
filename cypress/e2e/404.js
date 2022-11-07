describe('404', function () {
  it('Bad page', function () {
    cy.visit('/bad-page', {
      failOnStatusCode: false
    });
    cy.get('[data-name=four04]').contains(
      'the page or resource you are searching for is currently unavailable'
    );
  });
  // https://www.npmjs.com/package/cypress-axe
  it('404 has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/', {
      failOnStatusCode: false
    });
  });
});
