describe('Reset password', function () {
  it('Visit reset password', function () {
    cy.visit('/reset-password');
  });
  // https://www.npmjs.com/package/cypress-axe
  it('reset-password has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/reset-password');
  });
});
