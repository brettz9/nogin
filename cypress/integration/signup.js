describe('Signup', function () {
  let NL_EMAIL_USER, NL_EMAIL_PASS;
  before(() => {
    ({
      NL_EMAIL_USER,
      NL_EMAIL_PASS
    } = Cypress.env());
  });
  beforeEach(() => {
    cy.task('deleteAllAccounts');
  });
  // https://www.npmjs.com/package/cypress-axe
  it('Signup has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/signup');
  });

  it('Visit Signup and try entering bad data client-side', function () {
    cy.visit('/signup');
    const tooShortUser = 'a';
    cy.get('[data-name="user"]').type(tooShortUser);
    cy.get('[data-name="action2"]').click();
    // todo[cypress@>9.0.0]: `:invalid`: see if fixed:
    //   https://github.com/cypress-io/cypress/issues/6678
    cy.get('[data-name="user"]:invalid').should('have.length', 1);
    const tooShortName = 'b';
    cy.get('[data-name="name"]').type(tooShortName);
    cy.get('[data-name="name"]:invalid').should('have.length', 1);

    const tooShortPass = 'c';
    cy.get('[data-name="pass"]').type(tooShortPass);
    cy.get('[data-name="pass"]:invalid').should('have.length', 1);
  });

  it('Visit Signup and submit with bad data (email in use)', function () {
    this.timeout(100000);
    cy.task('deleteEmails', null, {timeout: 100000});
    cy.task('addExtraActivatedAccount');
    cy.visit('/signup');

    cy.get('[data-name="name"]:invalid').should('have.length', 0);

    const nonEmail = 'nonEmail';
    cy.get('[data-name="email"]').type(nonEmail);
    cy.get('[data-name="email"]:invalid').should('have.length', 1);

    cy.get('[data-name="email"]').clear().type('me@example.name');
    cy.get('[data-name="pass"]').type('boo123456');
    cy.get('[data-name="pass-confirm"]').type('boo123456');
    cy.get('[data-name="name"]').type('MyName');
    cy.get('[data-name="name"]:invalid').should('have.length', 0);
    cy.get('[data-name="user"]').type('AUser');
    cy.get('[data-name="action2"]').click();

    cy.get(
      '[data-name=modal-alert] [data-name=modal-body] p'
    ).should('be.hidden');

    cy.get('[data-name="email"]', {
      timeout: 50000
    }).should(($email) => {
      return expect(
        $email[0].validationMessage
      ).to.contain(
        'That email address is already in use'
      );
    });

    // eslint-disable-next-line promise/prefer-await-to-then
    return cy.task('getRecords').then((accts) => {
      expect(accts).to.have.lengthOf(1);
      return expect(accts[0].name).to.equal('Nicole');
    });
  });

  it('Visit Signup and submit with bad data (user in use)', function () {
    cy.task('addExtraActivatedAccount');
    cy.visit('/signup');

    cy.get('[data-name="name"]:invalid').should('have.length', 0);

    const nonEmail = 'nonEmail';
    cy.get('[data-name="email"]').type(nonEmail);
    cy.get('[data-name="email"]:invalid').should('have.length', 1);

    cy.get('[data-name="email"]').clear().type('me@example.name');
    cy.get('[data-name="pass"]').type('boo123456');
    cy.get('[data-name="pass-confirm"]').type('boo123456');
    cy.get('[data-name="name"]').type('MyName');
    cy.get('[data-name="name"]:invalid').should('have.length', 0);
    const alreadyExistingUser = 'nicky';
    cy.get('[data-name="user"]').type(alreadyExistingUser);
    cy.get('[data-name="action2"]').click();

    cy.get(
      '[data-name=modal-alert] [data-name=modal-body] p'
    ).should('be.hidden');

    cy.get('[data-name="user"]', {
      timeout: 50000
    }).should(($user) => {
      return expect(
        $user[0].validationMessage
      ).to.contain(
        'That username is already in use'
      );
    });

    // eslint-disable-next-line promise/prefer-await-to-then
    return cy.task('getRecords').then((accts) => {
      expect(accts).to.have.lengthOf(1);
      return expect(accts[0].name).to.equal('Nicole');
    });
  });

  it('Bad email to server', function () {
    // The client won't allow bad values, so we pass without
    //   client-side validation
    const badEmail = null;
    cy.visit('/signup');
    return cy.simulateServerError({
      noToken: true,
      url: '/signup',
      body: {
        name: 'MyName',
        email: badEmail,
        user: 'OkUserName',
        pass: 'okPassword1234',
        country: 'GB'
      },
      error: 'DispatchActivationLinkError'
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      const goodEmailButStubbingToGetAsThoughBad = 'bad@example.name';
      cy.get('[data-name="name"]').type('MyName');
      cy.get('[data-name="email"]').type(goodEmailButStubbingToGetAsThoughBad);
      cy.get('[data-name="country"]').select('GB');
      cy.get('[data-name="user"]').type('OkUserName');
      cy.get('[data-name="pass"]').type('okPassword1234');
      cy.get('[data-name="pass-confirm"]').type('okPassword1234');
      cy.get('[data-name=account-form] [data-name=action2]').click();
      cy.get('[data-name=modal-alert] [data-name=ok]').click({
        timeout: 50000
      });
      cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
        'There was an error sending out your activation link.'
      );
      cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
        'If you did enter a valid email'
      );
      // Still gets added as just had trouble sending email out
      return cy.task('getRecords');
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then((accts) => {
      expect(accts).to.have.lengthOf(1);
      return expect(accts[0].user).to.equal('OkUserName');
    });
  });

  it('Visit Signup and submit', function () {
    this.timeout(100000);
    cy.task('deleteEmails', null, {timeout: 100000});
    cy.visit('/signup');
    cy.get('[data-name="name"]').type('Brett');
    cy.get('[data-name="email"]').type(NL_EMAIL_USER);
    cy.get('[data-name="country"]').select('US');
    cy.get('[data-name="user"]').type('bretto');
    cy.get('[data-name="pass"]').type(NL_EMAIL_PASS);
    cy.get('[data-name="pass-confirm"]').type(NL_EMAIL_PASS);
    cy.get('[data-name=account-form] [data-name=action2]').click();
    cy.get('[data-name=modal-alert] [data-name=modal-body] p').contains(
      'Please check your email for a verification link',
      {
        timeout: 50000
      }
    );
    cy.get('[data-name=modal-alert] [data-name=ok]').click();
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/');

    // We don't know exactly how long until the email will be delivered
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(15000);

    // Check that received activation email
    return cy.task('hasEmail', {
      subject: 'Account Activation',
      html: [
        'Please click here to activate your account',
        '<a href=',
        'activation?c='
      ]
      // eslint-disable-next-line promise/prefer-await-to-then
    }, {timeout: 70000}).then((hasEmail) => {
      // Todo: In full UI testing mode, we could look for the link and
      //   visit it.
      return expect(hasEmail).to.be.true;
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      return cy.task('getRecords', {user: ['bretto']});
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((accts) => {
      const {user, activated} = accts[0];
      expect(user).to.equal('bretto');
      expect(activated).to.be.false;
      return cy.log(accts);
    });
  });

  it(
    'Visit Signup and submit successfully despite having a previous ' +
      'non-activated account',
    function () {
      // cy.task('deleteEmails');
      cy.task('addNonActivatedAccount');
      cy.visit('/signup');

      cy.get('[data-name="name"]:invalid').should('have.length', 0);

      cy.get('[data-name="email"]').clear().type('me@example.name');
      cy.get('[data-name="pass"]').type('boo123456');
      cy.get('[data-name="pass-confirm"]').type('boo123456');
      cy.get('[data-name="name"]').type('MyName');
      cy.get('[data-name="name"]:invalid').should('have.length', 0);
      const nonactivatedExistingUser = 'nicky';
      cy.get('[data-name="user"]').type(nonactivatedExistingUser);
      cy.get('[data-name="action2"]').click();

      cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p'
      ).should('be.hidden');

      // eslint-disable-next-line promise/prefer-await-to-then
      return cy.task('getRecords').then((accts) => {
        // Will only delete old account once activated
        expect(accts).to.have.lengthOf(2);
        const bothInactive = accts.every((acct) => {
          return acct.activated === false;
        });
        expect(bothInactive).to.be.true;
        return expect([accts[0].name, accts[1].name]).to.have.members(
          ['MyName', 'Nicole']
        );
      });
    }
  );

  it('Visit Signup but cancel to be redirected', function () {
    cy.visit('/signup');
    cy.get('[data-name=action1]').click();
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/');
  });
});
