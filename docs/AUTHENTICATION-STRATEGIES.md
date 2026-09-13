# Authentication strategy integration

## Status

This document proposes an integration between Nogin and
`@passport-next/passport`. It is a design document, not a description of an
implemented API.

The goal is to let an application select authentication strategies while each
selected strategy can contribute the user interface and supporting behavior its
authentication mechanism requires. A local strategy needs username and password
fields; a CAPTCHA strategy may need an image, a refresh endpoint, and client-side
behavior; an OAuth strategy may only need a button and callback routes.

## Current architecture

Nogin currently owns the complete account and login lifecycle:

- `app/server/app.js` configures Express, `express-session`, the MongoDB session
    store, body parsing, security middleware, static resources, and routes.
- `app/server/routeList.js` connects the account manager, renders the login page,
    handles the root login POST, stores the account in `req.session.user`, and
    implements authorization.
- `app/server/views/login.js` renders fixed username and password fields as
    Jamilih.
- `app/public/js/controllers/loginController.js` assumes that fixed form and
    submits it through AJAX.
- `app/server/routeUtils.js` composes layouts and already supports trusted HTML
    injection at broad page locations.

The current session value is a local Nogin account object. Its requirements are
context-dependent:

- General login checks test whether `req.session.user` is present.
- Root access compares `req.session.user.user` against the configured
    `rootUser` list.
- Group privilege lookup uses `req.session.user.user` as the local Nogin
    username.
- Account editing and self-deletion use additional local account fields such as
    `_id`, `name`, and `email`.

It is therefore inaccurate to say that every authentication check requires
`req.session.user.user`. The exact direct expression is used for root access,
although the username is also needed by group-based authorization. A strategy
can establish some notion of authentication without a complete Nogin account,
but existing account and authorization features cannot all operate on an
arbitrary provider profile.

## Design goals

1. Reuse the Passport strategy ecosystem without making Passport responsible
    for Nogin's account screens, groups, privileges, or page layout.
2. Let applications explicitly select and configure authentication methods.
3. Let each method contribute fields, buttons, images, scripts, styles, and
    narrowly scoped supporting routes.
4. Preserve the built-in local username/password flow by default.
5. Keep login rendering localized and visually consistent with Nogin.
6. Support form submissions, redirects, callbacks, and eventually multi-step
    challenges.
7. Make trust boundaries and account-linking behavior explicit.

## Non-goals

The initial integration should not attempt to make Nogin:

- an OAuth 2.0, OpenID Connect, or SAML identity provider;
- a centralized single sign-on server;
- a sandbox for untrusted strategy UI code;
- a general authentication-flow orchestration engine; or
- a replacement for full identity platforms such as Keycloak.

## Recommended architecture

Use a dedicated `Passport` instance and a Nogin-owned adapter layer:

```js
import {Passport} from '@passport-next/passport';

const passport = new Passport();
app.use(passport.initialize());
```

The adapter layer combines four concerns that a Passport strategy by itself does
not define:

```text
Passport strategy
    + login presentation
    + supporting routes and assets
    + authenticated identity to Nogin account mapping
```

Passport remains responsible for executing an authentication mechanism. Nogin
remains responsible for page composition, localization, application sessions,
local accounts, redirects, groups, and privileges.

### Session ownership

Initially, do not install `passport.session()`. Nogin already uses
`express-session` and stores its application principal in `req.session.user`.
Adding Passport login sessions would create a second source of truth under the
same Express session and require synchronization between `req.user`, Passport's
serialized data, and `req.session.user`.

Passport should authenticate the current request. The Nogin adapter should then
decide what to persist.

For the least disruptive first version, require successful strategies to resolve
to a local Nogin account and continue storing that account in
`req.session.user`. This preserves all existing account and privilege behavior.

A later version may distinguish an authenticated external identity from a linked
local account:

```js
req.session.auth = {
  strategy: 'example',
  subject: 'provider-stable-subject'
};

req.session.user = linkedNoginAccount ?? null;
```

