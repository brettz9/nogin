describe('Reset', function () {
  // No accessibility test as to get 302 redirect back to `/users`
  it('Visit Reset', function () {
    cy.visit('/reset');
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/users');
    // Todo[>=1.7.0]: Check that users are indeed all gone
  });
});
