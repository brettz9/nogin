describe('Reset', function () {
  // No accessibility test as to get 302 redirect back to `/users`
  it('Visit Reset', function () {
    cy.visit('/reset');
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/users');
  });
});
