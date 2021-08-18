# CHANGES for nogin

## ?

### User-facing

- npm: Update `connect-mongo` (minor), `jsdom` (major)

### Dev-facing

- Linting: As per latest ash-nazg
- npm: Update devDeps.

## 2.7.0

### User-facing

- Update: Update versions in `integrityMap.json`
- npm: Update jsdom (minor)

### Dev-facing

- Linting: Update Cypress/bootstrap expectations
- npm: Update peerDeps/devDeps.

## 2.6.1

### User-facing

- Fix: Change new tester to CJS file:
    `public-test/utils/db-basic-testing-extensions.cjs`

## 2.6.0

### User-facing

- Enhancement: Expose `public-test/utils/db-basic-testing-extensions.js` for
    importing by other nogin-based Cypress tests

### Dev-facing

- npm: Update devDeps, including patched `rtl-detect`

## 2.5.4

### User-facing

- Fix: Ensure `postLoginRedirectPath` is used for client-side post-login
    redirect.

### Dev-facing

- Refactor: Use builtin async API for sending email

## 2.5.3

### User-facing

- Fix: Set up static `node_modules` paths relative to cwd

### Dev-facing

- N/A

## 2.5.2

### User-facing

- Fix: Specify some `peerDependencies` needed relative to root

### Dev-facing

- N/A

## 2.5.1

### User-facing

- Fix: Make router path relative to cwd

### Dev-facing

- N/A

## 2.5.0

### User-facing

- Fix: Default locales path should be relative to nogin project root, not cwd
- npm: Update express-rate-limit (minor), mongodb (patch), nodemon (patch)

### Dev-facing

- Testing: Remove no longer needed cypress-axe hack
- npm: Update devDeps.

## 2.4.0

- Security update: Update to version of `jquery-form` without XSS or eval
    vulnerabilities

## 2.3.0

### User-facing

- Security enhancement: XSRF protection
- Fix: Add missing `meta[charset]`
- Fix: Expand dialog so can be visible
- Fix: Ensure modal is not covered by backdrop
- Fix: Ensure modal ok and cancel buttons can be clicked to close themselves
- npm: Update `emailjs` (minor)

### Dev-facing

- npm: Update devDeps.

## 2.2.0

### User-facing

- Security enhancement: Allow `sameSite` for session cookies
- Enhancement: Allow control of `express-session` options (including `cookie`)
- Fix: Handle missing `passKey` (as with lost session) upon `resetPassword`

### Dev-facing

- N/A

## 2.1.0

### User-facing

- Security enhancement: Apply helmet (using defaults except to allow same
    origin frames by default) with `helmetOptions` to configure or
    `noHelmet` option to disable
- Update: CDN for bootstrap

### Dev-facing

- npm: Drop `csslint` from `lint` script
- npm: Avoid running `build-docs` script for now during `prepublishOnly`
- npm: Update devDeps.

## 2.0.0

### User-facing

- Breaking change: Update `engines` to require Node >= 12
- Fix: Use appropriate `uuid` version for random values (v4)
- Update: CDNs, husky
- Update: CLI docs
- npm: Update deps. (fontawesome-free (patch), popperjs/core (minor),
    bootstrap (stable patch), connect-mongo (major), express-session (patch),
    file-fetch (minor), intl-dom (minor), jquery (minory), jsdom (minor),
    mongodb (patch), rtl-detect (patch))

### Dev-facing

- Linting: As per latest ash-nazg
- Testing: Update Cypress API
- Testing: Overcome problem now with Mocha by switching to "mjs" (Cypress seems
    to have a problem, so not doing whole project yet)
- npm: Update devDeps.

## 1.4.0

### User-facing

- Security enhancement: Use cryptographically secure random value
- Fix: Allow `countryCodes` to be an array (in the config file)
- Build: Update integrity map
- npm: Peg popper version in package.json
- npm: Update bootstrap (pre)
- npm: Update jamilih (minor)
- npm: Update mongodb (patch)
- npm: Update express-rate-limit (patch)

