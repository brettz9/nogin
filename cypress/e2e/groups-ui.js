/* eslint-disable cypress/require-data-selectors -- The groups view
  identifies its controls by id / semantic class */

describe('Groups (controller UI)', function () {
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

  const RELOADED = {timeout: 15000};

  /**
   * @param {string} modalSelector
   * @param {() => Cypress.Chainable} open
   * @returns {Cypress.Chainable}
   */
  const openModal = (modalSelector, open) => {
    return cy.get(modalSelector).then(($modal) => {
      const shown = new Cypress.Promise((resolve) => {
        $modal.one('shown.bs.modal', resolve);
      });
      return open().then(() => shown);
    });
  };

  /**
   * @param {string} modalSelector
   * @param {string} cancelSelector
   * @returns {Cypress.Chainable}
   */
  const cancelModal = (modalSelector, cancelSelector) => {
    return cy.get(modalSelector).then(($modal) => {
      const hidden = new Cypress.Promise((resolve) => {
        $modal.one('hidden.bs.modal', resolve);
      });
      cy.get(cancelSelector).click();
      return cy.wrap(hidden);
    });
  };

  it('creates, renames, and deletes a group', function () {
    cy.visit('/groups');
    cy.get('button.createGroup').click();
    cy.get('#createGroup-input').type('writers');
    cy.get('[data-name=createGroup-submit]').click();
    expectAlert('Group created');
    cy.contains('.table-bordered tr', 'writers', RELOADED).find(
      'button.renameGroup'
    ).click();

    cy.get('#renameGroup-input').clear();
    cy.get('#renameGroup-input').type('editors');
    cy.get('[data-name=renameGroup-submit]').click();
    expectAlert('Group renamed');
    cy.contains('.table-bordered tr', 'editors', RELOADED).find(
      'button.deleteGroup'
    ).click();

    cy.get('[data-confirm-type="deleteGroup"] .btn-danger').click();
    expectAlert('Group deleted');
    cy.get('.table-bordered', RELOADED).should('not.contain', 'editors');
  });

  it('shows a server error when creating a duplicate group', function () {
    cy.task('addGroup', {groupName: 'writers'});
    cy.visit('/groups');
    cy.get('button.createGroup').click();
    cy.get('#createGroup-input').type('writers');
    cy.get('[data-name=createGroup-submit]').click();

    expectAlert('already in use');
  });

  it('adds a user to a group and removes the user again', function () {
    cy.task('addGroup', {groupName: 'team'});
    cy.visit('/groups');

    cy.contains('.table-bordered tr', 'team').find(
      'button.addUserToGroup'
    ).click();
    cy.get('#addUserToGroup-input').type('bretto');
    cy.get('[data-name=addUserToGroup-submit]').click();
    expectAlert('User added to group');
    cy.contains('.table-bordered tr', 'team', RELOADED).find(
      '.removeUserFromGroup[data-user=bretto]'
    ).click();

    cy.get(
      '[data-confirm-type="removeUserFromGroup"] .btn-danger'
    ).click();
    expectAlert('User removed from group');
    cy.contains('.table-bordered tr', 'team', RELOADED).find(
      '.removeUserFromGroup[data-user=bretto]'
    ).should('not.exist');
  });

  it('assigns a typed privilege to a group and removes it again', function () {
    cy.task('addGroup', {groupName: 'team'});
    cy.task('addPrivilege', {
      privilegeName: 'allowedTags', description: 'Allowed tags', type: 'array'
    });
    cy.visit('/groups');

    cy.contains('.table-bordered tr', 'team').find(
      'button.addPrivilegeToGroup'
    ).click();
    cy.get('#addPrivilegeToGroup-input').type('allowedTags');
    cy.get('#addPrivilegeToGroup-value-textarea').should('be.visible').type(
      '{not json', {parseSpecialCharSequences: false}
    );
    cy.get('[data-name=addPrivilegeToGroup-submit]').click();
    cy.get('#addPrivilegeToGroup-value-textarea').should(($textarea) => {
      const textarea = /** @type {HTMLTextAreaElement} */ ($textarea[0]);
      expect(textarea.validationMessage).not.to.be.empty;
    });
    cy.get('#addPrivilegeToGroup-value-textarea').clear();
    cy.get('#addPrivilegeToGroup-value-textarea').type('["news"]', {
      parseSpecialCharSequences: false
    });
    cy.get('[data-name=addPrivilegeToGroup-submit]').click();
    expectAlert('Privilege added to group');
    cy.contains('.table-bordered tr', 'team', RELOADED).find(
      '.removePrivilegeFromGroup[data-privilege=allowedTags]'
    ).click();

    cy.get(
      '[data-confirm-type="removePrivilegeFromGroup"] .btn-danger'
    ).click();
    expectAlert('Privilege removed from group');
    cy.contains('.table-bordered tr', 'team', RELOADED).find(
      '.removePrivilegeFromGroup[data-privilege=allowedTags]'
    ).should('not.exist');
  });

  it('cancels group forms and keeps invalid input open', function () {
    cy.task('addGroup', {groupName: 'team'});
    cy.task('addPrivilege', {privilegeName: 'canX', description: 'Can X'});
    cy.visit('/groups');

    openModal('#createGroup', () => cy.get('button.createGroup').click());
    cancelModal('#createGroup', '[data-name=createGroup-cancel]');

    openModal('#renameGroup', () => {
      return cy.contains('.table-bordered tr', 'team').find(
        'button.renameGroup'
      ).click();
    });
    cancelModal('#renameGroup', '[data-name=renameGroup-cancel]');

    openModal('#addUserToGroup', () => {
      return cy.contains('.table-bordered tr', 'team').find(
        'button.addUserToGroup'
      ).click();
    });
    cancelModal('#addUserToGroup', '[data-name=addUserToGroup-cancel]');

    openModal('#addPrivilegeToGroup', () => {
      return cy.contains('.table-bordered tr', 'team').find(
        'button.addPrivilegeToGroup'
      ).click();
    });
    cancelModal(
      '#addPrivilegeToGroup', '[data-name=addPrivilegeToGroup-cancel]'
    );

    openModal('#createGroup', () => cy.get('button.createGroup').click());
    cy.get('#createGroup-input').type('ab');
    cy.get('[data-name=createGroup-submit]').click();
    cy.get('#createGroup-input').should(($input) => {
      const input = /** @type {HTMLInputElement} */ ($input[0]);
      expect(input.validationMessage).not.to.be.empty;
    });
    cy.get('#createGroup').should('be.visible');
  });
});
