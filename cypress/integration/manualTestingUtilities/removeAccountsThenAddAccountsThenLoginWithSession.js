describe('Manual testing', function () {
  it('Added account and logged in for testing', function () {
    // eslint-disable-next-line promise/prefer-await-to-then
    return cy.task('hackEnv').then(({
      // NL_EMAIL_USER,
      NL_EMAIL_PASS
    }) => {
      cy.task('deleteAllAccounts');
      cy.task('addAccount');
      // Not just login, but get session, so will be shown `/home`
      //   without redirect upon visit
      return cy.request({
        url: '/',
        method: 'POST',
        body: {
          user: 'bretto',
          pass: NL_EMAIL_PASS
        }
      });
    });
  });
});
