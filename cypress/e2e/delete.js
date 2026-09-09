describe('delete / reset (account removal)', function () {
  /**
   * @param {string} token
   * @param {string} path
   * @param {object} body
   * @returns {Cypress.Chainable}
   */
  const post = (token, path, body) => {
    return cy.request({
      url: path,
      method: 'POST',
      failOnStatusCode: false,
      headers: {'X-XSRF-Token': token},
      body
    });
  };

  it('root: deletes another account by username', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.task('addAccountWithMissingNameAndCountry');
    cy.getToken().then((token) => {
      post(token, '/delete', {user: 'Joe'}).its('status').should('eq', 200);
    });
    cy.task('getRecords').then((records) => {
      const users = /** @type {{user: string}[]} */ (records).map(
        ({user}) => user
      );
      expect(users).to.not.include('Joe');
      expect(users).to.include('bretto');
    });
  });

  it('root: 400 when no username is supplied', function () {
    cy.loginWithSession({rootUser: true});
    cy.getToken().then((token) => {
      post(token, '/delete', {}).its('status').should('eq', 400);
    });
  });

  it('non-privileged user cannot delete another account', function () {
    cy.loginWithSession();
    cy.getToken().then((token) => {
      post(token, '/delete', {user: 'nobody'}).its('status').should('eq', 400);
    });
  });

  it('logged-out self-delete is rejected', function () {
    cy.task('deleteAllAccounts');
    cy.getToken().then((token) => {
      post(token, '/delete', {selfdelete: true}).its('status').should(
        'eq', 400
      );
    });
  });

  it('non-privileged user cannot reset', function () {
    cy.loginWithSession();
    cy.getToken().then((token) => {
      post(token, '/reset', {}).its('status').should('eq', 404);
    });
  });

  it('root: reset removes every account', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.getToken().then((token) => {
      post(token, '/reset', {}).its('status').should('eq', 200);
    });
    cy.task('getRecords').then((records) => {
      expect(/** @type {unknown[]} */ (records)).to.have.length(0);
    });
  });
});
