describe('Coverage', function () {
  it('Gets static coverage files', function () {
    cy.visit('/coverage');
    cy.visit('/coverage/');
    cy.visit('/coverage/index.html');
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get('body').should(($body) => {
      expect($body[0].textContent).to.contain('Statements');
    });
  });
});
