describe('Coverage', function () {
  it('Gets static coverage files', function () {
    // The lcov HTML report is always produced by the base `nyc`/`c8`
    //   config (`reporter: [..., 'lcov']`); a top-level `coverage/index.html`
    //   only exists after `npm run report-lcov` (which adds `--reporter=html`).
    cy.visit('/coverage/lcov-report/');
    // eslint-disable-next-line cypress/require-data-selectors -- Not our file
    cy.get('body').should(($body) => {
      expect($body[0].textContent).to.contain('Statements');
    });
  });
});
