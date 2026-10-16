/* eslint-disable cypress/require-data-selectors -- The offers view
  identifies its controls by id and semantic class, not `data-*` */

describe('Offers', function () {
  beforeEach(function () {
    cy.task('deleteAllOffers');
    cy.task('deleteCustomGroupsAndPrivileges');
  });

  after(function () {
    cy.task('deleteAllOffers');
    cy.task('deleteCustomGroupsAndPrivileges');
  });

  it('Is not found for a logged-out visitor', function () {
    cy.task('deleteAllAccounts');
    cy.visit('/offers', {failOnStatusCode: false});
    cy.get('[data-name=four04]').should('exist');
  });

  it('Defaults to yearly and creates, edits, and archives', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.task('addGroup', {groupName: 'members'});
    cy.task('addPrivilege', {
      privilegeName: 'betaFlag', description: 'Beta tester', userVarying: true
    });
    cy.visit('/offers');

    cy.get('h1').should('contain', 'Offers');
    cy.get('#offerInterval').should('have.value', 'year');

    cy.get('#offerSlug').type('pro');
    cy.get('#offerName').type('Pro plan');
    cy.get('#offerDescription').type('Everything');
    cy.get('#offerAmount').type('20');
    cy.get('[id="offerPrivilege-betaFlag"]').check();
    cy.get('[id="offerGroup-members"]').check();
    cy.get('#saveOffer').click();

    cy.get('tr.offer[data-slug=pro]').should('contain', 'Pro plan').
      and('contain', '$20.00').and('contain', 'Every year').
      and('contain', 'betaFlag, members');

    cy.get('tr.offer[data-slug=pro] .editOffer').click();
    cy.get('#offerSlug').should('be.disabled');
    cy.get('#offerName').clear();
    cy.get('#offerName').type('Pro plan 2');
    cy.get('#saveOffer').click();
    cy.get('tr.offer[data-slug=pro]').should('contain', 'Pro plan 2');

    cy.get('tr.offer[data-slug=pro] .archiveOffer').click();
    cy.get('tr.offer[data-slug=pro]').should('contain', 'Archived');
    cy.get('tr.offer[data-slug=pro] .archiveOffer').click();
    cy.get('tr.offer[data-slug=pro]').should('contain', 'On sale');
  });

  it('Requires confirmation for lifetime offers', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.task('addPrivilege', {
      privilegeName: 'betaFlag', description: 'Beta tester', userVarying: true
    });
    cy.visit('/offers');
    cy.get('#offerSlug').type('life');
    cy.get('#offerName').type('Lifetime');
    cy.get('#offerDescription').type('Forever');
    cy.get('#offerAmount').type('99');
    cy.get('[id="offerPrivilege-betaFlag"]').check();
    cy.get('#offerInterval').select('');

    let answer = false;
    cy.on('window:confirm', () => {
      return answer;
    });
    cy.get('#saveOffer').click();
    cy.get('tr.offer').should('not.exist');

    cy.then(() => {
      answer = true;
    });
    cy.get('#saveOffer').click();
    cy.get('tr.offer[data-slug=life]').should('contain', 'One time');
  });

  it('Reports server validation errors', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.visit('/offers');
    cy.get('#offerSlug').type('nothing');
    cy.get('#offerName').type('Nothing');
    cy.get('#offerDescription').type('Grants nothing');
    cy.get('#offerAmount').type('5');
    cy.get('#saveOffer').click();
    cy.get('#offerError').should('contain', 'at least one');
  });
});
