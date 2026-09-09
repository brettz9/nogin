/* eslint-disable cypress/require-data-selectors -- The privileges view
  and its controller identify controls by id / semantic class */

describe('Privileges (controller UI)', function () {
  beforeEach(function () {
    cy.task('deleteCustomGroupsAndPrivileges');
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
  });

  /**
   * @param {string} text
   * @returns {Cypress.Chainable}
   */
  const expectAlert = (text) => {
    return cy.get(
      '[data-name=modal-alert] [data-name=modal-body] p',
      {timeout: 20000}
    ).should('contain', text);
  };

  // The controller reloads the page ~3s after a successful action; a
  //   generous retry window rides that reload out.
  const RELOADED = {timeout: 15000};

  it('creates a privilege', function () {
    cy.visit('/privileges');
    cy.get('button.createPrivilege').click();
    cy.get('#createPrivilege').should('be.visible');
    cy.get('#createPrivilege-input').type('canPublish');
    cy.get('#createPrivilege-description-input').type('May publish');
    cy.get('[data-name=createPrivilege-submit]').click();

    expectAlert('Privilege created');
    cy.get('.table-bordered', RELOADED).should('contain', 'canPublish');
  });

  it('edits a privilege', function () {
    cy.task('addPrivilege', {privilegeName: 'canX', description: 'old'});
    cy.visit('/privileges');
    cy.get('button.editPrivilege').click();
    cy.get('#editPrivilege').should('be.visible');
    cy.get('#editPrivilege-input').clear();
    cy.get('#editPrivilege-input').type('canY');
    cy.get('#editPrivilege-description-input').clear();
    cy.get('#editPrivilege-description-input').type('new');
    cy.get('[data-name=editPrivilege-submit]').click();

    expectAlert('Privilege edited');
    cy.get('.table-bordered', RELOADED).should('contain', 'canY');
    cy.get('.table-bordered').should('not.contain', 'canX');
  });

  it('deletes a privilege', function () {
    cy.task('addPrivilege', {privilegeName: 'canX', description: 'd'});
    cy.visit('/privileges');
    cy.get('button.deletePrivilege').click();
    cy.get('[data-confirm-type="deletePrivilege"] .btn-danger').click();

    expectAlert('Privilege deleted');
    cy.get('.table-bordered', RELOADED).should('not.contain', 'canX');
  });

  it('adds a privilege to a group and removes it again', function () {
    cy.task('addGroup', {groupName: 'team'});
    cy.task('addPrivilege', {privilegeName: 'canX', description: 'd'});
    cy.visit('/privileges');

    cy.get('button.addPrivilegeToGroup').click();
    cy.get('#addPrivilegeToGroup').should('be.visible');
    cy.get('#addPrivilegeToGroup-input').type('team');
    cy.get('[data-name=addPrivilegeToGroup-submit]').click();
    expectAlert('Privilege added to group');
    cy.get('.removePrivilegeFromGroup', RELOADED).should('exist');

    cy.get('.removePrivilegeFromGroup[data-group=team]').click();
    cy.get(
      '[data-confirm-type="removePrivilegeFromGroup"] .btn-danger'
    ).click();
    expectAlert('Privilege removed from group');
    cy.get('.removePrivilegeFromGroup', RELOADED).should('not.exist');
  });

  it('adds a privilege to a user and removes it again', function () {
    cy.task('addPrivilege', {
      privilegeName: 'betaFlag', description: 'd', userVarying: true
    });
    cy.visit('/privileges');

    cy.get('button.addPrivilegeToUser').click();
    cy.get('#addPrivilegeToUser').should('be.visible');
    cy.get('#addPrivilegeToUser-input').type('bretto');
    cy.get('[data-name=addPrivilegeToUser-submit]').click();
    expectAlert('Privilege added to user');
    cy.get('.removePrivilegeFromUser', RELOADED).should('exist');

    cy.get('.removePrivilegeFromUser[data-user=bretto]').click();
    cy.get(
      '[data-confirm-type="removePrivilegeFromUser"] .btn-danger'
    ).click();
    expectAlert('Privilege removed from user');
    cy.get('.removePrivilegeFromUser', RELOADED).should('not.exist');
  });
});
