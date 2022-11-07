describe('Users', function () {
  it('Visit Users (Empty)', function () {
    cy.task('deleteAllAccounts');
    cy.visit('/users');
  });

  it('Visit Users (With user)', function () {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
    cy.task('addNonActivatedAccount');
    cy.task('addAccountWithMissingNameAndCountry');
    cy.visit('/users');

    cy.get('[data-name=users] tr:nth-child(1) td:nth-child(1)').contains('1');
    cy.get('[data-name=users] tr:nth-child(1) td:nth-child(2)').contains(
      'Brett'
    );
    cy.get('[data-name=users] tr:nth-child(1) td:nth-child(3)').contains(
      'bretto'
    );
    cy.get('[data-name=users] tr:nth-child(1) td:nth-child(4)').contains(
      'United States'
    );
    cy.get('[data-name=users] tr:nth-child(1) td:nth-child(5)').contains(
      /\w+, \w+ \d{1,2}, \d{4}/u
    );

    cy.get('[data-name=users] tr:nth-child(2) td:nth-child(1)').contains('2');
    cy.get('[data-name=users] tr:nth-child(2) td:nth-child(2)').contains(
      'Nicole'
    );
    cy.get('[data-name=users] tr:nth-child(2) td:nth-child(3)').contains(
      'nicky'
    );
    cy.get('[data-name=users] tr:nth-child(2) td:nth-child(4)').contains(
      'Iran'
    );
    cy.get('[data-name=users] tr:nth-child(2) td:nth-child(5)').contains(
      /\w+, \w+ \d{1,2}, \d{4}/u
    );

    cy.get('[data-name=users] tr:nth-child(3) td:nth-child(1)').contains('3');
    cy.get(
      '[data-name=users] tr:nth-child(3) td:nth-child(2)'
    ).should('be.empty');
    cy.get('[data-name=users] tr:nth-child(3) td:nth-child(3)').contains(
      'Joe'
    );
    cy.get(
      '[data-name=users] tr:nth-child(3) td:nth-child(4)'
    ).should('be.empty');
    cy.get('[data-name=users] tr:nth-child(3) td:nth-child(5)').contains(
      /\w+, \w+ \d{1,2}, \d{4}/u
    );

    cy.get('[data-name=users] tbody tr:nth-child(4)').should('not.exist');
  });

  // https://www.npmjs.com/package/cypress-axe
  it('users has no detectable a11y violations on load (no users)', () => {
    cy.task('deleteAllAccounts');
    cy.visitURLAndCheckAccessibility('/users');
  });

  it('users has no detectable a11y violations on load', () => {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
    cy.task('addNonActivatedAccount');
    cy.visitURLAndCheckAccessibility('/users');
  });
});
