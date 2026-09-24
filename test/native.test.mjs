import test from 'node:test';
import assert from 'node:assert/strict';
import {Host, Page, source} from '@gramlot/native-html/server';
const {startNativeServer} = await import(globalThis.Bun ? '../src/native-bun.mjs' : '../src/native-node.mjs');

class HtmlPage extends Page {
    main(root) { root.h1('Hello World'); }
    details(root) { root.p('Remote HTML'); }
}
source(HtmlPage.prototype.details);
class TestHost extends Host {
    async resolvePage(path) { return path === '/' ? HtmlPage : super.resolvePage(path); }
}

test('real listener serves packaged runtime and typed main/remote; errors and shutdown', async () => {
    const host = new TestHost();
    const failures = [];
    const app = await startNativeServer({host, ownerForRequest: request => request.headers.get('x-owner'),
        onError: error => failures.push(error)});
    let pageId;
    try {
        const bootstrap = await fetch(app.url, {headers: {'x-owner': 'alice'}});
        assert.equal(bootstrap.status, 200);
        const html = await bootstrap.text();
        pageId = JSON.parse(html.match(/new Gramlot\((.*?)\)/)[1]).pageId;
        assert.ok(!html.includes('<h1>'));
        assert.match(html, /"closeUrl":"\/gramlot\/close"/);
        const asset = await fetch(app.url + '/assets/gramlot.js');
        assert.equal(asset.status, 200);
        assert.match(asset.headers.get('content-type'), /javascript/);
        assert.ok((await asset.text()).length > 1000);
        const post = (path, payload, owner = 'alice') => fetch(app.url + path, {
            method: 'POST', headers: {'content-type': 'application/json', 'x-owner': owner}, body: JSON.stringify(payload),
        });
        const main = await post('/gramlot/main', {pageId});
        assert.equal(main.status, 200);
        assert.match(await main.text(), /Hello World/);
        const remote = await post('/gramlot/source', {pageId, method: 'details'});
        assert.equal(remote.status, 200);
        assert.match(await remote.text(), /Remote HTML/);
        assert.equal((await post('/gramlot/main', {pageId}, 'bob')).status, 404);
        assert.equal((await post('/gramlot/source', {pageId, method: 'main'})).status, 404);
        assert.equal((await post('/gramlot/main', {pageId, excess: 'a'.repeat(5000)})).status, 413);
        assert.equal((await fetch(app.url + '/gramlot/main')).status, 405);
        assert.equal((await fetch(app.url + '/missing')).status, 404);
        for (const [body, contentType, status] of [
            ['{', 'application/json', 400], ['{}', 'application/json', 400],
            ['{}', 'text/plain', 415],
        ]) {
            const invalid = await fetch(app.url + '/gramlot/main', {
                method: 'POST', headers: {'content-type': contentType}, body,
            });
            assert.equal(invalid.status, status);
        }
        assert.equal((await post('/gramlot/close', {pageId}, 'bob')).status, 200);
        assert.equal((await post('/gramlot/main', {pageId})).status, 200);
        assert.equal((await post('/gramlot/close', {pageId})).status, 200);
        assert.equal((await post('/gramlot/main', {pageId})).status, 404);
        assert.equal((await post('/gramlot/close', {pageId})).status, 200);
        assert.equal((await fetch(app.url + '/gramlot/close')).status, 405);
        const expiring = await fetch(app.url, {headers: {'x-owner': 'alice'}});
        const expiringId = JSON.parse((await expiring.text()).match(/new Gramlot\((.*?)\)/)[1]).pageId;
        host.pages.get(expiringId).expires = 0;
        assert.equal((await post('/gramlot/main', {pageId: expiringId})).status, 404);
        assert.deepEqual(failures, []);
    } finally { await app.close(); }
    assert.equal(host.pages.size, 0);
    await assert.rejects(fetch(app.url));
});
