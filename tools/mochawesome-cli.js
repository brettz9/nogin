/**
 * @file A CLI reporter for after-the-fact compilation of (merged Mochawesome)
 * Mocha results.
 */

'use strict';

const reporterFile = (process.argv[2] || '').trim().replace(/^--/u, '') || 'spec';
// eslint-disable-next-line import/no-dynamic-require
const MochaReporter = require(`mocha/lib/reporters/${reporterFile}.js`);

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

const runner = {
  stats,
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  on (ev, cb) {
    this[ev] = cb;
  },
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  once (ev, cb) {
    this[ev] = cb;
  },
  emit (ev, ...args) {
    if (this[ev]) { // Not all reporters add all events
      this[ev](...args);
    }
  }
};

console.log('Mocha results:');

// eslint-disable-next-line no-new
new MochaReporter(runner);

runner.emit(EVENT_RUN_BEGIN);
results.forEach(({suites}) => {
  suites.forEach((ste) => {
    runner.emit(EVENT_SUITE_BEGIN, ste);
    ste.tests.forEach((tst) => {
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
      runner.emit(ev, tst);
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
