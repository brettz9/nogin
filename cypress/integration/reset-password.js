const expressSessionID = 'connect.sid';

describe('Reset password', function () {
  let NL_EMAIL_USER, NL_EMAIL_PASS;
  before(() => {
    ({
      NL_EMAIL_USER,
      NL_EMAIL_PASS
    } = Cypress.env());
  });
  beforeEach(() => {
    cy.task('deleteAllAccounts');
    cy.task('addAccount');
  });

  // https://www.npmjs.com/package/cypress-axe
  it('reset-password has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/reset-password');
  });

  it('Visit reset password', function () {
    cy.visit('/reset-password');
  });

  it('Reset password attempt fails without CSRF token', function () {
    return cy.request({
      url: '/reset-password',
      method: 'POST',
      timeout: 50000,
      failOnStatusCode: false
      // NO `X-XSRF-Token` HEADER
    // eslint-disable-next-line promise/prefer-await-to-then -- Cypress
    }).then((resp) => {
      return expect(resp.status).to.equal(404);
    });
  });

  it('Report errors of insufficiently long passwords', function () {
    return cy.task('generatePasswordKey', {
      email: NL_EMAIL_USER,
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1'
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((key) => {
      cy.log(key);
      cy.visit('/reset-password?key=' + encodeURIComponent(key));
      cy.get('[data-name=enter-new-pass-label]').contains(
        'Please enter your new password'
      );
      // cy.get('[data-name="name"]:invalid').should('have.length', 0);

      const tooShortPassword = 'a';
      cy.get('[data-name="reset-pass"]').type(tooShortPassword);
      // cy.get('[data-name="reset-password-submit"]').click();

      // todo[cypress@>9.0.0]: `:invalid`: see if fixed:
      //   https://github.com/cypress-io/cypress/issues/6678
      cy.get('[data-name="reset-pass"]:invalid').should('have.length', 1);
      return cy.get('[data-name="reset-pass"]');
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then(($input) => {
      expect($input[0].checkValidity()).to.equal(false);
      return expect($input[0].validity.tooShort).to.be.true;
      // return expect($input[0].validationMessage).to.eq(
      //  'Please enter a sufficiently long name'
      // );
    });
  });

  it('Visit reset password (after login)', function () {
    return cy.task('generatePasswordKey', {
      email: NL_EMAIL_USER,
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1'
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line max-len
    // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
    }).then((key) => {
      cy.log(key);
      cy.visit('/reset-password?key=' + encodeURIComponent(key));
      cy.get('[data-name=enter-new-pass-label]').contains(
        'Please enter your new password'
      );
      cy.get('[data-name="reset-pass"]').should('have.focus');
      cy.get('[data-name="reset-pass"]').type('new' + NL_EMAIL_PASS);
      cy.get('[data-name="reset-password-submit"]').click();

      cy.get('[data-name=modal-dialog] .alert').contains(
        'Your password has been reset'
      );
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');

      cy.validUserPassword({
        user: 'bretto',
        pass: 'new' + NL_EMAIL_PASS
      });
    });
  });

  it('Visit reset password (after login) - lost session', function () {
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- Avoid conflict
    cy.wait(5000);
    return cy.task('generatePasswordKey', {
      email: NL_EMAIL_USER,
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1'
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line max-len
    // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
    }).then((key) => {
      cy.log(key);
      cy.visit('/reset-password?key=' + encodeURIComponent(key));
      cy.get('[data-name="reset-pass"]').type('new' + NL_EMAIL_PASS);

      // Drop session before submitting
      cy.clearCookie(expressSessionID);

      cy.get('[data-name="reset-password-submit"]').click();

      cy.get('[data-name=modal-alert] [data-name=modal-body] p', {
        timeout: 20000
      }).contains(
        'Your session has been lost'
      );
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    });
  });

  it('Provides an error if unable to update password', function () {
    return cy.task('generatePasswordKey', {
      email: NL_EMAIL_USER,
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1'
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((key) => {
      cy.log(key);

      return cy.simulateServerError({
        tokenURL: '/reset-password?key=' + encodeURIComponent(key),
        url: '/reset-password',
        routeURL: '/reset-password**',
        body: {
          pass: null
        },
        error: 'Unable to update password'
      });
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      cy.get('[data-name="reset-pass"]').type('new' + NL_EMAIL_PASS);
      cy.get('[data-name="reset-password-submit"]').click();

      cy.get('[data-name=modal-dialog] .alert').contains(
        'I\'m sorry something went wrong, please try again'
      );

      // Still the same old pass
      return cy.validUserPassword({
        user: 'bretto',
        pass: NL_EMAIL_PASS
      });
    });
  });
});
