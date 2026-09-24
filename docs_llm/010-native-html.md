# 010 · Native HTML hosts

Document ID: **GN-010**. Development implementation, not a released package.

<a id="gn-010-005"></a>

## 005 · Node and Bun

The current clean-core profile is exported as `gramlot-nodejs/native` (Node) and
`gramlot-nodejs/bun` (Bun). Each exports `startNativeServer({pages, hostname, port})`.
`pages` is the installed application's trusted JS pages directory; `port: 0` selects
an available port. The result exposes `url`, `host`, `server` and asynchronous
`close()`, which closes sockets and clears page registrations.

Both bridges use `@gramlot/native-html/server` and serve the packaged
`@gramlot/native-html/runtime` asset. Node translates HTTP streams to Fetch requests;
Bun uses native Fetch requests. Shared `native-fetch.mjs` owns HTTP routing,
bounded payload parsing, response/error mapping and request identity extraction.
Neutral Host owns page execution, page registrations, ownership checks and TTL.
JSON `POST /gramlot/close` passes adapter-derived owner identity to
`Host.closePage`. Explicit browser disposal and non-persisted `pagehide` attempt
closure; TTL covers failed delivery.
An optional `host` supplies page execution; the adapter's `ownerForRequest(request)`
callback supplies identity without adding HTTP methods to Host; the default anonymous profile is intended for local Hello World.
No database or Python worker is loaded. Unexpected errors produce HTTP 500 and
are delivered to the configurable `onError` callback.

The previous PoC server remains a separate historical entry point. Its sibling-PoC
runtime and tests do not establish compatibility for this native profile.

<a id="gn-010-010"></a>

## 010 · Verification and distribution

Run `npm run test:native` for the real Node listener contract and
`bun test test/native.test.mjs` for Bun. The browser harness accepts an installed
Playwright module and Chromium executable:

```sh
node test/native-browser.mjs node /path/to/playwright/index.mjs /path/to/chromium
node test/native-browser.mjs bun /path/to/playwright/index.mjs /path/to/chromium
```

The browser check covers initial main, typed Source insert/delete/update, a remote
HTML block, disposal and JavaScript errors. Framework fixtures may manipulate Source;
application pages only declare their elements. Hello World launchers live in
`gramlot-examples/apps/hello-world`, as `npm run start:node` and `npm run start:bun`.

First-party dependencies are floating. The new core/generic package graph is local
development work; upstream source availability and clean upstream installation
remain separate gates. Isolated archive tests must not be represented as published
package support. No package release or deployment is part of this profile.
