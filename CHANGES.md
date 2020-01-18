# CHANGES for node-login

## ?

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
- Fix: Add proper plain text for plain text email
- Update: Use now required Mongodb APIs
- Update: CDN for bootstrap (CSS and JS), jquery, popper
- Enhancement: Database abstraction layer
- Enhancement: Autocomplete hints
- Enhancement: More configurabiity
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

## v1.7.2 –– 11-18-2018

- auto-login & password-reset now validating against UUIDs and the user's last recorded IP address

## v1.7.1 –– 11-18-2018

- updating mongodb calls to latest driver
- [fix for #12](https://github.com/braitsch/node-login/pull/12)

## v1.7.0 –– 11-18-2018

- updated dependencies to latest versions
- bootstrap v4.1.3 & jquery v3.3.1
- style.css completely rewritten
- [fix for #36](https://github.com/braitsch/node-login/issues/36)

## v1.6.0 –– 06-10-2018

- updated dependencies to latest versions
- updated mongodb connection scheme
- replaced jade templating engine with pug

## v1.5.0 –– 04-21-2016

- redesigned login window
- improved error handling on password reset
- updating client side libraries:
  - jQuery –– v2.2.3
  - jQuery.form –– v3.51.0
  - Twitter Bootstrap –– v3.3.6

## v1.4.1 –– 02-27-2016

- calls to logout now route to /logout instead of /home
- accounts are now looked up by session.id instead of username
- reset-password modal window fixes
- updating emailjs to v1.0.4
- switching to environment variables for email settings

## v1.4.0 –– 06-14-2015

- updating to Express v4.12.4
- adding connect-mongo for db session store

## v1.3.2 –– 03-11-2013

- fixed bug on password reset

## v1.3.1 –– 03-07-2013

- adding MIT license

## v1.3.0 –– 01-10-2013

- updating to Express v3.0.6

## v1.2.1 –– 01-03-2013

- moving vendor libs to /public/vendor

## v1.2.0 –– 12-27-2012

- updating MongoDB driver to 1.2.7
- replacing bcrypt module with native crypto

## v1.1.0 –– 08-12-2012

- adding /print & /reset methods

## v1.0.0 –– 08-07-2012

- initial release
