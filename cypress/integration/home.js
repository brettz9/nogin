const expressSessionID = 'connect.sid';

describe('Home', function () {
  it(
    'Visit Home and be redirected when no session (no post to `/`, ' +
    '`/home` or GET to auto-login at `/` (from previous-set cookie ' +
    'posting to `/`)).',
    function () {
      cy.task('deleteAllAccounts');
      cy.visit('/home');
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    }
  );
  describe('Pre-logging in with session', function () {
    beforeEach(() => {
      cy.loginWithSession();
      cy.visit('/home');
    });
    it('Delete account', function () {
      cy.get('[data-name="account-form"] .btn-danger').click();
      cy.get('[data-name="modal-body"]').contains(
        'Are you sure you want to delete your account?'
      );
      cy.get('[data-name="modal-confirm"] .btn-danger').click();

      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p'
      ).contains('Your account has been deleted.');

      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');

      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        expect(accts).to.have.lengthOf(0);
        return cy.log(accts);
      });
    });
    it('Problem with deleting (already-logged out) account', function () {
      // E.g., if user cleared their cookies
      cy.clearCookie('login');
      cy.clearCookie(expressSessionID);

      cy.get('[data-name="account-form"] .btn-danger').click();
      cy.get('[data-name="modal-body"]').contains(
        'Are you sure you want to delete your account?'
      );
      cy.get('[data-name="modal-confirm"] .btn-danger').click();

      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p'
      ).contains('Record not found');

      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');

      // User not deleted here, just not able to delete account when
      //  session was destroyed
      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        const {user} = accts[0];
        expect(user).to.equal('bretto');
        return cy.log(accts);
      });
    });
    it('Visit Home again', function () {
      cy.getCookie(expressSessionID).should('exist');

      cy.get('[data-name="navbar-brand"]', {
        timeout: 10000
      }).contains('Control Panel');

      // Todo[>=1.7.0]: Check good and bad update and logout (latter
      //  needs server stub)

      // Home after login has no detectable a11y violations on load
      // https://www.npmjs.com/package/cypress-axe
      return cy.visitURLAndCheckAccessibility('/home');
    });

    it('Should log out', function () {
      cy.getCookie('login').should('exist');
      cy.getCookie(expressSessionID).should('exist');

      cy.get('[data-name="btn-logout"]').click();

      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p'
      ).contains('You are now logged out.');

      cy.getCookie('login').should('not.exist');

      //  Can't check that session is dropped by checking `expressSessionID`
      //  (`"connect.sid"`) as it does not get seem to get reset. However,
      //  it does seem to get dropped after server visit and can check this
      //  (where we're expected to be redirected).
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    });

    it('Should show error upon bad log out', function () {
      cy.getCookie('login').should('exist');
      cy.getCookie(expressSessionID).should('exist');

      cy.server();
      cy.route({
        status: 500,
        url: '/logout',
        method: 'POST',
        response: 'oops'
      });

      cy.get('[data-name="btn-logout"]').click();

      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p'
      ).contains('There was a problem logging out');

      cy.getCookie('login').should('exist');

      /*
      // Could check this in full UI mode to ensure session is not dropped.
      cy.visit('/home');
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/home');
      */
    });
  });
});