### Dev-facing

- Linting: As per latest ash-nazg
- Testing: Update to strip warning (apparently caused by switch to pnpm)
- npm: Switch to pnpm
- npm: Update devDeps. (including ash-nazg peerDep. changes)

## 1.3.0

### User-facing

- Fix (i18n/accessibility): Ensure `lang` (and if for RTL languages, the `dir`
    property) is set on `<html>`
- Enhancement: Allow strings for `injectHML`
- Docs: Update license badges; CLI docs
- Update: Local path (fontawesome) and CDN URLs
- npm: Update fontawesome (minor), intl-dom (minor), mongodb (patch),
    nodemon (patch), emailjs (minor), express-rate-limit (minor),
    mongodb (patch), file-fetch (minor), promise.allsettled (patch)

### Dev-facing

- Docs: Update dev license badge per latest
- Linting: Per latest ash-nazg
- Testing: Fix test expectation per recent URL change
- Testing: Rename `mocha-multi-reporters.json` file to avoid conflict
- Testing: Workaround for axe issue
- npm: Add `update-cdns` to `run-if-changed` for package-lock; force
    eslint cache removal on package-lock change and add script
- npm: Change `prepare` to `prepublishOnly`; avoid 3rd-party-linting,
    badge and doc building on every package lock change, but do check
    prepublish
- npm: Check `eslint-3rd` with package-lock updates
- npm: Use stable `mocha-multi-reporters` devDep.
- npm: Add `axe-core` for `cypress-axe`
- npm: Fix `csslint` file path
- npm: Switch from deprecated `babel-eslint` to `@babel/eslint-parser`
- npm: Update devDeps.

## 1.2.0

- Build: Add `integrity-matters` for auto-updating CDNs and checking
    `integrity`
- Update: Update `popper.js` URL; use updated `fontawesome-free`
- Refactoring: Move integrity attributes out to utility (toward
    automating updating of version URLs/integrity SHAs)
- Linting: As per latest ash-nazg
- Docs: Update license badges per latest
- Maintenance: Add `husky`, `lint-staged`, `run-if-changed`
- npm: Remove unwanted `nyc` call
- npm: Update `jsdom`, `mongodb`, `stylus`, `emailjs` dependencies
- npm: Change `font-awesome` to current `@fortawesome/fontawesome-free`
- npm: Update devDeps.

## 1.1.0

- Fix: Update jquery versions and hashes; switch
    to now preferred bootstrap CDN
- Docs: Update license and license dev badges
- Linting: Update to-dos (no fix for cypress issue yet)
- Linting: Add todos for specific packages/versions that would need
    SHA/path updating
- Update: emailjs API
- Testing: Ensure regex pattern allows for prerelease versions
- Testing: Avoid 3rd party ESLint file in coverage check
- npm: Update `engines` to `10.6.0` as per `ls-engines` check
- npm: add 3rd party linting script
- npm: Fix sp. in `test` script
- npm: Update bootstrap, emailjs, jquery-form, mongodb
- npm: Update devDeps.

## 1.0.0

- Breaking refactoring: Rename `NL_ROUTES` to `Nogin` global (and put
    `_` global inside)
- Security: Timing safe compare for login checks
- Security: Prevent `?redirect=` from applying cross-domain to avoid
    impression of being on the same site after login
- Enhancement: Provide shim/no-op (for Error and console) for very old
    browser support
- Enhancement: For Firefox 2 support, avoid use of `location.href` by
    default (though necessitating new cross-domain `crossDomainJSRedirects`
    option)
- Update: Per latest `escape-string-regexp` and `@cypress/code-coverage`
- Linting: Add linting of server string output to Cypress test
- Linting: As per latest ash-nazg
- Linting: Use `--cache`
- Docs: Update license badge per latest
- Testing: Change check to be more Node-version-independent (error message
    varies)
- npm: Add separate `synk` script
- npm: Update deps (intl-dom, patches: express-session, express-rate-limit,
    jquery, mongodb)
