/**
 * @file A CLI reporter for after-the-fact compilation of (merged Mochawesome)
 * Mocha results.
 */

'use strict';

const reporterFile = process.argv[2]
  ? process.argv[2].replace(/^--/u, '')
  : 'spec';

// eslint-disable-next-line import/no-dynamic-require
const MochaReporter = require(`mocha/lib/reporters/${reporterFile}.js`);
const Suite = require('mocha/lib/suite.js');
const Test = require('mocha/lib/test.js');
const Runner = require('mocha/lib/runner.js');

const {constants: {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING
}} = require('mocha/lib/runner.js');

const {results, stats} = require('../mochawesome.json');

const runner = new Runner(
  new Suite('', null, true)
);
runner.stats = stats;

console.log('Mocha results:');

// eslint-disable-next-line no-new
new MochaReporter(runner);

runner.emit(EVENT_RUN_BEGIN);
results.forEach(({suites}) => {
  suites.forEach((st) => {
    const ste = Object.assign(Object.create(Suite.prototype), st);

    /*
    ste.suites.forEach((s, i) => {
      ste.suites[i] = Object.assign(Object.create(Suite.prototype), s);
    });
    */

    runner.emit(EVENT_SUITE_BEGIN, ste);
    ste.tests.forEach((ts) => {
      const tst = Object.assign(Object.create(Test.prototype), ts);
      tst.parent = ste; // Seems to work
      const ev = tst.pass
        ? EVENT_TEST_PASS
        : tst.fail
          ? EVENT_TEST_FAIL
          // No distinct event for pending vs. skipped?
          : tst.pending
            ? EVENT_TEST_PENDING
            : tst.skipped
              ? EVENT_TEST_PENDING
              : null;
      if (!ev) {
        throw new Error(
          'Unexpected test event (not passing, failing, or pending): ' +
          tst.title
        );
      }

      runner.emit(ev, tst, tst.fail ? tst.err : undefined);
    });
  });
  runner.emit(EVENT_SUITE_END);
});
runner.emit(EVENT_RUN_END);

const {
  // passes, tests, pending,
  end
} = stats;

/*
console.log(
  `Passing ${passes}/${tests}${pending ? `Pending ${pending}` : ''}`
);
*/
const endDate = new Date(Date.parse(end));
const lastRan = new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric'
}).format(endDate);

console.log(
  `Tests finished: ${lastRan}`
);
