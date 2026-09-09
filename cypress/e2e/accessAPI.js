/* eslint-disable cypress/require-data-selectors -- Minimal placeholder
  view; asserting on its heading text is sufficient */

describe('accessAPI', function () {
  /**
   * @param {string} token
   * @param {object} body
   * @returns {Cypress.Chainable}
   */
  const api = (token, body) => {
    return cy.request({
      url: '/accessAPI',
      method: 'POST',
      failOnStatusCode: false,
      headers: {'X-XSRF-Token': token},
      body
    });
  };

  /**
   * @param {string} token
   * @param {object} body
   * @param {number} [status]
   * @returns {Cypress.Chainable}
   */
  const post = (token, body, status = 200) => {
    return api(token, body).its('status').should('eq', status);
  };

  beforeEach(function () {
    cy.task('deleteCustomGroupsAndPrivileges');
  });

  it('GET renders the placeholder page', function () {
    cy.visit('/accessAPI');
    cy.get('h1').should('contain', '/accessAPI');
    cy.contains('To be added');
  });

  it('root: full group and privilege lifecycle', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.getToken().then((token) => {
      post(token, {verb: 'createGroup', groupName: 'team'});
      post(token, {
        verb: 'addUserToGroup', groupName: 'team', userID: 'bretto'
      });
      post(token, {
        verb: 'createPrivilege', privilegeName: 'canX', description: 'd'
      });
      post(token, {
        verb: 'editPrivilege', privilegeName: 'canX',
        newPrivilegeName: 'canY', description: 'd2'
      });
      post(token, {
        verb: 'addPrivilegeToGroup', groupName: 'team', privilegeName: 'canY'
      });
      post(token, {
        verb: 'removePrivilegeFromGroup', groupName: 'team',
        privilegeName: 'canY'
      });
      post(token, {
        verb: 'renameGroup', groupName: 'team', newGroupName: 'squad'
      });
      post(token, {
        verb: 'removeUserFromGroup', groupName: 'squad', userID: 'bretto'
      });
      post(token, {verb: 'deleteGroup', groupName: 'squad'});
      post(token, {verb: 'deletePrivilege', privilegeName: 'canY'});
    });
  });

  it('root: user-varying privilege assignment', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.task('addPrivilege', {
      privilegeName: 'beta', description: 'd', userVarying: true
    });
    cy.getToken().then((token) => {
      post(token, {
        verb: 'addPrivilegeToUser', userID: 'bretto', privilegeName: 'beta'
      });
      post(token, {
        verb: 'removePrivilegeFromUser', userID: 'bretto',
        privilegeName: 'beta'
      });
    });
  });

  it('root: read verbs return arrays', function () {
    cy.loginWithSession({rootUser: true});
    cy.getToken().then((token) => {
      api(token, {verb: 'readUsers'}).its('body.value').should(
        'be.an', 'array'
      );
      api(token, {verb: 'readGroups'}).its('body.value').should(
        'be.an', 'array'
      );
      api(token, {verb: 'readPrivileges'}).its('body.value').should(
        'be.an', 'array'
      );
    });
  });

  it('root: invalid input yields a 400 with a message', function () {
    cy.loginWithSession({rootUser: true});
    cy.getToken().then((token) => {
      api(token, {verb: 'createGroup', groupName: ''}).its('body').should(
        'contain', 'Bad group name'
      );
      post(token, {verb: 'createGroup', groupName: 'dup'});
      api(token, {verb: 'createGroup', groupName: 'dup'}).its('body').should(
        'contain', 'already in use'
      );
      post(token, {
        verb: 'createPrivilege', privilegeName: 'nogin.readUsers',
        description: 'd'
      }, 400);
      post(token, {
        verb: 'editPrivilege', privilegeName: 'nope',
        newPrivilegeName: 'z', description: 'd'
      }, 400);
      post(token, {
        verb: 'addPrivilegeToGroup', groupName: 'dup', privilegeName: 'missing'
      }, 400);
      post(token, {
        verb: 'addUserToGroup', groupName: 'dup', userID: 'ghost'
      }, 400);
    });
  });

  it('root: coerces typed privilege values', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.task('addGroup', {groupName: 'team'});
    cy.task('addPrivilege', {
      privilegeName: 'quota', description: 'd', type: 'number'
    });
    cy.task('addPrivilege', {
      privilegeName: 'tags', description: 'd', type: 'array'
    });
    cy.task('addPrivilege', {
      privilegeName: 'label', description: 'd', type: 'string'
    });
    cy.task('addPrivilege', {
      privilegeName: 'cfg', description: 'd', type: 'object', userVarying: true
    });
    cy.getToken().then((token) => {
      post(token, {
        verb: 'addPrivilegeToGroup', groupName: 'team',
        privilegeName: 'quota', value: '25'
      });
      post(token, {
        verb: 'addPrivilegeToGroup', groupName: 'team',
        privilegeName: 'tags', value: '["a","b"]'
      });
      post(token, {
        verb: 'addPrivilegeToGroup', groupName: 'team',
        privilegeName: 'label', value: 'hi'
      });
      // Unparseable JSON for an array/object privilege -> bad-privilege-value
      post(token, {
        verb: 'addPrivilegeToGroup', groupName: 'team',
        privilegeName: 'tags', value: '{not json'
      }, 400);
      post(token, {
        verb: 'addPrivilegeToUser', userID: 'bretto',
        privilegeName: 'cfg', value: '{"a":1}'
      });
      post(token, {
        verb: 'addPrivilegeToUser', userID: 'bretto',
        privilegeName: 'cfg', value: 'nope'
      }, 400);
    });
  });

  it('root: rejects assignments at the wrong scope', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.task('addGroup', {groupName: 'team'});
    cy.task('addPrivilege', {
      privilegeName: 'groupOnly', description: 'd'
    });
    cy.task('addPrivilege', {
      privilegeName: 'userOnly', description: 'd', userVarying: true
    });
    cy.getToken().then((token) => {
      // user-varying privilege cannot be added to a group
      post(token, {
        verb: 'addPrivilegeToGroup', groupName: 'team',
        privilegeName: 'userOnly'
      }, 400);
      // non-user-varying privilege cannot be added to a user
      post(token, {
        verb: 'addPrivilegeToUser', userID: 'bretto',
        privilegeName: 'groupOnly'
      }, 400);
    });
  });

  it('root: rejects built-in and malformed names', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addPrivilege', {privilegeName: 'label', description: 'd'});
    cy.getToken().then((token) => {
      post(token, {
        verb: 'renameGroup', groupName: '', newGroupName: 'x'
      }, 400);
      post(token, {verb: 'deleteGroup', groupName: 'nogin.guests'}, 400);
      post(token, {
        verb: 'editPrivilege', privilegeName: 'label',
        newPrivilegeName: 'nogin.readUsers', description: 'd'
      }, 400);
    });
  });

  it('rejects an unrecognized verb with 404', function () {
    cy.loginWithSession({rootUser: true});
    cy.getToken().then((token) => {
      post(token, {verb: 'nope'}, 404);
    });
  });

  it('denies a non-privileged user with 404', function () {
    cy.loginWithSession();
    cy.getToken().then((token) => {
      post(token, {verb: 'createGroup', groupName: 'x'}, 404);
      post(token, {verb: 'readGroups'}, 404);
      post(token, {verb: 'readPrivileges'}, 404);
    });
  });
});
