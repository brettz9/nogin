# CHANGES for nogin

## 1.0.0-beta.1

- Breaking enhancement: Avoid `process.env` (`app.js` accepts CLI now instead)
- Breaking enhancement: Allow app to pass in own countries list
- Breaking change: Rename auto-set `pass_ver` to `passVer`
- Breaking change: Rename `print` page to `users`
- Breaking refactoring: `EmailDispatcher` and `AccountManager` are now classes;
  routes accepts config
- Security: Add PBKDF2 hashing (@SCG82)
- Security: Make "secret" private and configurable; add
  integrity/cross-origin=anonymous for jquery.form and font-awesome
  (switching to same CDN); add also for github-fork-ribbon-css, but comment
  out as not in apparent use
- Security: Use signed cookie
- Security: Pass secret to cookie parser as otherwise potentially problematic
- Security: Rate-limiting (for DoS)
- Security: Minimize XSS vectors by using safer jQuery methods
- Security/Fix: Avoid ability for user to update account to an existing email.
- Fix: Add proper plain text for plain text email
- Update: Use now required Mongodb APIs
- Update: CDN for bootstrap (CSS and JS), jquery, popper
- Enhancement: Database abstraction layer
- Enhancement: Autocomplete hints
- Enhancement: More configurabiity, e.g.,
    - Add `stylesheet` and `noBuiltinStylesheets`
    - Add `userJS` and `userJSModule`
    - Add `staticDir` and `middleware`
    - Add `router`
    - Add `injectHTML`
- Enhancement: i18n (server-side, client-side, and CLI)
- Enhancement: Make available as binary (with help/version and
  update-notifier)
- Enhancement: Add `use strict`
- Enhancement: `localScripts` option for using non-CDN copies
- Enhancement: Use native form validation
- Enhancement: Make `fromText` and `fromURL` of password reset emails
  configurable
- Enhancement: Require email link verification code (inspired by
  <https://github.com/braitsch/node-login/pull/11>)
- Enhancement: CLI for adding accounts
- Enhancement: Add `NS_EMAIL_TIMEOUT` option
- Enhancement: Expose `listIndexes` to CLI
- Fix: Requiring of `account.js`
- Fix: Pass on CLI args properly
- Accessibility: Use h1+ headings; labels; roles (passing all
  except for `color-contrast` whose check we are temporarily disabling
  until may have time to fix)
- Docs: Add Change log for unreleased
- Docs: Indicate planned to-dos
- Docs: Some further CLI documentation
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
- Testing: Cypress testing, including axe accessibility testing;
  add sourcemaps to stylus; coverage
- Maintenance: Add `.editorconfig`
- npm: Mongodb and server start scripts
- npm: Add recommended `package.json` fields; allow Node >= 10.4.0 in `engines`
- npm: Update deps and devDeps