That model is useful only if Nogin intentionally supports authenticated users
who have no local account. It would require auditing every route to decide
whether it needs authentication, a linked local account, or particular account
fields. It should not be introduced merely to integrate Passport.

## Configuration model

Add an option such as `authStrategies` that names a trusted ESM configuration
module. Its default value should configure the built-in local strategy.

The module should export strategy descriptors rather than bare Passport strategy
objects:

```js
export default function getAuthenticationStrategies ({accountManager}) {
  return [
    {
      id: 'local',
      label: 'Username and password',
      strategy: createLocalStrategy(accountManager),
      supportsRememberMe: true,

      render ({_, action}) {
        return {
          content: [
            ['div', {class: 'form-group'}, [
              ['label', {for: 'user-tf'}, [_('Username')]],
              ['input', {
                id: 'user-tf',
                name: 'user',
                type: 'text',
                autocomplete: 'username',
                required: 'required'
              }]
            ]],
            ['div', {class: 'form-group'}, [
              ['label', {for: 'pass-tf'}, [_('Password')]],
              ['input', {
                id: 'pass-tf',
                name: 'pass',
                type: 'password',
                autocomplete: 'current-password',
                required: 'required'
              }]
            ]]
          ],
          action
        };
      },

      async toNoginUser ({passportUser}) {
        return await passportUser;
      }
    }
  ];
}
```

Passing `accountManager` to the configuration factory lets the built-in local
strategy delegate password verification to `AccountManager.manualLogin()`.
This preserves Nogin's current password hashing, activation checks, and account
shape.

### Descriptor contract

A strategy descriptor may contain:

```js
/**
 * @typedef {object} AuthenticationStrategyDescriptor
 * @property {string} id
 * @property {string|((context: object) => string)} label
 * @property {object} strategy
 * @property {(context: object) => object|Promise<object>} render
 * @property {(context: object) => unknown|Promise<unknown>} [getRenderState]
 * @property {object} [authenticateOptions]
 * @property {(context: object) => object|Promise<object>} toNoginUser
 * @property {string[]} [scripts]
 * @property {string[]} [stylesheets]
 * @property {boolean} [supportsRememberMe]
 * @property {(router: object, context: object) => void|Promise<void>} [mount]
 */
```

The precise public type should be finalized during implementation. Important
semantic requirements are:

- `id` is unique, URL-safe, and stable.
- `strategy` is registered on the dedicated Passport instance using `id`.
- `render()` returns the strategy-specific portion of the login experience.
- `getRenderState()` creates request-specific display state, such as a CAPTCHA
    challenge, before rendering.
- `toNoginUser()` converts a successful strategy result into the canonical
    local account used by existing Nogin features.
- `mount()` receives a router confined to the strategy's namespace rather than
    unrestricted ownership of the application.

Descriptors are trusted server configuration, equivalent in trust to Nogin's
existing `router`, middleware, and `injectHTML` modules. They are not safe to
load from untrusted packages or user input.

## Rendering model

Refactor the login view into a shared page shell and one presentation unit per
configured strategy. The shared shell owns:

- page headings and layout;
- strategy selection when more than one is enabled;
- common error presentation;
- signup and password recovery links where applicable; and
- consistent submit controls and accessibility structure.

Each descriptor owns only the fields or launch control required by its method.
Jamilih should be the preferred representation because Nogin already uses it for
server-rendered views.

### Declarative UI before arbitrary HTML

A small declarative vocabulary is preferable for common strategy UI:

```js
const captcha = {
  id: 'captcha',
  fields: [
    {
      type: 'image',
      source: '/_auth/captcha/image',
      alt: 'Captcha'
    },
    {
      type: 'text',
      name: 'code',
      required: true
    }
  ],
  clientModule: '/_auth/captcha/client.js'
};
```

This makes consistent layout, escaping, accessibility, Content Security Policy,
and testing easier. A lower-level `render()` escape hatch should remain available
for mechanisms that cannot be expressed declaratively.

If raw HTML strings are supported, convert them with the structured
`jml.toJML()` mechanism already used for injected HTML. Raw HTML should not be
the primary API.

### Assets

