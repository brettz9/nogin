# DEVELOPING for nogin

## Note if adding CI in future

- Need to provide way for `nogin.js` to be created for reading from
    CLI test and Cyrpess plugin

## Globals

Please note that no globals should be used in client-side code except
for the following:

- `$` - From jQuery (practically a browser polyfill)
- `Nogin` - Contains `_` for i18n, `routes` per server config,
    and a `redirect` method (which takes into account the
    permissibility/possibility of cross-domain redirects).
- `NoginInitialErrorGlobal` - If an error is being passed from the
    server for client-side use.

## Jamilih

While Jamilih should be pretty intuitive to HTML developers, for
server-side-templating, there are at least a few gotchas:

1. One must set `value` on `<input>` with `defaultValue` rather than
    `value`. This is because Jamilih is normally aware that `value`
    can be set as a property, but will not be serialized (e.g., with
    `outerHTML`). However, `defaultValue` will be serialized.
2. Due to similar reasons, one must use `defaultSelected` on
    `<option>` elements, rather than `selected`, to ensure the value
    is serialized.
3. And also for similar reasons, one must set `<input>` checked status
    with `defaultChecked` instead of `checked`.

Jamilih might add configuration later to obviate this need, but these
are the current requirements.

## Cypress config

When running Cypress, you wish to point to your own [`--config-file`](https://docs.cypress.io/guides/references/configuration.html#Options)
in place of our default `cypress.json`, e.g., to set `video: true`,
so you can get videos of the tests (disabled by default for performance
reasons). You would also need to change if you are changing from port
3000 during testing.

### Cypress environmental variables

Although our Cypress setup also copies some values from `nogin.js`
onto `Cypress.env` (to avoid redundancy, e.g., in getting at
`NL_EMAIL_HOST`), we have also defined the following as our own
[Cypress-specific environmental variables](https://docs.cypress.io/guides/guides/environment-variables.html#Setting):

1. `env` - Set to `process.env.NODE_ENV` or failing any to "development".
    Used for determining login credentials (whether to set a secure cookie).
    Behaves like Express' `app.get('env')`.
1. `disableEmailChecking` - Set to `true` to avoid the (longer duration)
    email checking tests (seeing whether an email was received).

You can override the defaults for these values by adding your own
`cypress.env.json` file (a `.gitignore`'d file) Note that for tests,
you will need a `nogin.js` file, also a `.gitignore`'d file, with the
same format as `nogin-sample.js`, though changed to use your own
personal testing email credentials (so the server has a place to send
emails and the tests can verify they are received).
