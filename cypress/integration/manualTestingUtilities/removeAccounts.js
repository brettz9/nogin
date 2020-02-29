describe('Manual testing', function () {
  beforeEach(() => {
    cy.task('deleteAllAccounts');
  });
  it('Added account for testing', function () {
    // eslint-disable-next-line chai-expect/no-inner-literal
    expect(true).to.be.true;
  });
});