Descriptors may declare scripts and stylesheets, but asset URLs should be
validated and passed through the normal layout and Helmet/CSP decisions.
Strategy-specific client code should not be added to the shared login controller.

The existing browser code should eventually be separated into:

- a shared login controller for password recovery, errors, and redirects;
- a local strategy controller for local validation and remember-me behavior;
- strategy-specific modules for CAPTCHA refresh, WebAuthn, or other specialized
    interactions.

## Routes and authentication lifecycle

Every strategy should have stable, non-localized routes under a reserved
namespace:

```text
POST /_auth/local
POST /_auth/captcha
GET  /_auth/github
GET  /_auth/github/callback
```

Supporting routes mounted by a descriptor should remain below
`/_auth/<strategy-id>/`. Authentication routes must be mounted before Nogin's
localized wildcard GET and POST handlers.

Separate routes are preferable to routing every mechanism through `/` because
the existing root POST is AJAX-specific, while Passport strategies may issue
redirects, challenges, callbacks, or multi-step responses.

### Successful authentication

The adapter should use Passport's custom callback form so Nogin controls failure
responses, account mapping, session persistence, remember-me behavior, and the
final redirect:

```js
passport.authenticate(descriptor.id, async (error, passportUser, info) => {
  if (error || !passportUser) {
    return handleAuthenticationFailure({error, info, req, res});
  }

  const noginUser = await descriptor.toNoginUser({
    passportUser,
    info,
    request: req,
    accountManager
  });

  if (!noginUser) {
    return handleAuthenticationFailure({req, res});
  }

  await regenerateSession(req);
  req.session.user = noginUser;
  res.redirect(getPostLoginTarget(req));

  return undefined;
})(req, res, next);
```

The implementation must adapt this sketch to the request-first hooks and native
ESM API of the selected `@passport-next/passport` version.

Regenerate the session ID after successful authentication to mitigate session
fixation. Preserve only explicitly approved pre-authentication state across
regeneration, such as a validated return target or active challenge identifier.

### Failure representation

Normalize strategy failures into a small Nogin-owned result type instead of
exposing arbitrary Passport `info` objects directly:

```js
const result = {
  code: 'invalid-credentials',
  strategy: 'local',
  retryable: true
};
```

The server can map these codes to localized messages. Responses should remain
generic by default so they do not disclose whether an account exists.

### Redirect targets

Move safe post-login target calculation into a reusable helper rather than
leaving it nested inside the root GET handler. Form and callback strategies must
share the same open-redirect protection and `postLoginRedirectPath` behavior.

For redirect-based strategies, save only a validated local return path before
leaving Nogin. Do not trust a callback query parameter as a redirect target.

## Local strategy compatibility

The local username/password method should be the built-in default descriptor.
Existing installations that do not configure `authStrategies` should retain the
current login page and behavior.

During migration, the existing root POST can forward to the local adapter or
remain as a compatibility alias. New forms should post to `/_auth/local`.
Removing the root POST should require a major version change.

Remember-me behavior is currently a Nogin feature based on a signed cookie and
`AccountManager.generateLoginKey()`. It belongs in the Nogin adapter, not in a
generic Passport strategy. Only descriptors that resolve to a local account can
use the current remember-me mechanism without redesigning its stored identity.

## External identity and account linking

Provider profiles should never be stored directly as local accounts merely
because they contain a field named `user`, `username`, or `email`.

`toNoginUser()` must implement an explicit policy:

1. Return an already-linked local account.
2. Provision a new local account if application policy allows it.
3. Ask the user to link or create an account through a dedicated flow.
4. Reject authentication when no permitted local account exists.

The durable link should use the tuple of strategy/provider ID and the provider's
stable subject identifier. Email alone is not a safe automatic linking key unless
the provider, verification state, and application policy are explicitly trusted.

Account linking is the largest domain feature absent from the initial adapter
proposal. It should be designed and tested separately from basic strategy
execution.

## Multi-step and combined authentication

The initial descriptor model treats configured strategies as alternatives: the
user chooses one method that can authenticate the request.

