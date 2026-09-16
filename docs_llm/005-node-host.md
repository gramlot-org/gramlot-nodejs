# 005 · Node hosting experiment

Document ID: **GN-005**. [Expanded version](../docs/005-node-host.md).

<a id="gn-005-005"></a>
## 005 · Scope and ownership

The owner approved JavaScript authoring for this local PoC on 2026-09-16 and
selected native node:http. Node creates a fresh HtmlBuilder and SourceBag for
each page request. Its fluent grammar declares the UI, Data seeds, formula and
Source action. Bag.toTytx serializes the Source; browser HtmlBuilder.loadSource
reconstructs it and Application mounts the ordinary Gramlot runtime.

The host owns the HTML shell, HTTP routing, manifest-based asset serving and
bootstrap/disposal. Application code has no DOM construction, listeners, input
scraping, custom requests or parallel state. No resolver is needed for this
non-remote slice. No database, RPC, authentication, sessions, SSR HTML, persistent
Data or development reload is implemented. Data resets on page reload.

<a id="gn-005-010"></a>
## 010 · Dependency and reproduction

Consume the existing sibling laboratory distribution in place; no bulk port or
framework copy is performed. Evidence: gramlot-poc HEAD
`e2127a1582cdcd62c21b2612741576527aabbfc3`, browser manifest build
`3bca85304c002e75`. These identify the inspected checkout and generated assets;
HEAD alone does not assert that generated assets are committed or reproducible.
A different distribution is unverified. Node v23.11.0 was used locally;
package.json requests Node >=22, without a multi-version compatibility claim.

Run npm start; the host binds loopback only at port 8070 (PORT may override).
GRAMLOT_BROWSER_DIR selects a different prepared browser distribution. No install
is required for production code. npm test uses node:test and the sibling PoC's
jsdom dependency for DOM integration. No external network service is required.

<a id="gn-005-015"></a>
## 015 · Verification and limitations

Tests cover HTTP pages, TYTX reconstruction, health, GET/HEAD/405/404 handling,
manifest asset delivery, traversal rejection and malformed asset URLs. DOM tests
mount serialized Source into the compiled runtime and exercise live input to
formula updates and repeated counter actions. Click tests respect the runtime's
200ms duplicate-click guard. A Source node's label property shadows the label
builder method; the page uses the existing child SourceBag grammar for that tag.

Real in-app browser verification passed against the final server: the page
rendered, entering Ada produced Hello, Ada!, clicking Increment displayed 1,
and navigation to /about rendered the second page. Both automated tests passed.
The host is a local PoC, with no public deployment or release. New work stays on
develop pending owner acceptance. Documentation namespace GN, mirrored paths and
anchors are established; no documentation site is created.
