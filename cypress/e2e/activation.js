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
    cy.visit('/activation?c=00001', {
      failOnStatusCode: false
    });
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
      cy.visitURLAndCheckAccessibility('/activation?c=00001', {
        failOnStatusCode: false
      });
    }
  );

  it('Visit Activation (Success)', function () {
    cy.task('deleteAllAccounts');
    cy.task('addExtraNonActivatedAccount');

    let activCode;
    return cy.task('addNonActivatedAccount').then(({activationCode}) => {
      activCode = activationCode;
      return cy.task('getRecords');
    }).then((accts) => {
      expect(accts).to.have.lengthOf(2);

      cy.visit('/activation?c=' + activCode);

      cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
        'Your account has been activated.'
      );
      cy.get('[data-name=ok]').click();
      return cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    }).then(() => {
      return cy.task('getRecords');
    }).then((accts) => {
      // Should have now cleaned up the unactivated copies.
      expect(accts).to.have.lengthOf(1);
      const {user, activated, activationCode} = accts[0];
      expect(user).to.equal('nicky');
      expect(activated).to.be.true;
      expect(activationCode).to.equal(activCode);
      // return cy.log(accts);
      return undefined;
    });
  });

  it(
    'Visit Activation (Success) has no detectable a11y violations on load',
    () => {
      cy.task('deleteAllAccounts');

      return cy.task('addNonActivatedAccount').then(({activationCode}) => {
        cy.visitURLAndCheckAccessibility('/activation?c=' + activationCode);
      });
    }
  );
});
