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

  it('cancels privilege forms and keeps invalid creation input open',
    function () {
      cy.task('addGroup', {groupName: 'team'});
      cy.task('addPrivilege', {privilegeName: 'canX', description: 'd'});
      cy.task('addPrivilege', {
        privilegeName: 'betaFlag', description: 'd', userVarying: true
      });
      cy.task('addPrivilege', {
        privilegeName: 'quota', description: 'd', type: 'number'
      });
      cy.visit('/privileges');

      openModal(
        '#createPrivilege',
        () => cy.get('button.createPrivilege').click()
      );
      cancelModal(
        '#createPrivilege', '[data-name=createPrivilege-cancel]'
      );

      openModal('#editPrivilege', () => {
        return cy.contains('.table-bordered tr', 'canX').find(
          'button.editPrivilege'
        ).click();
      });
      cancelModal('#editPrivilege', '[data-name=editPrivilege-cancel]');

      openModal('#editPrivilege', () => {
        return cy.contains('.table-bordered tr', 'canX').find(
          'button.editPrivilege'
        ).click();
      });
      cy.get('#editPrivilege-input').clear();
      cy.get('#editPrivilege-input').type('ab');
      cy.get('[data-name=editPrivilege-submit]').click();
      cy.get('#editPrivilege-input').should(($input) => {
        const input = /** @type {HTMLInputElement} */ ($input[0]);
        expect(input.validationMessage).not.to.be.empty;
      });
      cancelModal('#editPrivilege', '[data-name=editPrivilege-cancel]');

      openModal('#addPrivilegeToGroup', () => {
        return cy.contains('.table-bordered tr', 'canX').find(
          'button.addPrivilegeToGroup'
        ).click();
      });
      cancelModal(
        '#addPrivilegeToGroup', '[data-name=addPrivilegeToGroup-cancel]'
      );

      openModal('#addPrivilegeToGroup', () => {
        return cy.contains('.table-bordered tr', 'canX').find(
          'button.addPrivilegeToGroup'
        ).click();
      });
      cy.get('#addPrivilegeToGroup-input').type('ab');
      cy.get('[data-name=addPrivilegeToGroup-submit]').click();
      cy.get('#addPrivilegeToGroup-input').should(($input) => {
        const input = /** @type {HTMLInputElement} */ ($input[0]);
        expect(input.validationMessage).not.to.be.empty;
      });
      cancelModal(
        '#addPrivilegeToGroup', '[data-name=addPrivilegeToGroup-cancel]'
      );

      openModal('#addPrivilegeToGroup', () => {
        return cy.contains('.table-bordered tr', 'quota').find(
          'button.addPrivilegeToGroup'
        ).click();
      });
      cy.get('#addPrivilegeToGroup-value-input').should(
        'have.attr', 'type', 'number'
      );
      cancelModal(
        '#addPrivilegeToGroup', '[data-name=addPrivilegeToGroup-cancel]'
      );

      openModal('#addPrivilegeToUser', () => {
        return cy.contains('.table-bordered tr', 'betaFlag').find(
          'button.addPrivilegeToUser'
        ).click();
      });
      cancelModal(
        '#addPrivilegeToUser', '[data-name=addPrivilegeToUser-cancel]'
      );

      openModal('#addPrivilegeToUser', () => {
        return cy.contains('.table-bordered tr', 'betaFlag').find(
          'button.addPrivilegeToUser'
        ).click();
      });
      cy.get('#addPrivilegeToUser-input').type('ab');
      cy.get('[data-name=addPrivilegeToUser-submit]').click();
      cy.get('#addPrivilegeToUser-input').should(($input) => {
        const input = /** @type {HTMLInputElement} */ ($input[0]);
        expect(input.validationMessage).not.to.be.empty;
      });
      cancelModal(
        '#addPrivilegeToUser', '[data-name=addPrivilegeToUser-cancel]'
      );

      openModal(
        '#createPrivilege',
        () => cy.get('button.createPrivilege').click()
      );
      cy.get('#createPrivilege-input').type('ab');
      cy.get('#createPrivilege-description-input').type('Too short');
      cy.get('[data-name=createPrivilege-submit]').click();
      cy.get('#createPrivilege-input').should(($input) => {
        const input = /** @type {HTMLInputElement} */ ($input[0]);
        expect(input.validationMessage).not.to.be.empty;
      });
      cy.get('#createPrivilege').should('be.visible');
    });

  it('shows a server error when creating a duplicate privilege', function () {
    cy.task('addPrivilege', {
      privilegeName: 'canPublish', description: 'Existing privilege'
    });
    cy.visit('/privileges');
    cy.get('button.createPrivilege').click();
    cy.get('#createPrivilege-input').type('canPublish');
    cy.get('#createPrivilege-description-input').type('Duplicate privilege');
    cy.get('[data-name=createPrivilege-submit]').click();

    expectAlert('already taken');
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

    cy.contains('.table-bordered tr', 'canX').find(
      'button.addPrivilegeToGroup'
    ).click();
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

  it('assigns typed JSON values through the privilege forms', function () {
    cy.task('addGroup', {groupName: 'team'});
    cy.task('addPrivilege', {
      privilegeName: 'allowedTags', description: 'd', type: 'array'
    });
    cy.visit('/privileges');

    cy.get('button.createPrivilege').click();
    cy.get('#createPrivilege-input').type('preferences');
    cy.get('#createPrivilege-description-input').type('User preferences');
    cy.get('#createPrivilege-type-input').select('object');
    cy.get('#createPrivilege-user-varying-input').check();
    cy.get('[data-name=createPrivilege-submit]').click();
    expectAlert('Privilege created');
    cy.contains('.table-bordered tr', 'preferences', RELOADED).should(
      'contain', 'Object'
    );

    cy.contains('.table-bordered tr', 'allowedTags').find(
      'button.addPrivilegeToGroup'
    ).click();
    cy.get('#addPrivilegeToGroup-input').type('team');
    cy.get('#addPrivilegeToGroup-value-textarea').should('be.visible').type(
      '{not json', {parseSpecialCharSequences: false}
    );
    cy.get('[data-name=addPrivilegeToGroup-submit]').click();
    cy.get('#addPrivilegeToGroup-value-textarea').should(($textarea) => {
      const textarea = /** @type {HTMLTextAreaElement} */ ($textarea[0]);
      expect(textarea.validationMessage).not.to.be.empty;
    });
    cy.get('#addPrivilegeToGroup-value-textarea').clear();
    cy.get('#addPrivilegeToGroup-value-textarea').type(
      '["news","sports"]', {
        parseSpecialCharSequences: false
      }
    );
    cy.get('[data-name=addPrivilegeToGroup-submit]').click();
    expectAlert('Privilege added to group');
    cy.contains('.table-bordered tr', 'allowedTags', RELOADED).find(
      '.removePrivilegeFromGroup[data-group=team]'
    ).should('exist');

    cy.contains('.table-bordered tr', 'preferences').find(
      'button.addPrivilegeToUser'
    ).click();
    cy.get('#addPrivilegeToUser-input').type('bretto');
    cy.get('#addPrivilegeToUser-value-textarea').should('be.visible').type(
      '{"theme":"dark"}', {parseSpecialCharSequences: false}
    );
    cy.get('[data-name=addPrivilegeToUser-submit]').click();
    expectAlert('Privilege added to user');
    cy.contains('.table-bordered tr', 'preferences', RELOADED).find(
      '.removePrivilegeFromUser[data-user=bretto]'
    ).should('exist');
  });
});
