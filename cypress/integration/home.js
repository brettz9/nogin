const expressSessionID = 'connect.sid';

describe('Home', function () {
  let NL_EMAIL_PASS, NL_EMAIL_USER;
  before(() => {
    ({
      NL_EMAIL_PASS, NL_EMAIL_USER
    } = Cypress.env());
  });

  it('Fails with reuse of old token', function () {
    cy.task('deleteEmails', null, {timeout: 100000});
    cy.loginWithSession({
      nondefaultEmail: true
    });
    cy.task('addNonActivatedAccount');

    const url = '/';
    let tkn;
    // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    return cy.getToken(url).then((token) => {
      tkn = token;
      return cy.request({
        url,
        method: 'POST',
        timeout: 50000,
        headers: {
          'X-XSRF-Token': token
        },
        body: {
          user: 'bretto',
          pass: NL_EMAIL_PASS
        }
      });
    // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    }).then(() => {
      cy.visit('/');

      const csurfCookie = '_csrf';
      cy.clearCookie(csurfCookie);

      return cy.request({
        url,
        method: 'POST',
        timeout: 50000,
        failOnStatusCode: false,
        headers: {
          'X-XSRF-Token': tkn
        },
        body: {
          user: 'bretto',
          pass: NL_EMAIL_PASS
        }
      });
    // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    }).then((resp) => {
      return expect(resp.status).to.equal(404);
    });
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
  describe('Changing email', function () {
    beforeEach(() => {
      cy.task('deleteEmails', null, {timeout: 100000});
      cy.loginWithSession({
        nondefaultEmail: true
      });
      cy.task('addNonActivatedAccount');
      cy.visit('/home');
    });
    it('Make good update (with same user but different email)', function () {
      this.timeout(80000);
      const startingEmail = 'brettz95@example.name';
      const newEmail = NL_EMAIL_USER;
      cy.get('[data-name="email"]').clear().type(newEmail);
      cy.get('[data-name="pass"]').clear().type('boo123456');
      cy.get('[data-name="name"]').clear().type('MyNewName');
      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      cy.get('[data-name="country"]').select('FR');
      cy.get('[data-name="action2"]').click();

      // Cypress needs us to wait to be able to find the
      //   dialog to dismiss it
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      cy.get(
        '[data-confirm-type="notice"] [data-name="submit-confirm"]'
      ).click();

      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p',
        {timeout: 50000}
      ).contains('Your account has been updated but your email address');
      cy.get(
        '[data-name="modal-alert"] [data-name="ok"]'
      ).click();
      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        const {user, name, country, email} = accts[0];
        expect(user).to.equal('bretto');
        // Hasn't been activated yet, so keeps old email for now
        expect(email).to.equal(startingEmail);
        expect(country).to.equal('FR');
        return expect(name).to.equal('MyNewName');
        // eslint-disable-next-line promise/prefer-await-to-then
      }).then(() => {
        // We don't know exactly how long until the email will be delivered
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(15000);
        return cy.task('getMostRecentEmail', {timeout: 90000});
        // eslint-disable-next-line promise/prefer-await-to-then
      }).then(({html, subject, emailDisabled}) => {
        if (emailDisabled) {
          // eslint-disable-next-line promise/no-return-wrap
          return Promise.resolve(true);
        }
        // A bit of redundancy with `hasEmail`, but we want to get the link too
        expect(subject).to.equal('Account Activation');
        expect([
          'Please click here to activate your account',
          '<a href=',
          'activation?c='
        ].every((str) => {
          return html.includes(str);
        })).to.be.true;
        const match = html.match(/activation\?c=(?<activationCode>[^'"]*)/u);
        const {activationCode} = (match || {groups: {}}).groups;
        expect(activationCode).to.be.ok;
        cy.visit('/activation?c=' + encodeURIComponent(activationCode));
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.resolve(false);
        // eslint-disable-next-line promise/prefer-await-to-then
      }).then((emailDisabled) => {
        if (emailDisabled) {
          // eslint-disable-next-line promise/no-return-wrap
          return Promise.resolve(true);
        }
        return cy.task('getRecords', {user: ['bretto']});
        // eslint-disable-next-line promise/prefer-await-to-then
      }).then((accts) => {
        if (accts === true) {
          // eslint-disable-next-line promise/no-return-wrap
          return Promise.resolve(true);
        }
        const {user, name, country, email} = accts[0];
        expect(user).to.equal('bretto');
        // Should now be activated, so check that
        expect(email).to.equal(newEmail);
        expect(country).to.equal('FR');
        return expect(name).to.equal('MyNewName');
      });
    });

    it(
      'Make good update (with same user but different email) but ' +
        'simulate visiting activation link too late',
      function () {
        this.timeout(100000);
        const startingEmail = 'brettz95@example.name';
        const newEmail = NL_EMAIL_USER;
        cy.get('[data-name="email"]').clear().type(newEmail);
        cy.get('[data-name="pass"]').clear().type('boo123456');
        cy.get('[data-name="name"]').clear().type('MyNewName');
        cy.get('[data-name="name"]:invalid').should('have.length', 0);
        cy.get('[data-name="country"]').select('FR');
        cy.get('[data-name="action2"]').click();

        // Cypress needs us to wait to be able to find the
        //   dialog to dismiss it
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);
        cy.get(
          '[data-confirm-type="notice"] [data-name="submit-confirm"]'
        ).click();

        cy.get('[data-name="name"]:invalid').should('have.length', 0);
        cy.get(
          '[data-name=modal-alert] [data-name=modal-body] p',
          {timeout: 60000}
        ).contains('Your account has been updated but your email address');
        cy.get(
          '[data-name="modal-alert"] [data-name="ok"]'
        ).click();
        // eslint-disable-next-line promise/prefer-await-to-then
        return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
          const {user, name, country, email} = accts[0];
          expect(user).to.equal('bretto');
          // Hasn't been activated yet, so keeps old email for now
          expect(email).to.equal(startingEmail);
          expect(country).to.equal('FR');
          return expect(name).to.equal('MyNewName');
          // eslint-disable-next-line promise/prefer-await-to-then
        }).then(() => {
          // We don't know exactly how long until the email will be delivered
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(15000);
          return cy.task('getMostRecentEmail', {timeout: 90000});
          // eslint-disable-next-line promise/prefer-await-to-then
        }).then(({html, subject, emailDisabled}) => {
          if (emailDisabled) {
            // eslint-disable-next-line promise/no-return-wrap
            return Promise.resolve(true);
          }
          // A bit of redundancy with `hasEmail`, but we want to get
          //  the link too
          expect(subject).to.equal('Account Activation');
          expect([
            'Please click here to activate your account',
            '<a href=',
            'activation?c='
          ].every((str) => {
            return html.includes(str);
          })).to.be.true;
          const match = html.match(/activation\?c=(?<activationCode>[^'"]*)/u);
          const {activationCode} = (match || {groups: {}}).groups;
          expect(activationCode).to.be.ok;

          // WE SIMULATE THE DELAY HERE
          cy.task('simulateOldActivationRequestDate');
          // END SIMULATION

          cy.visit('/activation?c=' + encodeURIComponent(activationCode), {
            failOnStatusCode: false
          });
          cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
            'The activation code provided was invalid.'
          );
          // eslint-disable-next-line promise/no-return-wrap
          return Promise.resolve(false);
          // eslint-disable-next-line promise/prefer-await-to-then
        }).then((emailDisabled) => {
          if (emailDisabled) {
            // eslint-disable-next-line promise/no-return-wrap
            return Promise.resolve(true);
          }
          return cy.task('getRecords', {user: ['bretto']});
          // eslint-disable-next-line promise/prefer-await-to-then
        }).then((accts) => {
          if (accts === true) {
            // eslint-disable-next-line promise/no-return-wrap
            return Promise.resolve(true);
          }
          const {user, name, country, email, unactivatedEmail} = accts[0];
          expect(user).to.equal('bretto');

          // Should not have been activated as we were too late, so
          //  should have oldemail
          expect(email).to.equal(startingEmail);

          // It should still have kept the desired email
          expect(unactivatedEmail).to.equal(newEmail);

          expect(country).to.equal('FR');
          return expect(name).to.equal('MyNewName');
        });
      }
    );
  });
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

    it('Allows canceling of deleting account', function () {
      cy.get('[data-name="account-form"] .btn-danger').click();
      cy.get('[data-name="modal-body"]').contains(
        'Are you sure you want to delete your account?'
      );
      cy.get(
        '[data-confirm-type="deleteAccount"] [data-name="cancel"]'
      ).click();
      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        expect(accts).to.have.lengthOf(1);
        return cy.log(accts);
      });
    });

    it('Delete account', function () {
      cy.get('[data-name="account-form"] .btn-danger').click();
      cy.get('[data-name="modal-body"]').contains(
        'Are you sure you want to delete your account?'
      );
      cy.get('[data-confirm-type="deleteAccount"] .btn-danger').click();

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

    it('Delete user attempt fails without CSRF token', function () {
      return cy.request({
        url: '/delete',
        method: 'POST',
        timeout: 50000,
        failOnStatusCode: false
        // NO `X-XSRF-Token` HEADER
      // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
      }).then((resp) => {
        return expect(resp.status).to.equal(404);
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
      cy.get('[data-confirm-type="deleteAccount"] .btn-danger').click();

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

    it('Allows canceling of submission after changed email', function () {
      const emailOfAnotherUser = 'me@example.name';
      cy.get('[data-name="email"]').clear().type(emailOfAnotherUser);
      cy.get('[data-name="pass"]').clear().type('boo123456');
      cy.get('[data-name="name"]').clear().type('MyNewName');
      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      cy.get('[data-name="action2"]').click();
      cy.get(
        '[data-confirm-type="notice"] [data-name="cancel"]'
      ).click();
      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        expect(accts).to.have.lengthOf(1);
        expect(accts[0].email).to.equal(NL_EMAIL_USER);
        return cy.log(accts);
      });
    });

    it('Attempt bad input to server', function () {
      cy.get('[data-name="name"]:invalid').should('have.length', 0);

      const nonEmail = 'nonEmail';
      cy.get('[data-name="email"]').clear().type(nonEmail);
      cy.get('[data-name="email"]:invalid').should('have.length', 1);

      const emailOfAnotherUser = 'me@example.name';
      cy.get('[data-name="email"]').clear().type(emailOfAnotherUser);
      cy.get('[data-name="pass"]').clear().type('boo123456');
      cy.get('[data-name="name"]').clear().type('MyNewName');
      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      cy.get('[data-name="action2"]').click();
      cy.get(
        '[data-confirm-type="notice"] [data-name="submit-confirm"]'
      ).click();

      cy.get(
        '[data-confirm-type="notice"] [data-name="submit-confirm"]'
      ).click();

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
        const {user, name, email} = accts[0];
        expect(user).to.equal('bretto');
        expect(email).to.equal(NL_EMAIL_USER);
        expect(name).to.equal('Brett');
        return cy.task('getRecords', {user: ['nicky']});
        // eslint-disable-next-line promise/prefer-await-to-then
      }).then((accts) => {
        const {user, name, email} = accts[0];
        expect(user).to.equal('nicky');
        expect(email).to.equal(emailOfAnotherUser);
        return expect(name).to.equal('Nicole');
      });
    });

    it(
      'Attempt bad input to server (circumventing client-side validation) ' +
        'and to simulate a server email-sending error, followed by successful' +
        'update',
      function () {
        const badEmail = 'badEmail';
        // Todo: Should probably send to a legitimate email that we
        //  can auto-delete (without getting a forwarding error)
        const validEmail = 'brettz9@example.name';
        return cy.simulateServerError({
          url: '/home',
          times: 1,
          body: {
            email: badEmail,
            name: 'MyNewName',
            country: 'FR',
            pass: NL_EMAIL_PASS
          },
          error: 'problem-dispatching-link'
          // eslint-disable-next-line promise/prefer-await-to-then
        }).then(() => {
          const goodEmailToPassClientValidation = NL_EMAIL_USER;
          cy.get('[data-name="email"]').clear().type(
            goodEmailToPassClientValidation
          );
          cy.get('[data-name="pass"]').clear().type(NL_EMAIL_PASS);
          cy.get('[data-name="name"]').clear().type('MyNewName');
          cy.get('[data-name="action2"]').click();

          cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
            'While your account was otherwise updated'
          );
          cy.get('[data-name="ok"]').click();

          return cy.task('getRecords', {user: ['bretto']});
          // eslint-disable-next-line promise/prefer-await-to-then
        }).then((accts) => {
          const {user, name, country, email, unactivatedEmail} = accts[0];
          expect(user).to.equal('bretto');
          expect(email).to.equal(NL_EMAIL_USER);
          // Should probably be preventing the server from saving this,
          //  but useful to trigger error and check our behavior
          expect(unactivatedEmail).to.equal(badEmail);
          expect(country).to.equal('FR');
          return expect(name).to.equal('MyNewName');
          // eslint-disable-next-line promise/prefer-await-to-then
        }).then(() => {
          cy.get('[data-name="email"]').clear().type(
            validEmail
          );
          cy.get('[data-name="pass"]').clear().type(NL_EMAIL_PASS);
          cy.get('[data-name="name"]').clear().type('YetAnotherName');
          cy.get('[data-name="action2"]').click();
          // Cypress needs us to wait to be able to find the
          //   dialog to dismiss it (at least when visually viewing tests)
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(500);
          cy.get(
            '[data-confirm-type="notice"] [data-name="submit-confirm"]'
          ).click();

          cy.get(
            '[data-name=modal-alert] [data-name=modal-body] p'
          ).should('be.hidden');

          return cy.task('getRecords', {user: ['bretto']});
          // eslint-disable-next-line max-len -- Long
          // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
        }).then((accts) => {
          const {user, name, country, email, unactivatedEmail} = accts[0];
          expect(user).to.equal('bretto');
          expect(unactivatedEmail).to.equal(validEmail);
          expect(email).to.equal(NL_EMAIL_USER);
          expect(country).to.equal('FR');
          expect(name).to.equal('YetAnotherName');
        });
      }
    );

    it('Attempt bad input to server (generic error)', function () {
      return cy.simulateServerError({
        url: '/home',
        body: {
          email: NL_EMAIL_USER,
          name: 'MyNewName',
          pass: {}
        },
        error: 'Error Updating Account'
      // eslint-disable-next-line promise/prefer-await-to-then
      }).then(() => {
        cy.get('[data-name="email"]').clear().type(NL_EMAIL_USER);
        const goodPasswordToPassClientValidation = 'boo123456';
        cy.get('[data-name="pass"]').clear().type(
          goodPasswordToPassClientValidation
        );
        cy.get('[data-name="name"]').clear().type('MyNewName');
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
      this.timeout(30000);
      cy.clearCookie('login');
      cy.clearCookie(expressSessionID);

      cy.get('[data-name="email"]').clear().type(NL_EMAIL_USER);
      cy.get('[data-name="pass"]').clear().type('boo123456');
      cy.get('[data-name="name"]').clear().type('MyNewName');
      cy.get('[data-name="action2"]').click();

      cy.get('[data-name=modal-alert] [data-name=modal-body] p', {
        timeout: 20000
      }).contains(
        'Your session has been lost'
      );

      cy.get(
        '[data-name="modal-alert"] [data-name="ok"]'
      ).click();

      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');

      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        const {user, name} = accts[0];
        expect(user).to.equal('bretto');
        return expect(name).to.equal('Brett');
      });
    });

    it('should reject client-side forgery of another user', function () {
      // If we use the exploiter's own email, will get error of the email
      //  already existing, and as we aren't testing new emails here,
      //   we just use the targeted user's existing email
      cy.get('[data-name="email"]').clear().type(NL_EMAIL_USER);
      cy.get('[data-name="pass"]').clear().type('boo123456');
      cy.get('[data-name="name"]').clear().type('MyNewName');

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

    it(
      'Shows old values and makes good update (with same user and same email)',
      function () {
        cy.get('[data-name="name"]').should('have.value', 'Brett');
        cy.get('[data-name="email"]').should('have.value', NL_EMAIL_USER);
        cy.get('[data-name="country"] option[value="US"]').should(
          'be.selected'
        );
        cy.get('[data-name="user"]').should('have.value', 'bretto');
        const passwordNotAutoAdded = '';
        cy.get('[data-name="pass"]').should('have.value', passwordNotAutoAdded);

        cy.get('[data-name="email"]').clear().type(NL_EMAIL_USER);
        cy.get('[data-name="pass"]').clear().type('boo123456');
        cy.get('[data-name="name"]').clear().type('MyNewName');
        cy.get('[data-name="country"]').select('');
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
          const {user, name, email, country} = accts[0];
          expect(user).to.equal('bretto');
          expect(email).to.equal(NL_EMAIL_USER);
          expect(country).to.equal('');
          return expect(name).to.equal('MyNewName');
        });
      }
    );

    it('Prevent update with empty email', function () {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000);
      cy.get('[data-name="pass"]').clear().type('boo123456');
      cy.get('[data-name="name"]').clear().type('MyNewName');
      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      cy.get('[data-name="action2"]').click();

      // todo[cypress@>9.0.0]: `:invalid`: see if fixed:
      //   https://github.com/cypress-io/cypress/issues/6678
      cy.get('[data-name="email"]:invalid').should('have.length', 1);
      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords', {user: ['bretto']}).then((accts) => {
        const {user, name, email} = accts[0];
        expect(user).to.equal('bretto');
        expect(email).to.equal(NL_EMAIL_USER);
        return expect(name).to.equal('Brett');
      });
    });

    it('Attempt bad client-side input', function () {
      const tooShortOfAName = 'a';
      cy.get('[data-name="email"]').clear().type(NL_EMAIL_USER);
      cy.get('[data-name="pass"]').clear().type('boo123456');
      cy.get('[data-name="name"]').clear().type(tooShortOfAName).blur();

      cy.get('[data-name="action2"]').click();

      // todo[cypress@>9.0.0]: `:invalid`: see if fixed:
      //   https://github.com/cypress-io/cypress/issues/6678
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

      cy.intercept({
        method: 'POST',
        url: '/logout'
      }, {
        statusCode: 500,
        body: 'oops'
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
