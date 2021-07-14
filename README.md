[![npm](https://img.shields.io/npm/v/nogin.svg)](https://www.npmjs.com/package/nogin)
[![Dependencies](https://img.shields.io/david/brettz9/nogin.svg)](https://david-dm.org/brettz9/nogin)
[![devDependencies](https://img.shields.io/david/dev/brettz9/nogin.svg)](https://david-dm.org/brettz9/nogin?type=dev)

[![Tests badge](https://raw.githubusercontent.com/brettz9/nogin/master/doc-includes/tests-badge.svg?sanitize=true)](doc-includes/tests-badge.svg)
[![Coverage badge](https://raw.githubusercontent.com/brettz9/nogin/master/doc-includes/coverage-badge.svg?sanitize=true)](doc-includes/coverage-badge.svg)

[![Known Vulnerabilities](https://snyk.io/test/github/brettz9/nogin/badge.svg)](https://snyk.io/test/github/brettz9/nogin)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/brettz9/nogin.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/nogin/alerts)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/brettz9/nogin.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/nogin/context:javascript)

[![Licenses badge](https://raw.githubusercontent.com/brettz9/nogin/master/doc-includes/licenses-badge.svg?sanitize=true)](doc-includes/licenses-badge.svg)

<small>(Note that the more restrictive [@fortawesome/fontawesome-free](https://www.npmjs.com/package/@fortawesome/fontawesome-free)
share-alike terms are for the fonts themselves, not its CSS (which is under MIT); see also [licenses for dev. deps.](https://raw.githubusercontent.com/brettz9/nogin/master/doc-includes/licenses-badge-dev.svg?sanitize=true).)</small>

[![issuehunt-to-marktext](https://issuehunt.io/static/embed/issuehunt-button-v1.svg)](https://issuehunt.io/r/brettz9/nogin)

# Nogin

*A maintained and expanded fork of <https://github.com/braitsch/node-login>.*

![nogin](./doc-includes/nogin.jpg?raw=true)

The project name is a portmanteau of "Node" and "login" and is pronounced "noggin"
(a colloquial word for "head").

So if you want Node login, use your "nogin"!

![nogin](./doc-includes/retrieve-password.jpg?raw=true)

### A basic account management system built in Node.js with the following features:

- New user account creation
- Email verification/activation
- Secure password reset via email
- Ability to update / delete account
- Session tracking for logged-in users
- Local cookie storage for returning Users
- PBKDF2-based password encryption
- XSRF/CSRF protection
- helmet integration for HTTP headers control
- `sameSite` session cookies
- Timing safe login check comparisons
- Throrough internationalization (i18n) and fundamental accessibility (a11y)
- CLI option for managing accounts
- 100% Cypress UI and CLI Testing Coverage
- Tested on Chrome and Firefox but with a Babel/core-js Rollup routine that
    should allow the code to work in other browsers as well.

## Improvements over `node-login`

While you can see [CHANGES](./CHANGES.md) (or the
[1.0.0 migration guide](./docs/migration/1.0.0.md))
to see all of the fixes and enhancements (including security fixes), the
essential change has been to avoid the necessity of directly modifying
source. This component has been retooled to allow it to be added as an
npm dependency and provided command-line arguments which customize the
appearance and behavior to a high degree--and using a config file or CLI
flags rather than environmental variables.

## Installation & Setup

1. Install [Node.js](https://nodejs.org/) (minimum version of 10.4.0) and
    [MongoDB](https://www.mongodb.org/) if you haven't already. (Note
    that while we have provided a generic database adapter that could in
    theory be used to support other databases, MongoDB
    is the only currently supported database.)

2. Install the package.

```sh
npm install nogin
```

3. Install the `peerDependencies`. I recommend installing [install-peerdeps](https://www.npmjs.com/package/install-peerdeps)
    (`npm i -g install-peerdeps`); then `install-peerdeps nogin` will
    auto-install the rest.

4. Use `run-p` (which is made available by the `nogin` dependency, `npm-run-all`)
    along with two of your own `package.json` scripts, one of which to start
    the mongo database, and the other to start the nogin server (note that
    `nodemon` is also provided as a dependency, so you could add that to
    the `nogin` call to watch for changes to `nogin` files):

```json
{
    "scripts": {
        "mongo": "mongod --port=27017 --dbpath=db --bind_ip=127.0.0.1",
        "server": "nogin --localScripts --config nogin.js",
        "start": "run-p -r mongo server"
    }
}
```

(The `-r` flag indicates that an error in one script will lead both to exit.)

Alternatively, you can start MongoDB in its own separate shell:

```sh
mongod
```

...and from within the nogin directory in another terminal, start the server:

```sh
nogin --localScripts --config nogin.js
```

5. Once the script mentions it is listening (on port 3000 by default), open
    a browser window and navigate to: [http://localhost:3000](http://localhost:3000)

## Steps for getting port that may block Mongo DB

MongoDB may end up with a process that interferes with starting a new instance.

On the Mac, you can follow these steps to resolve:

1. Get the port `sudo lsof -i :27017`
2. Then kill by `kill PID` with PID as the result of step 1 (or if
    necessary `kill -2 PID`).

## Command line usage

[![cli.svg](https://brettz9.github.io/nogin/doc-includes/cli.svg)](./doc-includes/cli.svg)

To view as non-embedded HTML or SVG files (for copy-pasteable commands):

- [cli.html](https://brettz9.github.io/nogin/doc-includes/cli.html)
- [cli.svg](https://brettz9.github.io/nogin/doc-includes/cli.svg)

### Command line summary

#### Server flags (without verbs)

When no verbs are added (only flags are supplied), you can see the above
for a detailed description of the available flags. We group and summarize
these here (all strings unless indicated). See also "Flags available
regardless of "verb"" as those also apply as server flags.

##### Use in place of command line flags (CLI flags will take precedence)**

- `-c`/`--config` - (Defaults to `<cwd>/nogin.json`; may also be a JS file.)
- `--cwd` (Defaults to `process.cwd()`.)

##### Required fields (no defaults)

You can also look at `nogin-sample.js` for how to set these values within
your own `nogin.js` config file.

- `--secret`
- `--NL_EMAIL_USER`
- `--NL_EMAIL_PASS`
- `--NL_EMAIL_HOST`
- `--NL_EMAIL_FROM`
- `--NL_SITE_URL`
- `--fromText`
- `--fromURL`

##### Security

- `--disableXSRF` (Boolean; defaults to `false`.)
- `--noHelmet` (Boolean; defaults to `false`.)
- `--RATE_LIMIT` (A number defaulting to 100 for a rate limit.)
- `--csurfOptions` (A string, or, in config, an object; defaults to
    `{cookie: {signed: true, sameSite: "lax"}`; note that if you are on
    HTTPS, it is recommended to set this to
    `{cookie: {secure: true, signed: true, sameSite: "lax"}`).
- `--helmetOptions` (A string, or, in config, an object; defaults to
    `{frameguard: {action: "SAMEORIGIN"}}`). Note that `SAMEORIGIN` is required
    as the `action` to allow `nogin` to be used within your site's iframes.
- `--sessionOptions` (A string, or, in config, an object; defaults to
    `{resave: true, saveUninitialized: true}` along with
    `cookie: sessionCookieOptions`, `secret`, and
    `store: new MongoStore({url: DB_URL, mongoOptions: '{useUnifiedTopology: true, useNewUrlParser: true}})')`
- `--sessionCookieOptions` (A string, or, in config, an object; defaults to
    `{sameSite: 'lax'}`)

##### Tweaks for general administration

- `--NS_EMAIL_TIMEOUT` (number of milliseconds, defaulting to 5000)
- `--PORT` (number, defaulting to 3000)
- `-a`/`--adapter` (Defaults to "mongodb", the only current option.)

##### Tweaks for user-facing behavior

- `--requireName` (Default is `false`.)
- `--countryCodes` (Two-letter country codes as JSON array; defaults to
    codes in `/app/server/modules/country-codes.json`.)

##### Customizing locales

- `--localesBasePath` (Defaults to `app/server`; use if need to redefine
    locale values.)

##### Customizing HTML

These should normally not changing, but can be changed to tweak the HTML that
is rendered in emails or on the server.

- `--composeResetPasswordEmailView` (Defaults to `/app/server/views/composeResetPasswordEmail.js`)
- `--composeActivationEmailView` (Defaults to `/app/server/views/composeActivationEmail.js`)
- `--injectHTML` (No extra HTML is injected by default)
- `--favicon` (String path; defaults to blank.)

##### Customizing stylesheets

- `--stylesheet` (String path; defaults to no extra stylesheets being used.)
- `--noBuiltinStylesheets` (Boolean, defaults to `false`)

##### Customizing JavaScript

- `--localScripts` (Boolean, defaults to `false`)
- `--userJS` (None by default)
- `--userJSModule` (None by default)

These should primarily only be used with testing:

- `--useESM` (Boolean, defaults to `false`.)
- `--noPolyfill` (Boolean, defaults to `false`.)

##### Customizing routes

This is for changing the names or behavior of existing routes. See "Adding routes"
for supporting additional routes.

- `--postLoginRedirectPath` (Path/URL to which to redirect after login; defaults
    to `/home` (or locale equivalent.)
- `--customRoute` (Multiple strings in format `<locale>=<route>=<path>`)
- `--crossDomainJSRedirects` (Boolean, defaults to `false`.)

##### Adding routes

- `--showUsers` - `/users` page is not shown by default for privacy of those
    users. Set to `true` to enable.
- `-s`/`--SERVE_COVERAGE` (Boolean; defaults to `false`.)
- `--staticDir` (One or more string paths)
- `--middleware` (One or more middleware to be required)
- `--router`

##### Used mainly for internal testing of `nogin`

- `-d`/`--JS_DIR` - (Defaults to `/app/public`; used for pointing to
    instrumented path.)

#### Verbs

One can also add a verb to `nogin` (e.g., `nogin read`) which performs a
different behavior from creating a server.

- `help` - Use with one of the verbs below to get help for that command
- `read`/`view` - View user account(s)
- `update` - Update user account(s)
- `add`/`create` - Create new user account(s)
- `remove`/`delete` - Remove user account(s)
- `listIndexes` - List indexes of the nogin database

#### Flags available regardless of "verb" (besides `help`)

Defaults in parentheses:

- `--loggerLocale` ("en-US")
- `--noLogging` (`false`)
- `-n`/`--DB_NAME` ("nogin")
- `-t`/`--DB_HOST` ("localhost")
- `-p`/`--DB_PORT` (27017)
- `-u`/`--DB_USER`
- `-x`/`--DB_PASS`

#### Flags reused among verbs "read"/"view", "update", "add"/"create", "remove"/"delete".

These are are all `multiple` (one to be added for each user being viewed/added/etc.).

Unless notes, all types are strings.

- `--user` (as the default option, the flag `--user` can be omitted)
- `--name`
- `--email`
- `--country` (Two digit recognized country code)
- `--pass`
- `--passVer` (A number indicating the current schema version; should always be
    set to "1" currently.)
- `--date` (A number timestamp for record creation date)
- `--activated` (A boolean)

These are shared but will primarily only be of interest in internal nogin
testing:

- `--activationCode`
- `--unactivatedEmail`
- `--activationRequestDate` (A number timestamp)

<!--
- `--passKey`
- `--ip`
- `--cookie`
- `--_id`
-->

#### Flags for specific verbs

##### `add`/`create`

Note that the CLI API for the `add` and `update` verbs does not currently
perform all validation that the UI does, so you will need to have some
familiarity with nogin internals to be sure to include all required fields.

- `--userFile` - Path to JSON file containing data to populate
- `--cwd` - Used with `userFile`

##### `remove`/`delete`

- `--all` - Boolean to indicate desire to remove all user records!

## Programmatic docs

1. `npm i` (local install to get devDeps)
1. `npm run build-docs`
1. Open `docs/jsdoc/index.html`

## Contributing

Questions and suggestions for improvement are welcome.

For developing docs, see [DEVELOPING](./docs/DEVELOPING.md).

## To-dos

1. See about removing **`@fortawesome/fontawesome-free` dependency** (and if
    so, rebuild license badges and remove note above about its license)
1. **Login page**
    1. Provide **option for integration** within an existing page to avoid need
        for separate login page (Ajax)
        1. Adapt server-side redirect functionality to give Ajax feedback to
            client so it could instead handle forwarding *with* a hash.
        1. Consider possibility of an option to **merge with signup page**
    1. **Multiple simultaneously-shown login choices** (e.g., to use version
        control or Cloud Storage and a database managing users and privileges)?
    1. **WebSockets** with [express-ws](https://github.com/HenningM/express-ws)
        and [jquery-form](https://github.com/jquery-form/form/issues/582)?
    1. Optional **captcha** (see signup below)
1. **Signup/Home pages**
    1. Allow **Multiple choices**
    1. Allow **adding to "Set up new account" fields** (based on a schema?)
        (to be injected into `app/server/views/account.js`) to be passed to
        the server (`app/server/routes.js`) and saved in the database along
        with other fields (check the user-supplied don't overwrite built-ins)
        and shown on `home` (also built by `account.js`) (unless hidden?);
        not trusting the client-side values of course (could parse
        server-side-supplied schema for expected types); use `json-editor`?
        1. Plugin system to allow asking for and saving additional data
            per user. May optionally be able to reject submission, but
            should instead use an authentication strategy plugin, if
            it is more fundamental to authentication (since this should
            generally be safely additive).
        1. Concept of [SharedStorage](https://github.com/brettz9/SharedStorage)
            for grabbing local user data (or on a URL) for populating
            site profiles/preferences (under control of user, so they can
            manage their data in one place, and let sites update their own
            copy (or directly utilize the local copy) when online and
            checking)
    1. **Captchas** ([svg-captcha](https://www.npmjs.com/package/svg-captcha)
        (doesn't use easily breakable SVG text, and could convert to image))
        1. Plugin system for captchas, while potentially allowing saving
            to and retrieving from database (e.g., for admin-added list
            of Q&A's), need not be aware of any other co-submitted data
            like username, password, etc. Unlike "set up new account"
            plugins, wouldn't need access to user database, but can of
            course have potential to reject submission.
1. **Authentication strategies**
    1. See about **`passport-next`** integration
        1. [WebSockets with passport](https://stackoverflow.com/questions/35654099/using-websocket-with-passport/47984698)?
        1. Supporting **user choice** of authentication method
            1. Different strategies could optionally offer different schemas for:
                1. User (Registration and edit user)
                1. Preferences (Tied to user but unlike general content, may
                    possibly of interest across site/application such as desire
                    for dark mode, and unlike most content, would be private and
                    not likely of interest in content queries)
                1. Login (e.g., to auto-add field for captcha, or
                    [`CryptoKey`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey)
                    and [`CryptoKeyPair`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair))
                    generation/selection.
                1. Privileges, Privilege Groups, User Groups
    1. **BrowserID**
        to use with a server-side validation
        1. See <https://github.com/jaredhanson/passport-browserid>.
        1. Would presumably need to revive as a
            [browser add-on](https://github.com/mozilla/browserid_addon/blob/master/addon/lib/main.js)
        1. Browser add-on could also expose global *locally stored* preferences
    1. Strategy idea: Check host of email domain and insist on `.name` at a
        reliable host which promises not to give out domains under a minimum
        fee (as a deterrent for spamming and encouragement for mail address
        portability); would need to find hosts willing to commit to such a
        policy.
    1. Add **passwordless** option
        1. See <http://www.passportjs.org/packages/passport-passwordless/>.
1. **Users page**
    1. **Ajax pagination**
    1. **Privileges**
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
        1. Need to remember to **handle case of users added before privilege**
            **changes**
        1. Update **docs** for any privilege additions/config
1. **Other pages**
    1. Method to auto-create accessibility-friendly **navigation bar**, including
        login (root), logout, home, signup, and users (the special pages,
        'activation', 'lostPassword', 'resetPassword', 'delete', 'reset',
        'coverage', should not need to be added). Also add breadcrumbs and
        `<link rel=next/prev>`.

## Lower priority to-dos

1. Allow variant of `localScripts` which uses CDN but generates fallback
1. Option to **email forgotten username** (as a workaround, the reset
    password email will send this currently, but not if adding an option to
    disable the current `uniqueEmails` mode). Alternatively, could
    **allow login by email.** Don't want to show username for email in UI
    though for privacy reasons (more serious than just detecting that the
    user has an account, this would detect what their account was).
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