CAPTCHA illustrates an ambiguity. It may be:

- an alternative strategy that authenticates an identity by itself;
- an input required by another strategy; or
- a preliminary anti-automation check before credentials are verified.

The latter two are authentication-flow composition, not merely strategy
selection. Do not imply that a flat array of Passport strategies provides MFA or
ordered challenges.

A later flow model might define ordered or conditional steps, assurance levels,
and resumable challenge state. Until that exists, a combined mechanism should be
implemented as one composite Passport strategy and one descriptor so its
security invariants remain local and testable.

## Security requirements

- Treat descriptor modules, renderers, and mounted routes as trusted code.
- Reject duplicate, malformed, and reserved strategy IDs at startup.
- Namespace all strategy-owned routes and assets.
- Apply CSRF protection to form-based authentication endpoints unless a
    protocol has a different, well-defined request validation mechanism.
- Require OAuth and OpenID Connect strategies to validate `state`; use nonce and
    PKCE where the protocol and client type require them.
- Validate redirect destinations centrally and permit local paths by default.
- Regenerate the session after authentication.
- Keep authentication failure messages generic.
- Apply rate limiting to each authentication endpoint, not only the login page.
- Prevent a strategy from reading or overwriting another strategy's pending
    challenge state by namespacing session data.
- Do not expose provider access or refresh tokens through `req.session.user` or
    browser responses.
- Define whether deactivated or deleted local accounts invalidate sessions
    created through external strategies.
- Reconcile strategy scripts, images, and styles with Helmet and the deployed
    Content Security Policy.
- Use explicit escaping or structured Jamilih data for all dynamic display
    values.

## Comparison with other open source systems

### Passport

Passport supplies request authentication middleware and separately installed
strategies. The application owns routes, UI, storage, and serialization.

The proposed Nogin layer is intentionally more opinionated: it gives a strategy
a presentation and account-mapping contract while preserving Passport's
mechanism ecosystem. It is therefore a product integration above Passport, not a
replacement for Passport.

### Better Auth

Better Auth is a broad TypeScript authentication and authorization framework.
Its plugins can add endpoints, schemas, middleware, hooks, rate limits, and
client APIs. Its core schema distinguishes users, sessions, accounts, and
verification records.

Nogin plus Passport would be smaller and more Express-specific. It could reuse
niche Passport strategies and Nogin's existing account/privilege UI, but Better
Auth already has a more comprehensive plugin lifecycle, type inference, database
adapters, account linking, passkeys, two-factor authentication, organizations,
and session features.

Better Auth is the closest architectural benchmark if Nogin's descriptors grow
beyond authentication and rendering. That expansion should be resisted unless a
real Nogin use case needs it.

### Auth.js

Auth.js offers providers, callbacks, adapters, sessions, and generated or custom
sign-in pages across several modern JavaScript frameworks. It has a large set of
preconfigured OAuth providers and supports credentials, email links, and
WebAuthn. As of 2026, Auth.js is part of Better Auth and its documentation points
new migration work toward Better Auth.

Nogin is more tightly coupled to Express and server-rendered Jamilih views. Its
advantage would be compatibility with Passport strategies and preservation of
Nogin's current account administration. Auth.js has much stronger provider and
database-adapter conventions.

### Keycloak

Keycloak is a separately deployed identity and access management server. It
supports OpenID Connect, OAuth 2.0, SAML, identity brokering, LDAP/Active
Directory federation, configurable authentication flows, MFA, passkeys, admin
and account consoles, session administration, auditing, and themes.

Keycloak authenticators can contribute templates and theme resources, which is
conceptually similar to a strategy contributing login UI. The operational model
is very different: applications redirect users to Keycloak and receive tokens;
they do not embed Keycloak strategies in their Express process.

Nogin would be easier to embed and customize in JavaScript, but should not claim
the protocol, federation, administration, or security maturity of Keycloak.

### Ory Kratos

Ory Kratos is a headless identity service with self-service flows and a
bring-your-own-UI model. The service returns declarative UI nodes and flow state;
the application renders them. Identities are governed by schemas.

