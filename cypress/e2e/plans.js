/* eslint-disable cypress/require-data-selectors -- The plans view
  identifies its controls by semantic class, not `data-*` */

describe('Plans', function () {
  beforeEach(function () {
    cy.task('deleteAllOffers');
    cy.task('deleteCustomGroupsAndPrivileges');
    cy.task('addPrivilege', {
      privilegeName: 'betaFlag', description: 'Beta tester', userVarying: true
    });
    cy.task('addOffer', {
      slug: 'pro', name: 'Pro plan', description: 'Everything included',
      amount: 2000, currency: 'usd', interval: 'year',
      privilegeIDs: ['betaFlag'], groupNames: [],
      receiptText: 'Welcome aboard!'
    });
    cy.task('addOffer', {
      slug: 'old', name: 'Old plan', description: 'Retired',
      amount: 100, currency: 'usd', interval: 'month',
      privilegeIDs: ['betaFlag'], groupNames: [], active: false
    });
  });

  after(function () {
    cy.task('deleteAllOffers');
    cy.task('deleteCustomGroupsAndPrivileges');
  });

  it('Lists only active offers for a logged-out visitor', function () {
    cy.task('deleteAllAccounts');
    cy.visit('/plans');
    cy.get('h1').should('contain', 'Plans');
    cy.get('section.plan[data-slug=pro]').should('contain', 'Pro plan').
      and('contain', '$20.00').and('contain', 'Every year').
      and('contain', 'Everything included');
    cy.get('section.plan[data-slug=old]').should('not.exist');
    cy.get('.buyOffer').should('not.exist');
  });

  it('Explains that buying is unavailable without Stripe set up', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.visit('/plans');
    cy.get('section.plan[data-slug=pro]').should(
      'contain', 'Buying is not available right now.'
    );
    cy.get('.manageSubscription').should('not.exist');
  });

  it('Shows the receipt text after purchase', function () {
    cy.task('deleteAllAccounts');
    cy.visit('/purchased?offer=pro');
    cy.get('h1').should('contain', 'Thank you');
    cy.get('.receipt').should('contain', 'Welcome aboard!');
    cy.visit('/purchased?offer=missing');
    cy.get('h1').should('contain', 'Thank you');
    cy.get('.receipt').should('not.exist');
  });
});