- npm: Add react/react-dom for mochawesome
- npm: Update from deprecated `rollup-plugin-babel` to `@rollup/plugin-babel`
- npm: Update devDeps
- Todo

## 1.0.0-rc.1

- Breaking change: Avoid defaults for `NL_EMAIL_HOST` and `NL_SITE_URL`.
- License: Add `core-js` to bundled (MIT)
- Fix: Add Rollup with Babel (and core-js) to ensure syntax working on
    older browsers; add options `useESM` and `noPolyfill` for configuring
- Update: Global setting no longer needed for `intl-dom`
- Enhancement: i18nize query params (redirect, key, c)
- Enhancement (CLI): Make `noLogging` available for other verbs (at
    least might use with add/update)
- Linting: Enforce `no-restricted-globals` with `window`
- Linting: Avoid disabling compat plugin for client-side code
- Docs: Add migration guide
- Docs: Update CLI help
- Docs: Add jsdoc
- npm: Move `chai-as-promised` to devDeps and `nodemon`/`npm-run-all`
    to deps.
- npm: Add `license-badges` to `prepare` script
- npm: Add `doiuse` for CSS support browserslist detection
- npm: Update devDeps.

## 1.0.0-beta.5

- Fix: Ensure that user can signup again if email dispatch fails
- Fix: Change error messages (both for signup or updating) to indicate
    conditions when an email is changed but there is an error sending
    the activation link out (possibly due to a bad email address); was
    incorrectly reporting that the account had not been changed
- Fix: Avoid chance for clashes or unnecessary data by deleting
    unactivated accounts once one is activated.
- Enhancement: Ensure that any `?redirect=` query parameter present in
    the path passed to root (`/` by default) is used for redirecting after
    login.
- Enhancement: i18nize routes
- Enhancements (config):
    - Optional override (i18nized) routes with config
    - Add `postLoginRedirectPath` option for users to redirect by
        default somewhere other than `/home` (or locale equivalent) after
        login.
    - Add option on whether to require name (`requireName`)
    - Allow pointing to own locales base path via `localesBasePath` option.
    - Allow changing activation email or reset password email template
        (with alternative JS template modules):
        `composeResetPasswordEmailView` and `composeActivationEmailView`
- Optimization: Cache i18n functions and data
- Messages: Change client-side (email) update message to mention
    that though otherwise changed, the email change awaits link activation
- Docs: Update coverage badge per latest coveradge
- Refactoring: Avoid setting global `fetch` or `document` per updated
    `intl-dom`
- Testing: Add test to ensure one can indeed update email after
    bad link dispatch
- Testing: Optimize email retrieval when getting most recent email; bump
    timeouts; avoid no longer needed code
- Testing: Check that message is received upon successful signups
- npm: Update devDeps; update `intl-dom` dep.

## 1.0.0-beta.4

- Security: Add password into activation hash so lesser chance for
    auto-enabling of other users
- Fix: Ensure all activation-failed pages are status 400
- Enhancement: Upon email update, dispatch email and require activation;
    ask user for confirmation before doing so (and inform user of
    consequences for confirmation)
- Enhancement (config):
    - Add `showUsers` config (on by default) to disable `/users` list page
        as can be a privacy leak if users not intended to be public
        (may reset back to default in the future if made safely based
        on privilege levels)
- Testing: Add manual testing for non-activated account
- npm: Update devDeps

## 1.0.0-beta.3

- Breaking change: Disable dangerous `/reset` page (until such
    time as may reenable as POST API endpoint for privileged users)
- Fix (regression): Get old values to show on `/home`
- Fix (regression): Allow user to update with same email again
- Fix (regression?): Give reset password dialog proper sizing and display
- Refactoring: Use `user` from session (in case code is refactored to use
    the client-obtained variable, and there is a forgery)
- Testing: Resume nodemon
- Testing: Misc. additions/improvements
- Docs: Change to just link to devDep licenses
- npm: Update devDeps and `package-lock.json`

## 1.0.0-beta.2

