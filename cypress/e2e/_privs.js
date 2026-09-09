describe('_privs', function () {
  it('Is served with `Cache-Control: no-store`', function () {
    cy.task('deleteAllAccounts');
    return cy.request('/_privs').then((resp) => {
      expect(resp.headers).to.have.property('cache-control', 'no-store');
      expect(resp.body).to.include('window.NoginPrivs =');
      expect(resp.body).to.include('"user":null');
      expect(resp.body).to.include('"root":false');
    });
  });

  it('Reports the guest shape as JSON when logged out', function () {
    cy.task('deleteAllAccounts');
    return cy.request('/_privs?format=json').then((resp) => {
      expect(resp.headers).to.have.property('cache-control', 'no-store');
      expect(resp.body.user).to.be.null;
      expect(resp.body.root).to.be.false;
    });
  });

  it('Reports the guest shape as an ESM module when logged out', function () {
    cy.task('deleteAllAccounts');
    return cy.request('/_privs?format=esm').then((resp) => {
      expect(resp.headers['content-type']).to.include('javascript');
      expect(resp.body).to.include('export default ');
      expect(resp.body).to.include('"user":null');
    });
  });

  it('Reports the logged-in root user and `root` status', function () {
    cy.loginWithSession({rootUser: true});
    return cy.request('/_privs?format=json').then((resp) => {
      expect(resp.body.user).to.be.a('string').and.not.be.empty;
      expect(resp.body.root).to.be.true;
    });
  });

  it(
    'Destroys a session whose account has since been deleted (so a ' +
    'configured root user cannot retain access from the session cookie)',
    function () {
      cy.loginWithSession({rootUser: true});
      // The session is live to begin with
      cy.request('/_privs?format=json').its('body').should((body) => {
        expect(body.root).to.be.true;
      });
      cy.task('deleteAllAccounts');
      return cy.request('/_privs?format=json').then((resp) => {
        expect(resp.body.user).to.be.null;
        expect(resp.body.root).to.be.false;
      });
    }
  );

  it(
    'Destroys a session whose account has since been deactivated',
    function () {
      cy.loginWithSession();
      cy.request('/_privs?format=json').its('body').should((body) => {
        expect(body.user).to.equal('bretto');
      });
      cy.task('updateAccountToInactive');
      return cy.request('/_privs?format=json').then((resp) => {
        expect(resp.body.user).to.be.null;
        expect(resp.body.root).to.be.false;
      });
    }
  );
});
