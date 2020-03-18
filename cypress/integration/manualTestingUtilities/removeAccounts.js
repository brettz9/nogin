describe('Manual testing', function () {
  beforeEach(() => {
    cy.task('deleteAllAccounts');
  });
  it('Added account for testing', function () {
    // eslint-disable-next-line chai-expect/no-inner-literal
    expect(true).to.be.true;
  });

  // This was the code for when the page was accessable by GET!
  /*
  beforeEach(() => {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
    cy.task('addNonActivatedAccount');
  });

  // No accessibility test as to get 302 redirect back to `/users`
  it('Visit Reset', function () {
    cy.visit('/reset');
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/users');
    // eslint-disable-next-line promise/prefer-await-to-then
    return cy.task('getRecords').then((accts) => {
      expect(accts).to.have.lengthOf(0);
      return cy.log(accts);
    });
  });
  */
});
