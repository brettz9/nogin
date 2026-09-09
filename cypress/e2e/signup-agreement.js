/** @typedef {Window & {Nogin: {signupAgreement?: string}}} NoginWindow */

describe('Signup agreement', function () {
  beforeEach(function () {
    cy.task('deleteAllAccounts');
    cy.visit('/signup');
    cy.window().then((win) => {
      const pageWindow = /** @type {NoginWindow} */ (
        /** @type {unknown} */ (win)
      );
      const {signupAgreement} = pageWindow.Nogin;
      if (!signupAgreement) {
        // eslint-disable-next-line mocha/no-pending-tests -- Special config
        this.skip();
      }
    });
  });

  it('requires agreement before validating signup', function () {
    cy.intercept('POST', '/signup', {
      statusCode: 400,
      body: 'username-taken'
    }).as('signup');

    cy.get('[data-name=name]').type('Agreement User');
    cy.get('[data-name=email]').type('agreement@example.name');
    cy.get('[data-name=country]').select('US');
    cy.get('[data-name=user]').type('agreement-user');
    cy.get('[data-name=pass]').type('agreement-password');
    cy.get('[data-name=pass-confirm]').type('agreement-password');
    cy.get('[data-confirm-type=signupAgreement]').should('not.be.visible');

    cy.get('[data-confirm-type=signupAgreement]').then(($modal) => {
      const shown = new Cypress.Promise((resolve) => {
        $modal.one('shown.bs.modal', resolve);
      });
      cy.get('[data-name=account-form] [data-name=action2]').click();
      return cy.wrap(shown, {
        timeout: 10000
      });
    });
    cy.get(
      '[data-confirm-type=signupAgreement] [data-name=modal-body]'
    ).should('contain', 'Review the terms before signing up.');

    cy.get(
      '[data-confirm-type=signupAgreement] [data-name=submit-confirm]'
    ).then(($submit) => {
      $submit[0].click();
      $submit[0].click();
    });
    cy.wait('@signup');
    cy.get('@signup.all').should('have.length', 1);
    cy.get('[data-confirm-type=signupAgreement]').should('not.be.visible');
    cy.get('[data-name=user]').should(($user) => {
      const user = /** @type {HTMLInputElement} */ ($user[0]);
      expect(user.validationMessage).to.contain(
        'That username is already in use'
      );
    });
  });
});