- Change: Avoid a few login defaults (don't want to encourage using them!)
- Change: Send error to user on home page if session is lost
- Fix: Pass on `injectHTML` properly
- Fix: Display errors on signup
- Fix (regression): Properly handle `Promise.allSettled` values
- Fix: Disallow empty user string for user attempting to visit `/home`
- Fix: Ensure `passVer` can be passed in from CLI (but not web)
- Enhancement: Allow `country` as CLI add/remove/etc. verb option
- Enhancement: Expose `listIndexes` to CLI
- Enhancement: Ensure router runs before `*`
- Enhancement: Avoid font-awesome when using `noBuiltinStylesheets`
- Docs: Prefer `@example.name` (people should get their own domains for
    greater independence!)
- Docs: Add to specific CLI verb command documentation
- Linting/Refactoring: Misc.
- Testing: Full 100% coverage

## 1.0.0-beta.1

- Breaking enhancement: Avoid `process.env` (`app.js` accepts CLI now instead)
- Breaking change: Specify Node >= 10.4.0 in `engines`
- Breaking change: Rename auto-set `pass_ver` to `passVer`
- Breaking change: Rename `print` page to `users`
- Breaking refactoring: `EmailDispatcher` and `AccountManager` are now classes;
  `routes` accepts config
- Security: Add PBKDF2 hashing (@SCG82)
- Security: Make "secret" private and configurable; add
  integrity/cross-origin=anonymous for jquery.form and font-awesome
  (switching to same CDN); add also for github-fork-ribbon-css
- Security: Use signed cookie
- Security: Pass secret to cookie parser as otherwise potentially problematic
- Security: `express-rate-limit`-based rate-limiting (for protection against
    DoS)
- Security: Minimize XSS vectors by using safer jQuery methods
- Security/Fix: Avoid ability for user to update account to an existing email.
- Fix: Add proper plain text for plain text email
- Update: Use now required Mongodb APIs
- Update: CDN for bootstrap (CSS and JS), jquery, popper
- Enhancement: Database abstraction layer
- Autocomplete hints (name, user, email, country, new/current password)
- Enhancement: More configurabiity, e.g.,
    - Add `stylesheet` and `noBuiltinStylesheets`
    - Add `userJS` and `userJSModule`
    - Add `staticDir` and `middleware`
    - Add `router`
    - Add `injectHTML`
    - Add `countryCodes`
    - Add `localScripts` option for using non-CDN copies
    - Add `fromText` and `fromURL` for password reset emails
    - Add `NS_EMAIL_TIMEOUT` option
- Enhancement: CLI for adding accounts
- Enhancement: i18n (server-side, client-side, and CLI)
- Enhancement: Make available as binary (with help/version and
  `update-notifier`)
- Enhancement: Use browser native form validation
- Enhancement: Require email link verification code (inspired by
  <https://github.com/braitsch/node-login/pull/11>)
- Accessibility: Use h1+ headings; labels; roles (passing all
  except for `color-contrast` whose check we are temporarily disabling
  until may have time to fix)
- Optimization: Add `use strict`
- Docs: Add Change log
- Docs: Indicate planned to-dos
- Docs: CLI
- Docs: Indicate license types, test results, and coverage as badges
- Linting (ESLint): Apply eslint-config-ash-nazg
- Refactoring: Destructuring; arrow functions for handlers;
  utilize succincter stylus features
- Refactoring: convert further APIs to (async/await) Promises
- Refactoring: Avoid inline styles
- Refactoring: Further separation of view logic out of controllers
- Refactoring: Switch to Jamilih templates
- Refactoring: Add scripts to head with `defer`
- Refactoring: Use variables in place of selectors where possible
- Linting (ESLint): As per latest ash-nazg
- Build: Add sourcemaps to stylus
- Maintenance: Add `.editorconfig`
- Testing: Cypress testing, including axe accessibility testing and
    coverage
- npm: Mongodb and server start scripts; misc. testing and badge
    generation scripts
- npm: Add recommended `package.json` fields
- npm: Update deps and devDeps
