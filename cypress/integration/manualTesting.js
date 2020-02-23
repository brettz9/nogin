'use strict';

describe('Manual testing', function () {
  beforeEach(() => {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
  });
  it('Added account for testing', function () {
    // eslint-disable-next-line no-unused-expressions
    expect(true).to.be.true;
  });
});
