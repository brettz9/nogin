describe('Users', function () {
  it('Visit Users (Empty)', function () {
    cy.task('deleteAllAccounts');
    cy.visit('/users');
  });

  it('Visit Users (With user)', function () {
    cy.task('deleteAllAccounts');
    cy.task('addNonActivatedAccount');
    cy.visit('/users');
    cy.get('[data-name=users] tbody td:nth-child(1)').contains('1');
    cy.get('[data-name=users] tbody td:nth-child(2)').contains('Brett');
    cy.get('[data-name=users] tbody td:nth-child(3)').contains('bretto');
    cy.get('[data-name=users] tbody td:nth-child(4)').contains('United States');
    cy.get('[data-name=users] tbody td:nth-child(5)').contains(
      /\d{1,2}\/\d{1,2}\/\d{1,2}/u
    );
  });

  // https://www.npmjs.com/package/cypress-axe
  it('users has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/users');
  });
});
