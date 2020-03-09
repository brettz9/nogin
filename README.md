<!--
[![npm](https://img.shields.io/npm/v/node-login.svg)](https://www.npmjs.com/package/node-login)
-->
[![Dependencies](https://img.shields.io/david/brettz9/node-login.svg)](https://david-dm.org/brettz9/node-login)
[![devDependencies](https://img.shields.io/david/dev/brettz9/node-login.svg)](https://david-dm.org/brettz9/node-login?type=dev)
[![Tests badge](https://raw.githubusercontent.com/brettz9/node-login/master/readme_includes/tests-badge.svg?sanitize=true)](readme_includes/tests-badge.svg)
[![Coverage badge](https://raw.githubusercontent.com/brettz9/node-login/master/readme_includes/coverage-badge.svg?sanitize=true)](readme_includes/coverage-badge.svg)

[![Known Vulnerabilities](https://snyk.io/test/github/brettz9/node-login/badge.svg)](https://snyk.io/test/github/brettz9/node-login)
<!--
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/brettz9/node-login.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/node-login/alerts)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/brettz9/node-login.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/node-login/context:javascript)
-->

[![Licenses badge](https://raw.githubusercontent.com/brettz9/node-login/master/readme_includes/licenses-badge.svg?sanitize=true)](readme_includes/licenses-badge.svg)
[![Licenses dev badge](https://raw.githubusercontent.com/brettz9/node-login/master/readme_includes/licenses-badge-dev.svg?sanitize=true)](readme_includes/licenses-badge-dev.svg)

<!--
[![issuehunt-to-marktext](https://issuehunt.io/static/embed/issuehunt-button-v1.svg)](https://issuehunt.io/r/brettz9/node-login)
-->

# Node Login

[![node-login](./readme_includes/node-login.jpg?raw=true)](https://nodejs-login.herokuapp.com)

### A basic account management system built in Node.js with the following features:

- New User Account Creation
- Secure Password Reset via Email
- Ability to Update / Delete Account
- Session Tracking for Logged-In Users
- Local Cookie Storage for Returning Users
- Blowfish-based Scheme Password Encryption

## Live Demo

[https://nodejs-login.herokuapp.com](https://nodejs-login.herokuapp.com)

For testing purposes you can view a [database dump of all accounts here](https://nodejs-login.herokuapp.com/print).<br>Note: This database automatically resets every 24 hours.

## Installation & Setup

1. Install [Node.js](https://nodejs.org/) & [MongoDB](https://www.mongodb.org/) if you haven't already.

2. Clone this repository and install its dependencies.

```sh
git clone git://github.com/braitsch/node-login.git node-login
cd node-login
npm install
```

3. In a separate shell start MongoDB.

```sh
mongod
```

4. From within the node-login directory start the server.

```sh
node app
```

5. Open a browser window and navigate to: [http://localhost:3000](http://localhost:3000)

## Password Retrieval

To enable the password retrieval feature it is recommended that you create environment variables for your credentials instead of hard coding them into the [email dispatcher module](https://github.com/braitsch/node-login/blob/master/app/server/modules/email-dispatcher.js).

To do this on OSX you can simply add them to your `.profile` or `.bashrc` file.

```sh
export NL_EMAIL_HOST='smtp.gmail.com'
export NL_EMAIL_USER='your.email@gmail.com'
export NL_EMAIL_PASS='1234'
```

[![node-login](./readme_includes/retrieve-password.jpg?raw=true)](https://nodejs-login.herokuapp.com)

## Command line usage

[![cli.svg](https://brettz9.github.io/node-login/readme_includes/cli.svg)](cli.svg)

To view as non-embedded HTML or SVG files (for copy-pasteable commands):

- [cli.html](https://brettz9.github.io/node-login/readme_includes/cli.html)
- [cli.svg](https://brettz9.github.io/node-login/readme_includes/cli.svg)

## Programmatic usage

- TODO

## Steps for getting port that may block Mongo DB

MongoDB may end up with a process that interferes with starting a new instance.

On the Mac, you can follow these steps to resolve:

1. Get the port `sudo lsof -i :27017`
2. Then kill by `kill PID` with PID as the result of step 1 (or if necessary `kill -2 PID`).

## Contributing

Questions and suggestions for improvement are welcome.

## To-dos

1. **Testing and coverage** (get to **100%** coverage):
    1. Checking **email programmatically** ([POP](https://www.npmjs.com/package/node-pop3)
        [client](https://www.npmjs.com/package/pop3-client) for dev only)
    1. Specific issues (if still occurring)
        1. Figure out why `users` page still shows an account upon
            (first) deletion
        1. Get validation to reset on change or input events
        1. Spot check that all dialogs are fully visible
    1. Make distinct badges for local results of each of testable browsers
1. Update **docs** above

1. Upon **update of email address**, send email to confirm it
1. Allow convenience for easier **customization of route after login**
1. Link to **resend activation link** (mention at
    <https://github.com/braitsch/node-login/pull/11> when may be done)
1. Role-based **privileges** (esp. for reset/delete!) with **admin screens**
    1. **Multiple group membership** allowing **multiple roles per group**,
        including **user-customizable roles** in addition to built-in ones
        such as the "login" privilege
        1. Make a simple version of groups where groups are auto-created that
            map to privileges (e.g., a login group), so can easily add a user
            to a login group rather than needing to first create the group
            and add the privilege to that group (these could be the built-in
            groups, along with a few combined ones like
            visitor/user/admin/superadmin)
    1. See **to-dos in code** for methods needing these!
    1. Update **docs** for any privilege additions/config
    1. **Hierarchical** groups and roles?
    1. Use within **authentication**

1. Publish **release**

## Medium priorities

1. Allow **adding to "Set up new account" fields** (based on a schema?)
    (to be injected into `app/server/views/account.js`) to be passed to
    the server (`app/server/routes.js`) and saved in the database along
    with other fields (check the user-supplied don't overwrite built-ins)
    and shown on `home` (also built by `account.js`) (unless hidden?);
    not trusting the client-side values of course (could parse
    server-side-supplied schema for expected types); use `json-editor`?
1. **Captchas** ([svg-captcha](https://www.npmjs.com/package/svg-captcha)
  (doesn't use easily breakable SVG text, and could convert to image))
1. **Security** CSRF protection
1. Provide **option for integration** within an existing page to avoid need
    for separate login page
1. See about **`passport-next`** integration
1. **BrowserID** - Implement browser add-on (or work with existing Persona)
    to use with a server-side validation
1. Add **passwordless** option

## Lower priorities

1. Figure out why opt-in email tests (`'cypress.env.disableEmailChecking': false`)
    has problems with POP3 `DELE` (with `QUIT`). Is it the library, my
    server or something else? (Email tests are all passing, just not properly
    deleting). See <https://tools.ietf.org/html/rfc1939>
1. Switch from `jsdom` to **`dominum`** (once latter may be capable), as latter
    is lighter-weight and we don't need all that jsdom offers; add
    tests within `jamilih` for the integration
1. See about minor **to-dos in code** along the way
1. Review **client-side validation** for any other opportunities (e.g., for
    any missing `required` fields, etc.)
