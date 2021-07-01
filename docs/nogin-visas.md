# nogin-visas

"Visa" is used to suggest here a particular implementation of
["passport"](https://github.com/passport-next/passport), i.e., using the
passport-next API but obtaining and/or saving details from and to a
specific database or website.

## Publishing

If publishing on npm, please give it at least the keyword, "nogin-visa".

## API

### `name` (`Object<languageCode, string>`: required and must contain an `en-US` key)

Localizations of the name of the plugin. Will be shown as a heading when
selected. If the site deploys more than one visa plugin, the plugin name will
show within the nogin UI in a pull-down.

### `iconURL` (`string`: required)

A URL path to show as an icon for the plugin when displaying the plugin name
as a heading or as a pull-down entry.

### `init`

### `login` (`{validate: (req, username, password) => Promise<boolean>, fields?: () => Promise<string>}`: required)



In the future, the `fields` method might optionally be able to return
something like a JSON schema object, so that no HTML string building is
required.

### `signup` (`{validate: (req) => Promise<boolean>, fields?: () => Promise<string>}`: optional)

A cookie will be set upon visiting `signup` and choosing a validation
type so that upon visits to the login page, the corresponding login
options/validation will be shown as the default choice.

In the future, the `fields` method might optionally be able to return
something like a JSON schema object, so that no HTML string building is
required.

Note that any `validate` processing may optionally just save the information
locally, so even if you are using a third-party package for the `login`
behavior, you could add your own `signup` so as to save extra fields local
to the site. You might also override an existing `signup` object's methods
to ensure it successfully validates remotely but also can save data locally.
