describe('Users', function () {
  beforeEach(function () {
    // Login as rootUser so session grants access even
    //   after accounts are deleted
    cy.loginWithSession({rootUser: true});
  });

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

    cy.get('[data-name=users] tbody tr').should('have.length', 3);

    cy.get('[data-name=users] tbody tr').eq(0).should(($row) => {
      const text = $row.text();
      expect(text).to.match(/1/v);
      expect(text).to.match(/Brett/v);
      expect(text).to.match(/bretto/v);
      expect(text).to.match(/United States/v);
      expect(text).to.match(/\w+, \w+ \d{1,2}, \d{4}/v);
    });

    cy.get('[data-name=users] tbody tr').eq(1).should(($row) => {
      const text = $row.text();
      expect(text).to.match(/2/v);
      expect(text).to.match(/Nicole/v);
      expect(text).to.match(/nicky/v);
      expect(text).to.match(/Iran/v);
      expect(text).to.match(/\w+, \w+ \d{1,2}, \d{4}/v);
    });

    cy.get('[data-name=users] tbody tr').eq(2).should(($row) => {
      const text = $row.text();
      expect(text).to.match(/3/v);
      expect(text).to.match(/Joe/v);
      expect(text).to.match(/\w+, \w+ \d{1,2}, \d{4}/v);
      expect(text).to.not.match(/Brett/v);
      expect(text).to.not.match(/Nicole/v);
    });
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