Nogin's declarative field model would resemble Ory's UI-node boundary, while a
free-form `render()` callback is more permissive and less portable. Ory also runs
as a separate service, whereas Nogin remains embedded in Express.

### Summary

| System | Extension unit | UI ownership | Identity model | Deployment |
| --- | --- | --- | --- | --- |
| Nogin proposal | Passport strategy descriptor | Shared Nogin shell with strategy contribution | Existing local accounts, with explicit mapping | Embedded Express app |
| Passport | Strategy | Application | Application-defined | Embedded middleware |
| Better Auth | Server/client plugin | Application frontend | Built-in user, account, and session models | Embedded framework library |
| Auth.js | Provider and callbacks | Generated or application page | Adapter-backed users and accounts | Framework integration |
| Keycloak | Authentication flow, SPI, and theme | Identity server | Central realms, users, and federation | Separate IAM server |
| Ory Kratos | Identity method and self-service flow | Application renders flow nodes | Schema-defined identities | Separate headless service |

The intended position for Nogin is:

> An embeddable Express account and authorization system with
> Passport-compatible authentication methods and composable server-rendered
> login experiences.

## Open design questions

Before stabilizing a public API, decide:

1. Must every successful strategy resolve to a local Nogin account?
2. Are configured strategies alternatives only, or is ordered composition in
    scope?
3. Is declarative field rendering sufficient for the first release?
4. How are external identities stored and linked to local accounts?
5. Which descriptor assets may be remote, and how are they admitted to CSP?
6. Should authentication endpoints be localized or permanently reserved and
    non-localized?
7. How do HTML navigation and AJAX clients negotiate success and failure
    responses?
8. Which pre-authentication session values survive session regeneration?
9. Does remember-me apply only to local accounts or receive a provider-neutral
    redesign?
10. What lifecycle invalidates an externally authenticated session when its
    linked local account is disabled or deleted?

## Proposed implementation phases

### Phase 1: Internal local adapter

- Add `@passport-next/passport` and a compatible local strategy.
- Create a dedicated Passport instance.
- Express the current local login as an internal descriptor.
- Preserve the current UI and root POST behavior.
- Add focused tests proving no behavioral regression.

This phase validates the adapter boundary without exposing a public plugin API.

### Phase 2: Public descriptors and multiple alternatives

- Add the configuration-module option and startup validation.
- Render multiple configured strategies.
- Add namespaced authentication endpoints.
- Split shared and local client behavior.
- Document the trusted-code boundary and descriptor contract.

### Phase 3: External identity linking

- Add a durable provider/subject link model.
- Define first-login, provisioning, linking, and rejection policies.
- Ensure deactivation, deletion, privileges, and audit behavior remain coherent.

### Phase 4: Advanced challenges only if required

- Add resumable multi-step state, flow composition, MFA, or assurance levels
    only after concrete strategy requirements establish the necessary model.

## Testing strategy

At minimum, add coverage for:

- the default local descriptor preserving current login behavior;
- startup rejection of duplicate or malformed IDs;
- rendering one and multiple strategy presentations;
- isolation of strategy routes and pending session state;
- CSRF and rate limiting on form strategies;
- safe return paths for form and redirect strategies;
- session ID regeneration after success;
- generic failures for unknown users and bad credentials;
- mapping a provider result to an existing local account;
- rejection when account mapping fails;
- root, group, and per-user privileges after strategy login;
- deactivated or deleted linked accounts; and
- logout and remember-me behavior.

Use a small fake Passport strategy for most integration tests. It should support
deterministic success, failure, error, and redirect cases without depending on an
external identity provider.

## Recommendation

Start with the internal local adapter and require a canonical local Nogin account
after every successful strategy. Prefer declarative UI contributions with a
trusted Jamilih `render()` escape hatch. Keep Passport stateless from its own
perspective and let Nogin remain the sole owner of application session state.

This is the smallest design that enables configurable authentication UI while
preserving the current account, privilege, localization, and rendering systems.
It also leaves room for external identities without prematurely turning Nogin
into a full identity platform.
