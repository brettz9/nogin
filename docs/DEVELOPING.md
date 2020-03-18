# DEVELOPING for nogin

## Jamilih

While Jamilih should be pretty intuitive to HTML developers, for server-side-templating, there are at least two gotchas:

1. One must set `value` on `<input>` with `defaultValue` rather than
    `value`. This is because Jamilih is normally aware that `value`
    can be set as a property, but will not be serialized (e.g., with
    `outerHTML`). However, `defaultValue` will be serialized.
2. Due to similar reasons, on `<option>` elements, rather than `selected`,
    one must use `defaultSelected` to ensure the value is serialized.

Jamilih might add configuration later to obviate this need, but these
are the current requirements.
