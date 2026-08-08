describe('Manual testing', function () {
  beforeEach(() => {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
  });

  it('Added account for testing', function () {
    // eslint-disable-next-line @stylistic/max-len -- Long
    // eslint-disable-next-line chai-expect/no-inner-literal, sonarjs/no-trivial-assertions -- Placeholder
    expect(true).to.be.true;
  });
});
