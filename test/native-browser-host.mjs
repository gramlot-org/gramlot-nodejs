import {Host, Page, source} from '@gramlot/native-html/server';
const {startNativeServer} = await import(globalThis.Bun ? 'gramlot-nodejs/bun' : 'gramlot-nodejs/native');
class HtmlPage extends Page {
 main(root) { root.h1('Hello World'); root.div(null, {id:'slot'}); }
 details(root) { root.span('Remote HTML'); }
}
source(HtmlPage.prototype.details);
class TestHost extends Host { async resolvePage() { return HtmlPage; } }
const app = await startNativeServer({host:new TestHost()});
console.log(app.url);
for (const signal of ['SIGTERM','SIGINT']) process.once(signal,async()=>{await app.close();process.exit(0);});
