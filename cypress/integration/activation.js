describe('Activation', function () {
  it('Visit Activation (Missing code)', function () {
    cy.visit('/activation', {
      failOnStatusCode: false
    });
    cy.get('[data-name=modal-alert] [data-name=modal-body] p', {
      timeout: 10000
    }).contains(
      'Activation code required'
    );
    cy.get('[data-name=ok]').click();
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/');
  });
  it(
    'Visit Activation (Missing code) has no detectable a11y violations on load',
    () => {
      cy.visitURLAndCheckAccessibility('/activation', {
        failOnStatusCode: false
      });
    }
  );

  it('Visit Activation (Bad code)', function () {
    cy.visit('/activation?c=00001');
    cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
      'The activation code provided was invalid.'
    );
    cy.get('[data-name=ok]').click();
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/');
  });

  it(
    'Visit Activation (Bad code) has no detectable a11y violations on load',
    () => {
      cy.visitURLAndCheckAccessibility('/activation?c=00001');
    }
  );

  it('Visit Activation (Success)', function () {
    cy.task('deleteAllAccounts');

    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line max-len
    // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
    return cy.task('addNonActivatedAccount').then(({activationCode}) => {
      cy.visit('/activation?c=' + activationCode);

      cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
        'Your account has been activated.'
      );
      cy.get('[data-name=ok]').click();
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      return cy.task('getRecords', {user: ['nicky']});
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((accts) => {
      const {user, activated} = accts[0];
      expect(user).to.equal('nicky');
      expect(activated).to.be.true;
      return cy.log(accts);
    });
  });
  it(
    'Visit Activation (Success) has no detectable a11y violations on load',
    () => {
      cy.task('deleteAllAccounts');

      // Cypress won't run the tests with an `await` here
      // eslint-disable-next-line max-len
      // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
      return cy.task('addNonActivatedAccount').then(({activationCode}) => {
        cy.visitURLAndCheckAccessibility('/activation?c=' + activationCode, {
          failOnStatusCode: false
        });
      });
    }
  );
});
