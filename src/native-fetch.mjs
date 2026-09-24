/** Native HTML host protocol, shared by Node and Bun socket bridges. */
import {readFile} from 'node:fs/promises';
import {FileHost, PageExpired, PageNotFound, HostCapacity} from '@gramlot/native-html/server';

export async function createNativeDispatch({pages, host = null, ownerForRequest = async () => null, ...options} = {}) {
    host ??= new FileHost(pages, options);
    const runtime = await readFile(new URL(import.meta.resolve('@gramlot/native-html/runtime')));
    return {host, async fetch(request) {
        if (new URL(request.url).pathname === host.runtimeUrl) {
            if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', {status: 405});
            return new Response(request.method === 'HEAD' ? null : runtime, {
                headers: {'Content-Type': 'text/javascript; charset=utf-8', 'X-Content-Type-Options': 'nosniff'},
            });
        }
        const url = new URL(request.url);
        const owner = await ownerForRequest(request);
        const reply = (body, status, type = 'text/plain; charset=utf-8') =>
            new Response(body, {status, headers: {'Content-Type': type, 'Cache-Control': 'no-store'}});
        try {
            if (url.pathname === host.mainUrl || url.pathname === host.sourceUrl || url.pathname === host.closeUrl) {
                if (request.method !== 'POST') return reply('Method not allowed', 405);
                if (!request.headers.get('content-type')?.startsWith('application/json')) {
                    return reply('Expected application/json', 415);
                }
                let payload;
                try {
                    // main accepts just pageId. Bound reads even without Content-Length.
                    const reader = request.body?.getReader();
                    if (!reader) return reply('Missing main payload', 400);
                    const chunks = [];
                    let size = 0;
                    while (true) {
                        const {value, done} = await reader.read();
                        if (done) break;
                        size += value.byteLength;
                        if (size > 4096) { await reader.cancel(); return reply('Payload too large', 413); }
                        chunks.push(value);
                    }
                    payload = JSON.parse(await new Blob(chunks).text());
                } catch { return reply('Invalid main payload', 400); }
                if (typeof payload?.pageId !== 'string') return reply('Missing pageId', 400);
                if (url.pathname === host.closeUrl) {
                    host.closePage(payload.pageId, {owner});
                    return reply(JSON.stringify({ok: true}), 200, 'application/json');
                }
                if (url.pathname === host.sourceUrl) {
                    if (typeof payload.method !== 'string' || (payload.params != null &&
                        (typeof payload.params !== 'object' || Array.isArray(payload.params)))) return reply('Invalid Source request', 400);
                    return reply(await host.source(payload.pageId, payload.method, payload.params ?? {}, {owner}), 200, 'application/json');
                }
                return reply(await host.main(payload.pageId, {owner}), 200, 'application/json');
            }
            if (request.method !== 'GET') return reply('Method not allowed', 405);
            let path;
            try { path = decodeURIComponent(url.pathname); }
            catch { return reply('Invalid path', 400); }
            return reply((await host.openPage(path, {owner})).html, 200, 'text/html; charset=utf-8');
        } catch (error) {
            if (error instanceof PageExpired || error instanceof PageNotFound) return reply('Not found', 404);
            if (error instanceof HostCapacity) return reply('Page registry capacity reached', 503);
            // Unexpected application errors remain visible to the owning adapter.
            throw error;
        }
    }};
}
