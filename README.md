<!--
[![npm](https://img.shields.io/npm/v/nogin.svg)](https://www.npmjs.com/package/nogin)
-->
[![Dependencies](https://img.shields.io/david/brettz9/nogin.svg)](https://david-dm.org/brettz9/nogin)
[![devDependencies](https://img.shields.io/david/dev/brettz9/nogin.svg)](https://david-dm.org/brettz9/nogin?type=dev)
[![Tests badge](https://raw.githubusercontent.com/brettz9/nogin/master/readme_includes/tests-badge.svg?sanitize=true)](readme_includes/tests-badge.svg)
[![Coverage badge](https://raw.githubusercontent.com/brettz9/nogin/master/readme_includes/coverage-badge.svg?sanitize=true)](readme_includes/coverage-badge.svg)

[![Known Vulnerabilities](https://snyk.io/test/github/brettz9/nogin/badge.svg)](https://snyk.io/test/github/brettz9/nogin)
<!--
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/brettz9/nogin.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/nogin/alerts)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/brettz9/nogin.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/nogin/context:javascript)
-->

[![Licenses badge](https://raw.githubusercontent.com/brettz9/nogin/master/readme_includes/licenses-badge.svg?sanitize=true)](readme_includes/licenses-badge.svg)

(see also [licenses for dev. deps.](https://raw.githubusercontent.com/brettz9/nogin/master/readme_includes/licenses-badge-dev.svg?sanitize=true))

<!--
[![issuehunt-to-marktext](https://issuehunt.io/static/embed/issuehunt-button-v1.svg)](https://issuehunt.io/r/brettz9/nogin)
-->

# Nogin

![nogin](./readme_includes/nogin.jpg?raw=true)

A maintained and expanded fork of <https://github.com/braitsch/node-login>.

The name is a portmanteau of "Node" and "login" and is pronounced "noggin"
(a colloquial word for "head").

So if you want Node login, use your "nogin"!

**Note: This revised version of node-login is not yet fully ready for
production use, nor is the documentation below fully up-to-date.**

### A basic account management system built in Node.js with the following features:

- New User Account Creation
- Secure Password Reset via Email
- Ability to Update / Delete Account
- Session Tracking for Logged-In Users
- Local Cookie Storage for Returning Users
- Blowfish-based Scheme Password Encryption

## Installation & Setup

1. Install [Node.js](https://nodejs.org/) & [MongoDB](https://www.mongodb.org/) if you haven't already.

2. Install the package.

```sh
npm install -P nogin
```

3. In a separate shell start MongoDB.

```sh
mongod
```

4. From within the nogin directory start the server.

```sh
node app
```

5. Open a browser window and navigate to: [http://localhost:3000](http://localhost:3000)

## Password Retrieval

To enable the password retrieval feature, it is recommended that you create
environment variables for your credentials instead of hard coding them into
the [email dispatcher module](https://github.com/brettz9/nogin/blob/master/app/server/modules/email-dispatcher.js).

To do this on OSX you can simply add them to your `.profile` or `.bashrc` file.

```sh
export NL_EMAIL_HOST='smtp.gmail.com'
export NL_EMAIL_USER='your.email@gmail.com'
export NL_EMAIL_PASS='1234'
```

![nogin](./readme_includes/retrieve-password.jpg?raw=true)

## Command line usage

[![cli.svg](https://brettz9.github.io/nogin/readme_includes/cli.svg)](cli.svg)

To view as non-embedded HTML or SVG files (for copy-pasteable commands):

- [cli.html](https://brettz9.github.io/nogin/readme_includes/cli.html)
- [cli.svg](https://brettz9.github.io/nogin/readme_includes/cli.svg)

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

1. Review **error messages for privacy** (avoid allowing testing
    presence of email by feedback from login or lost password attempts, etc.)
    1. Might keep code present though for debugging

1. Link to **resend activation link**
    1. Ensure this works when needing to get one resent **after an update**
1. Allow convenience for easier **customization of where route
    redirects after login**
    1. Allow **redirect to be based on URL** (e.g., if user coming to the
        login from another page, let them redirect to that; ideally
        client-side also, so can work with anchors).

1. Update **docs**
    1. Update **docs above**
    1. Make **distinct badges** for local results of each of testable
        browsers, or at least report if all are passing
    1. **Review CHANGES** to ensure includes all changes (and so docs
        are mentioning)
    1. Document `env` vars in `main.js` plugin file (`env`, `coverage`,
        `disableEmailChecking`; and distinguish from `secret` and
        `NL_EMAIL_HOST`, `NL_EMAIL_USER`, and `NL_EMAIL_PASS`);
        see <https://docs.cypress.io/guides/guides/environment-variables.html#Setting>
1. Publish **release**
    1. Inform `node-login` main in relevant PRs
        1. Mention any new behavior for resending activation link (and how
            update now causes new activation to be required) at
            <https://github.com/braitsch/node-login/pull/11> when may be done)

## Medium priorities

1. Role-based **privileges** (esp. for reset/delete!) with **admin screens**
    1. **Remove `reset` GET page** to a POST on the user (admin) page.
    1. **Multiple group membership** allowing **multiple roles per group**,
        including **user-customizable roles** in addition to built-in ones
        such as the "login" privilege
        1. Make a simple version of groups where **groups are auto-created**
            that map to privileges (e.g., a login group), so can easily add a
            user to a login group rather than needing to first create the group
            and add the privilege to that group (these could be the built-in
            groups, along with a few combined ones like
            visitor/user/admin/superadmin)
    1. See **to-dos in code** for methods needing these!
    1. Update **docs** for any privilege additions/config
    1. **Hierarchical** groups and roles?
    1. Use within **authentication**
    1. Need to remember to **handle case of users added before privilege
        changes**
1. Make form **name field optional**
1. **Ajax pagination of users**
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

1. We should already be checking the important items like avoiding existing
    names, but we should be **rejecting bad values of lesser importance on
    the server-side** as we do on the client-side (e.g., non-emails, too
    short of passwords, etc.)
1. Figure out why **opt-in email tests are problematic**
    (`'cypress.env.disableEmailChecking': false`) in POP3 `DELE` (with `QUIT`)
    not deleting. Is it the library, my server or something else? (Email tests
    are all passing, just not properly deleting within the test). See
    <https://tools.ietf.org/html/rfc1939>
1. Switch from `jsdom` to **`dominum`** (once latter may be capable), as latter
    is lighter-weight and we don't need all that jsdom offers; add
    tests within `jamilih` for the integration
1. See about minor **to-dos in code** along the way
1. Review **client-side validation** for any other opportunities (e.g., for
    any missing `required` fields, etc.)
1. Allow **changing activation email or reset password email template** (with
    an alternative JS module)
