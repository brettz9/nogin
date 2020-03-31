[![npm](https://img.shields.io/npm/v/nogin.svg)](https://www.npmjs.com/package/nogin)
[![Dependencies](https://img.shields.io/david/brettz9/nogin.svg)](https://david-dm.org/brettz9/nogin)
[![devDependencies](https://img.shields.io/david/dev/brettz9/nogin.svg)](https://david-dm.org/brettz9/nogin?type=dev)
[![Tests badge](https://raw.githubusercontent.com/brettz9/nogin/master/readme_includes/tests-badge.svg?sanitize=true)](readme_includes/tests-badge.svg)
[![Coverage badge](https://raw.githubusercontent.com/brettz9/nogin/master/readme_includes/coverage-badge.svg?sanitize=true)](readme_includes/coverage-badge.svg) (Tested on Firefox and Chrome)

[![Known Vulnerabilities](https://snyk.io/test/github/brettz9/nogin/badge.svg)](https://snyk.io/test/github/brettz9/nogin)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/brettz9/nogin.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/nogin/alerts)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/brettz9/nogin.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/nogin/context:javascript)

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

1. Update **docs**
    1. Update **docs above**
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
    1. **Hierarchical** groups and roles?
    1. **Multiple group membership** allowing **multiple roles per group**,
        including **user-customizable roles** in addition to built-in ones
        such as the "login" privilege; **roles per user (without group)**
        1. Make a simple version of groups where **groups are auto-created**
            that map to privileges (e.g., a login group), so can easily add a
            user to a login group rather than needing to first create the group
            and add the privilege to that group (these could be the built-in
            groups, along with a few combined ones like
            visitor/user/admin/superadmin)
    1. Anticipate privileges that come automatically based on events (e.g., as
        with StackExchange)
    1. **Atomic privileges** (e.g., `view-users` as well as more encompassing
        `view` privilege)
    1. **IP addressed-based privileges (or exclusions)**
    1. **Expiring privileges** (or tied into payment subscription or some
        other event, auto-renewing or not)
    1. See **to-dos in code** for methods needing these!
        1. **Restore `reset`** from GET page to POST on the user (admin) page.
    1. Use within **authentication**
    1. Tie into `PaymentRequest` so privilege groups can be tied to
        payments or subscriptions
        1. npm package for processing/submitting credit info?
        1. might restrict access to whole site (though more likely just parts)
            until payment made
    1. Need to remember to **handle case of users added before privilege
        changes**
    1. Update **docs** for any privilege additions/config
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
    1. Adapt server-side redirect functionality to give Ajax feedback to
        client so it could instead handle forwarding *with* a hash.
1. See about **`passport-next`** integration
1. **BrowserID** - Implement browser add-on (or work with existing Persona)
    to use with a server-side validation
1. Add **passwordless** option
1. Method to auto-create accessibility-friendly **navigation bar**, including
    login (root), logout, home, signup, and users (the special pages,
    'activation', 'lostPassword', 'resetPassword', 'delete', 'reset',
    'coverage', should not need to be added). Also add breadcrumbs and
    `<link rel=next/prev>`.
1. Option to **email forgotten username** (as a workaround, the reset
    password email will send this currently, but not if adding an option to
    disable the current `uniqueEmails` mode). Alternatively, could
    **allow login by email.** Don't want to show username for email in UI
    though for privacy reasons (more serious than just detecting that the
    user has an account, this would detect what their account was).

## Lower priorities

1. We should already be checking the important items like avoiding existing
    names, but we should be **rejecting bad values of lesser importance on
    the server-side** as we do on the client-side (e.g., non-emails, too
    short of passwords, etc.)
1. Review **client-side validation** for any other opportunities (e.g., for
    any missing `required` fields, etc.)
1. Switch from `jsdom` to **`dominum`** (once latter may be capable), as latter
    is lighter-weight and we don't need all that jsdom offers; add
    tests within `jamilih` for the integration
1. See about minor **to-dos in code** along the way
1. Make **email activation (and email) optional** (would mitigate some
    problems with email detection when current enforcement of unique emails
    (proposed `uniqueEmails: true`) is enabled as users concerned with
    privacy could at least avoid an email that could be sniffed)?
1. Make server config to **make error messages of potential concern
    to privacy optional** (avoid allowing testing presence of an email
    in the system by feedback from lost password (detecting existent
    vs. non-existent email)
    1. Only complete solution is if also **allowing signup/update
        to an existing email** (otherwise those pages could
        be used for detection instead).
        1. We could also make **emails optional** (beyond activation?)
        1. While we could make the errors less specific, this can still
            effectively be sniffed by signing up for different accounts
            and seeing if they result in some error (they likely shouldn't
            otherwise)
        1. In allowing disabling of `uniqueEmails`, require username be
            provided so will only send reset password for that account
    1. Info: Optional since many sites might wish to enforce unique emails
        or identity-by-email, or may simply wish to give users full
        feedback about whether a lost password email was successfully
        sent or not.
    1. Info: Note that login would always allow detecting existent vs.
        non-existent user names (this is just for email detection)
    1. More **validation from CLI**, e.g., adding an option or default
        to report if an email is already in use
