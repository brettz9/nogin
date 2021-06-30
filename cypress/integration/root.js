// Todo: For selectors, we might directly load the view files here so that
//   we don't tie our tests to specific selectors
// Todo: For other UI tests, ideally ensure important server state
//   is checked, not only by the resulting UI (which could change)
// Todo: Add an environmental variable which toggled between
//   time-saving server-side state-setting and checking, and full pipelines
//   of setting/checking state by UI and then using UI to visit a page being
//   tested; this full pipeline could be run much less frequently but besides
//   for extra sanity-checking (in case the server state-setting code
//   itself was buggy or was misapplied in the test) to
//   ensure the server-side state-setting wasn't falsely indicating
//   server-side coverage passing when the UI tests weren't otherwise
//   triggering that server-side code (i.e., only the state-setting or
//   getting did).
// Todo: Add accessibility tests for small error response messages
//   not yet covered.

const expressSessionID = 'connect.sid';

describe('Root (Login) - Accessibility', function () {
  // https://www.npmjs.com/package/cypress-axe
  it('Root has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/');
  });
});

describe('Root (Login)', function () {
  let env, NL_EMAIL_USER, NL_EMAIL_PASS;
  before(() => {
    ({
      env,
      NL_EMAIL_USER,
      NL_EMAIL_PASS
    } = Cypress.env());
  });
  beforeEach(() => {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
    cy.visit('/');
  });

  it('Visit root and login with Remember Me', function () {
    // Click twice to check toggling behavior
    cy.get('[data-name=btn_remember]').click();
    cy.get('[data-name=btn_remember]').click();
    /*
    // Signs up but no UI-only way to get and add activation code
    //   needed for login; however, keeping below for reference in
    //   the event we decide to add a more precise yet slower UI
    //   test from end-to-end
    cy.visit('/signup');
    cy.get('[data-name="name"]').type('Brett');
    cy.get('[data-name="email"]').type(NL_EMAIL_USER);
    cy.get('[data-name="country"]').select('US');
    cy.get('[data-name="user"]').type('bretto');
    cy.get('[data-name="pass"]').type(NL_EMAIL_PASS);
    cy.get('[data-name="pass-confirm"]').type(NL_EMAIL_PASS);
    cy.get('[data-name=account-form] [data-name=action2]').click();
    cy.get('[data-name=modal-alert] [data-name=ok]').click({
      timeout: 20000
    });
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/');
    */

    cy.get('[data-name="user"]').type('bretto');
    cy.get('[data-name="pass"]').type(NL_EMAIL_PASS);
    cy.get('[data-name="btn_sign_in"]').click();
    cy.getCookie('login').should('have.property', 'value');

    cy.get('[data-name=account-form] .btn-danger').click();
    cy.get('[data-name=modal-confirm] .btn-danger').click();

    cy.get('[data-name=modal-alert] [data-name=modal-title]').contains(
      'Success!'
    );
    return cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/home');
  });

  it('Login attempt fails without CSRF token', function () {
    return cy.request({
      url: '/login',
      method: 'POST',
      timeout: 50000,
      failOnStatusCode: false,
      // NO `X-XSRF-Token` HEADER
      body: {
        user: 'bretto',
        pass: NL_EMAIL_PASS
      }
    // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    }).then((resp) => {
      return expect(resp.status).to.equal(404);
    });
  });

  it('Visit root and login with Remember Me button disabled', function () {
    cy.get('[data-name=btn_remember]').click();
    cy.get('[data-name="user"]').type('bretto');
    cy.get('[data-name="pass"]').type(NL_EMAIL_PASS);
    cy.get('[data-name="btn_sign_in"]').click();
    cy.getCookie('login').should('not.exist');

    cy.get('[data-name=account-form] .btn-danger').click();
    cy.get('[data-name=modal-confirm] .btn-danger').click();

    cy.get('[data-name=modal-alert] [data-name=modal-title]').contains(
      'Success!'
    );
    return cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/home');
  });

  it(
    'Visit root and login and make login attempt with bad password',
    function () {
      cy.get('[data-name="user"]').type('bretto');
      const mismatchedPass = 'mismatchedPass';
      cy.get('[data-name="pass"]').type(mismatchedPass);
      cy.get('[data-name="btn_sign_in"]').click();

      cy.get('[data-name=modal-alert] [data-name="modal-title"]').contains(
        'Login Failure'
      );
      cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
        'Please check your username and/or password'
      );
      return cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    }
  );

  it(
    'Visit root and login and make login attempt with bad user',
    function () {
      cy.get('[data-name="user"]').type('breeeeee');
      cy.get('[data-name="pass"]').type('somePass');
      cy.get('[data-name="btn_sign_in"]').click();

      cy.get('[data-name=modal-alert] [data-name="modal-title"]').contains(
        'Login Failure'
      );
      cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
        'Please check your username and/or password'
      );
      return cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    }
  );

  it(
    'Visit root and login and make login attempt with user added ' +
      'with bad password version',
    function () {
      cy.task('addAccountWithBadPassVersion');
      cy.get('[data-name="user"]').type('Frankee');
      cy.get('[data-name="pass"]').type('ooo123456');
      cy.get('[data-name="btn_sign_in"]').click();

      cy.get('[data-name=modal-alert] [data-name="modal-title"]').contains(
        'Login Failure'
      );
      cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
        'There is a mismatch in the user data format. Please contact ' +
          'the site administrator with this message.'
      );
      return cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    }
  );

  // Though similar to the above, this trigger server coverage
  //  of a generic error.
  it('Handle generic server error upon login attempt', function () {
    return cy.simulateServerError({
      url: '/',
      body: {
        user: 'bretto',
        pass: null
      },
      error: 'The "password" argument must be'
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      const passwordToPassClientValidation = 'abc123456';
      cy.get('[data-name="user"]').type('bretto');
      cy.get('[data-name="pass"]').type(passwordToPassClientValidation);
      cy.get('[data-name="btn_sign_in"]').click();

      cy.get('[data-name=modal-alert] [data-name="modal-title"]').contains(
        'Login Failure'
      );
      cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
        'Please check your username and/or password'
      );
      return cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    });
  });

  it('Retrieve lost password', function () {
    this.timeout(200000);
    cy.task('deleteEmails', null, {timeout: 100000});
    cy.get('[data-name="forgot-password"]').click();
    cy.get('[data-name="email"]').type(NL_EMAIL_USER);
    cy.get('[data-name=retrieve-password-submit]').click();
    cy.get('[data-name=alert]').contains(
      'A link to reset your password was emailed to you',
      {
        timeout: 60000
      }
    );
    // We don't know exactly how long until the email will be delivered
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(15000);
    // Check that password was received by email
    return cy.task('hasEmail', {
      subject: 'Password Reset',
      html: [
        'Click here to reset your password',
        '<a href=',
        'reset-password?key='
      ]
      // eslint-disable-next-line promise/prefer-await-to-then
    }, {timeout: 70000}).then((hasEmail) => {
      // Todo: In full UI testing mode, we could look for the link and
      //   visit it.
      return expect(hasEmail).to.be.true;
    });
  });

  it(
    'Shows failures on attempted retrieval of lost password with bad email',
    function () {
      cy.get('[data-name="forgot-password"]').click();
      cy.get('[data-name="email"]').type('not-an-email');
      cy.get('[data-name=retrieve-password-submit]').click();
      return cy.get('[data-name="email"]').should((user) => {
        expect(user[0].checkValidity()).to.equal(false);
        return expect(user[0].validationMessage).to.contain(
          'Please enter a valid email address'
        );
      });
    }
  );

  it('Displays error with failure on dispatching lost password', function () {
    cy.task('addAccountWithBadEmail');
    const badButExistingEmail = 'badEmail';
    return cy.simulateServerError({
      tokenURL: '/',
      url: '/lost-password',
      body: {
        email: badButExistingEmail
      },
      error: 'Unable to dispatch password reset'
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      const okEmailToBypassValidationAndGetToStub = 'example@example.name';
      cy.get('[data-name="forgot-password"]').click();
      cy.get('[data-name="email"]').type(okEmailToBypassValidationAndGetToStub);
      cy.get('[data-name=retrieve-password-submit]').click();

      // Could check that email is not present, but with problems in deleting
      //  emails currently, this would not be true, and whether it was sent
      //  or not is not too important here.
      return cy.get(
        '[data-name="retrieve-password"] [data-name=alert]'
      ).contains(
        'Sorry. There was a problem, please try again later'
      );
    });
  });

  // 'Sorry. There was a problem, please try again later.',
  it(
    'Err upon attempt to retrieve lost password for non-existent email',
    function () {
      cy.get('[data-name="forgot-password"]').click();
      cy.get('[data-name="email"]').type('bad@bad-email.com');
      cy.get('[data-name=retrieve-password-submit]').click();
      cy.get('[data-name=alert]').contains(
        'Email not found. Are you sure you entered it correctly?',
        {
          timeout: 20000
        }
      );
    }
  );

  it('Cancel retrieve password dialog', function () {
    cy.get('[data-name="forgot-password"]').click();
    // Cypress needs us to wait to be able to find the
    //   dialog to dismiss it
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get('[data-name="retrieve-password-cancel"]').click();
    cy.get('[data-name="login"] [data-name="user"]', {
      timeout: 8000
    }).should(
      'have.focus'
    );
  });

  it('Should validate against missing user value', function () {
    cy.get('[data-name="pass"]').type(NL_EMAIL_PASS);
    cy.get('[data-name="btn_sign_in"]').click();
    return cy.get('[data-name="user"]').should((user) => {
      return expect(user[0].checkValidity()).to.equal(false);
    });
  });
  it('Should validate against missing pass value', function () {
    cy.get('[data-name="user"]').type('bretto');
    cy.get('[data-name="btn_sign_in"]').click();
    cy.get('[data-name="pass"]').should((pass) => {
      expect(pass[0].checkValidity()).to.equal(false);
    });
  });

  it('Visit auto-logging-in root after initial login', function () {
    cy.log(env);
    // See `hackEnv` on how apparently not working and why we need this hack
    // const secure = Cypress.env('env') === 'production'
    const secure = env === 'production';
    return cy.login({
      user: 'bretto',
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1',
      secure
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((key) => {
      cy.visit('/');
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/home');

      cy.log(key);
      cy.getCookie('login').should('have.property', 'value', key);
      cy.getCookie('login').should('have.property', 'secure', secure);

      return cy.getCookie(expressSessionID).should('exist');
    });
  });

  it(
    'Visit auto-logging-in root after initial login and with redirect',
    function () {
      cy.log(env);
      // See `hackEnv` on how apparently not working and why we need this hack
      // const secure = Cypress.env('env') === 'production'
      const secure = env === 'production';
      return cy.login({
        user: 'bretto',
        // ipv6 read by Express
        ip: '::ffff:127.0.0.1',
        secure
      // Cypress won't run the tests with an `await` here
      // eslint-disable-next-line promise/prefer-await-to-then
      }).then((key) => {
        cy.visit('/?redirect=/signup');
        cy.location('pathname', {
          timeout: 10000
        }).should('eq', '/signup');

        cy.log(key);
        cy.getCookie('login').should('have.property', 'value', key);
        cy.getCookie('login').should('have.property', 'secure', secure);

        return cy.getCookie(expressSessionID).should('exist');
      });
    }
  );

  it(
    'Visit auto-logging-in root after initial login and with redirect',
    function () {
      cy.log(env);
      // See `hackEnv` on how apparently not working and why we need this hack
      // const secure = Cypress.env('env') === 'production'
      const secure = env === 'production';
      return cy.login({
        user: 'bretto',
        // ipv6 read by Express
        ip: '::ffff:127.0.0.1',
        secure
      // Cypress won't run the tests with an `await` here
      // eslint-disable-next-line promise/prefer-await-to-then
      }).then((key) => {
        cy.visit('/?redirect=http://ignore-redirect-with-colons.com');
        cy.location('pathname', {
          timeout: 10000
        }).should('eq', '/home');

        cy.log(key);
        cy.getCookie('login').should('have.property', 'value', key);
        cy.getCookie('login').should('have.property', 'secure', secure);

        return cy.getCookie(expressSessionID).should('exist');
      });
    }
  );

  it(
    'Successful `validateLoginKey` but mismatched `autoLogin`',
    function () {
      cy.loginWithSession();
      cy.task('updateAccountToInactive');
      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords').then((accts) => {
        expect(accts).to.have.lengthOf(1);
        expect(accts[0].activated).to.be.false;
        return cy.visit('/');
      });
    }
  );

  it('should reject bad login even in proper cookie format', function () {
    const secure = Cypress.env('env') === 'production';
    return cy.login({
      user: 'bretto',
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1',
      // Won't have server secret, so try our own
      badSecret: 'abcdabcdabcd',
      secure
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((key) => {
      cy.getCookie('login').should('have.property', 'value', key);
      cy.getCookie('login').should('have.property', 'secure', secure);

      return cy.getCookie(expressSessionID).should('exist');
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      cy.visit('/');
      return cy.location('pathname', {
        timeout: 10000
      }).should('not.equal', '/home');
    });
  });
});
