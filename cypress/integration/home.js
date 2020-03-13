const expressSessionID = 'connect.sid';

describe('Home', function () {
  let NL_EMAIL_PASS;
  before(() => {
    ({
      NL_EMAIL_PASS
    } = Cypress.env());
  });
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
      cy.task('addNonActivatedAccount');
      cy.visit('/home');
    });

    // Moved this to top as was apparently conflicting with another test
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

    it('Delete account', function () {
      cy.get('[data-name="account-form"] .btn-danger').click();
      cy.get('[data-name="modal-body"]').contains(
        'Are you sure you want to delete your account?'
      );
      cy.get('[data-name="modal-confirm"] .btn-danger').click();

      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p',
        {
          timeout: 20000
        }
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
        '[data-name=modal-alert] [data-name=modal-body] p',
        {
          timeout: 20000
        }
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

      // Home after login has no detectable a11y violations on load
      // https://www.npmjs.com/package/cypress-axe
      return cy.visitURLAndCheckAccessibility('/home');
    });

    it('Attempt bad input to server', function () {
      cy.get('[data-name="name"]:invalid').should('have.length', 0);

      const nonEmail = 'nonEmail';
      cy.get('[data-name="email"]').type(nonEmail);
      cy.get('[data-name="email"]:invalid').should('have.length', 1);

      cy.get('[data-name="email"]').clear().type('me@example.name');
      cy.get('[data-name="pass"]').type('boo123456');
      cy.get('[data-name="name"]').type('MyNewName');
      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      cy.get('[data-name="action2"]').click();

      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p'
      ).should('be.hidden');

      cy.get('[data-name="email"]', {
        timeout: 50000
      }).should(($email) => {
        return expect(
          $email[0].validationMessage
        ).to.contain(
          'That email address is already in use'
        );
      });

      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        const {user, name} = accts[0];
        expect(user).to.equal('bretto');
        return expect(name).to.equal('Brett');
      });
    });

    it('Attempt bad input to server (generic error)', function () {
      return cy.simulateServerError({
        url: '/home',
        body: {
          pass: {}
        },
        error: 'Error Updating Account'
      // eslint-disable-next-line promise/prefer-await-to-then
      }).then(() => {
        cy.get('[data-name="email"]').clear().type('me@example.name');
        cy.get('[data-name="pass"]').type('boo123456');
        cy.get('[data-name="name"]').type('MyNewName');
        cy.get('[data-name="action2"]').click();

        cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
          'There was a failure submitting your info'
        );

        // Still the same old pass
        return cy.validUserPassword({
          user: 'bretto',
          pass: NL_EMAIL_PASS
        });
      });
    });

    it('should not update when the session is lost', function () {
      cy.clearCookie('login');
      cy.clearCookie(expressSessionID);

      cy.get('[data-name="email"]').type('brett@example.name');
      cy.get('[data-name="pass"]').type('boo123456');
      cy.get('[data-name="name"]').type('MyNewName');
      cy.get('[data-name="action2"]').click();

      // Todo[>=1.0.0-beta.1]: Don't alert it was updated; alert that session
      //   is no longer valid

      cy.get(
        '[data-name="modal-alert"] [data-name="ok"]'
      ).click();

      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/home');

      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        const {user, name} = accts[0];
        expect(user).to.equal('bretto');
        return expect(name).to.equal('Brett');
      });
    });

    it('should reject client-side forgery of another user', function () {
      cy.get('[data-name="email"]').type('brett@example.name');
      cy.get('[data-name="pass"]').type('boo123456');
      cy.get('[data-name="name"]').type('MyNewName');

      // eslint-disable-next-line max-len
      // eslint-disable-next-line promise/prefer-await-to-then, promise/catch-or-return
      cy.get('[data-name="user"]').then(($user) => {
        $user[0].disabled = false;
        $user[0].value = 'nicky';
        // Ensure got set
        return expect($user[0].value).to.equal('nicky');
      });
      cy.get('[data-name="action2"]').click();

      // Todo: Could alert that user was not valid for session (if so,
      //   check the message here and update expectation below (i.e., that user
      //   name should not have been successfully changed)).

      cy.get(
        '[data-name="modal-alert"] [data-name="ok"]'
      ).click();

      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/home');

      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords').then((accts) => {
        expect(accts).to.have.lengthOf(2);
        expect(accts.some(({user, name}) => {
          // We could change to prevent successful edit of use's *own* name
          return user === 'bretto' && name === 'MyNewName';
        })).to.be.true;
        return expect(accts.some(({user, name}) => {
          return user === 'nicky' && name === 'Nicole';
        })).to.be.true;
      });
    });

    it('Make good update', function () {
      cy.get('[data-name="email"]').type('brett@example.name');
      cy.get('[data-name="pass"]').type('boo123456');
      cy.get('[data-name="name"]').type('MyNewName');
      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      cy.get('[data-name="action2"]').click();
      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p'
      ).contains('Your account has been updated.');
      cy.get(
        '[data-name="modal-alert"] [data-name="ok"]'
      ).click();
      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        const {user, name} = accts[0];
        expect(user).to.equal('bretto');
        return expect(name).to.equal('MyNewName');
      });
    });

    it('Attempt bad client-side input', function () {
      const tooShortOfAName = 'a';
      cy.get('[data-name="email"]').type('brett@example.name');
      cy.get('[data-name="pass"]').type('boo123456');
      cy.get('[data-name="name"]').type(tooShortOfAName).blur();

      cy.get('[data-name="action2"]').click();

      // Todo[>=1.0.0-beta.1]: https://github.com/cypress-io/cypress/issues/6678
      cy.get('[data-name="name"]:invalid').should('have.length', 1);
      // eslint-disable-next-line max-len
      // eslint-disable-next-line promise/catch-or-return, promise/prefer-await-to-then
      cy.get('[data-name="name"]').then(($input) => {
        return expect($input[0].validity.tooShort).to.be.true;
        // return expect($input[0].validationMessage).to.eq(
        //  'Please enter a sufficiently long name'
        // );
      });
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
