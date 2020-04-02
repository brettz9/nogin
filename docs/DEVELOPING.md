# DEVELOPING for nogin

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

## Email testing

In `cypress.env.json` (a `.gitignore`'d file), you can add
`disableEmailChecking: true` to avoid the more time-consuming tests
which check wheher an email was received. Note that you will need
a `nogin.js` file, also a `.gitignore`'d file, with the same format
as `nogin-sample.js`, though changed to use your own personal testing
email credentials (so the server has a place to send emails and the
tests can verify they are received).
