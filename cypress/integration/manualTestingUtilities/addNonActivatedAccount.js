describe('Manual testing', function () {
  it('Add non-activated account', function () {
    cy.task('addNonActivatedAccount');
  });
});
