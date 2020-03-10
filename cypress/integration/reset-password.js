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
      cy.get('[data-name="name"]:invalid').should('have.length', 0);

      const tooShortPassword = 'a';
      cy.get('[data-name="reset-pass"]').type(tooShortPassword);
      // cy.get('[data-name="reset-password-submit"]').click();

      // Todo[>=1.7.0]: https://github.com/cypress-io/cypress/issues/6678
      cy.get('[data-name="reset-pass"]:invalid').should('have.length', 1);
      return cy.get('[data-name="reset-pass"]');
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then(($input) => {
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
  it('Provides an error if unable to update password', function () {
    return cy.task('generatePasswordKey', {
      email: NL_EMAIL_USER,
      // ipv6 read by Express
      ip: '::ffff:127.0.0.1'
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((key) => {
      cy.log(key);
      cy.visit('/reset-password?key=' + encodeURIComponent(key));

      // We first trigger coverage on the server, checking that it
      //  indeed would give the response expected (as HTML doesn't
      //  seem to support a JSON enctype per https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-enctype
      //  then we simulate it here).
      return cy.request({
        method: 'POST',
        url: '/reset-password',
        // Don't URL-encode; we want JSON to trigger the error
        // with a `null` value and get an error
        form: false,
        failOnStatusCode: false,
        body: {
          pass: null
        }
      });
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.contain(
        'Unable to update password'
      );

      // But since the above was not triggered through our HTML form,
      //  we have to stub the server response and retry against it,
      //  in order to see the effect on our client app.
      cy.server();
      cy.route({
        method: 'POST',
        url: '/reset-password**',
        status: 400,
        response: 'Unable to update password'
      });

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
