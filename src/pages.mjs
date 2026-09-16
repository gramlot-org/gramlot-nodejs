// Node authors Source; the browser owns rendering and reactive Data.
export function createPages({HtmlBuilder, wrapSource}) {
  function page(about = false) {
    const builder = new HtmlBuilder('main');
    const root = wrapSource(builder.source);
    root.styleSheet({cssText: `body {margin:0;background:#eef3f8;color:#193047;font:17px system-ui}
      main {max-width:760px;margin:64px auto;padding:40px;background:white;border-radius:16px}
      nav {display:flex;gap:20px;margin-bottom:32px} h1 {font-size:36px}
      input,button {font:inherit;padding:10px;margin:8px 12px 8px 0} button {cursor:pointer}
      label,output {display:block;margin-top:16px} a {color:#176bad}`});
    const content = root.main();
    const nav = content.nav();
    nav.a('Interactive page', {href:'/'});
    nav.a('About this PoC', {href:'/about'});
    content.h1(about ? 'Gramlot, hosted by Node.js' : 'Hello from Gramlot + Node.js');
    if (about) {
      content.p('Node builds and serializes Gramlot Source on every page request. The existing JavaScript runtime renders it in your browser.');
      content.p('This local experiment uses node:http, with no Express, Python process or database. Data is local to this browser page and resets on reload.');
    } else {
      root.dataSetter({destination:'name', value:'World'});
      root.dataSetter({destination:'count', value:0});
      root.dataFormula({destination:'greeting', formula:'"Hello, " + name + "!"', name:'^name', _on_start:true});
      content.p('Edit the name or increment the counter. All interaction uses Gramlot bindings and Source actions.');
      wrapSource(content.getValue()).label('Your name', {for_:'name'});
      content.input({id:'name',value:'^name',type:'text',live:true});
      content.output('^greeting', {id:'greeting'});
      content.button('Increment', {action:'this.SET("count", this.GET("count") + 1);'});
      content.output('^count', {id:'count'});
    }
    return {title: about ? 'About Gramlot Node.js' : 'Gramlot Node.js PoC', source:builder.source.toTytx()};
  }
  return {'/':()=>page(), '/about':()=>page(true)};
}
