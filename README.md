# Gramlot Node.js PoC

Local/private experiment: Node.js builds Gramlot Source and serves the existing
browser runtime. No Express, Python process, database, or npm install is required
to run it. This is not a released or accepted Gramlot server adapter.

Keep this checkout beside `gramlot-poc`, whose prepared browser distribution is
required. From this repository:

```sh
npm start
```

Open http://127.0.0.1:8070. `/` demonstrates a live input, data formula and counter;
`/about` explains the boundary; `/health` reports the runtime build.
`PORT` overrides the port. `GRAMLOT_BROWSER_DIR` overrides the absolute path to
`gramlot-poc/src/gramlot/resources/browser`.

```sh
npm test
```

The runtime test additionally requires the laboratory's existing
`js/dom/node_modules/jsdom` installation. No test dependency is needed by the host.

See [architecture and verification](docs/005-node-host.md).
