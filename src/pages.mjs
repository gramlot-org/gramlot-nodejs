import {theme} from './theme.mjs';

// Every demo shares the same navigation, source viewer and visual language.
export function createPages({HtmlBuilder, wrapSource}, sourceCode = '') {
  function page(about = false) {
    const builder = new HtmlBuilder('main');
    const root = wrapSource(builder.source);
    root.styleSheet({cssText:theme});
    root.dataSetter({destination:'sourceCode', value:sourceCode});
    root.dataSetter({destination:'sourceHidden', value:true});
    const shell = root.div({class:'shell'});
    const header = shell.header({class:'topbar'});
    header.a('gramlot', {href:'/',class:'brand'});
    const nav = header.nav({class:'nav'});
    nav.a('Playground', {href:'/'});
    nav.a('How it works', {href:'/about'});
    nav.button('Show source', {class:'btn',id:'show-source',action:'this.SET("sourceHidden", false);'});
    const main = shell.main();
    const hero = main.section({class:'hero'});
    hero.span('THE NODE.JS EXPERIMENT', {class:'eyebrow'});
    hero.h1(about ? 'One language.\nA shared way to build.' : 'Small interactions.\nReal possibilities.');
    hero.p(about ? 'A small server, a declarative page, and a browser that brings it to life.' : 'Give it a name. Give it a click. Watch your interface respond, naturally.');
    hero.span('BUILT WITH GRAMLOT', {class:'badge'});
    if (about) {
      const flow = main.div({class:'flow'});
      for (const [step,title,description] of [
        ['01 / DECLARE','Describe the page','Node.js builds a fresh Gramlot Source for each request. Structure, bindings and actions travel together.'],
        ['02 / DELIVER','Keep the server small','Native HTTP delivers the page and shared runtime. No Express, Python process or database is required.'],
        ['03 / INTERACT','Let the browser respond','Data Bags and bindings connect each interaction to the interface. The same Gramlot runtime does the work.'],
      ]) {
        const card = flow.section({class:'card'});
        card.span(step,{class:'step'}); card.h2(title); card.p(description);
      }
      main.p('This is a local experiment. Values belong to the current page and reset when you reload.',{class:'note'});
    } else {
      root.dataSetter({destination:'name',value:'World'});
      root.dataSetter({destination:'count',value:0});
      root.dataFormula({destination:'greeting',formula:'"Hello, " + name + "!"',name:'^name',_on_start:true});
      const playground = main.div({class:'playground'});
      const welcome = playground.section({class:'card'});
      welcome.span('01 / MAKE IT PERSONAL',{class:'step'});
      welcome.h2('A little introduction.');
      welcome.p('Your words, reflected in real time.',{class:'muted'});
      wrapSource(welcome.getValue()).label('What should we call you?',{for_:'name',class:'field-label'});
      welcome.input({id:'name',class:'text-input',value:'^name',type:'text',live:true});
      welcome.output('^greeting',{id:'greeting',class:'greeting','aria-live':'polite'});
      const counter = playground.section({class:'card counter-card'});
      counter.span('02 / START SOMETHING',{class:'step'});
      counter.h2('Every click counts.');
      counter.p('Small steps can add up to something good.',{class:'muted'});
      counter.output('^count',{id:'count',class:'counter','aria-live':'polite'});
      counter.button('Increment ↗',{id:'increment',class:'btn',action:'this.SET("count", this.GET("count") + 1);'});
    }
    const footer = shell.footer({class:'footer'});
    footer.span('Live in your browser');
    footer.span('Gramlot × Node.js · A local playground');
    const source = root.section({class:'source-panel',hidden:'^sourceHidden',role:'region','aria-label':'Page source'});
    const bar = source.header({class:'source-header'});
    bar.h2('Page source · pages.mjs');
    bar.button('Close source ×',{id:'close-source',class:'btn',action:'this.SET("sourceHidden", true);'});
    source.p('The actual JavaScript module that declares both demo pages. Shared styling lives in theme.mjs.',{class:'source-caption'});
    source.pre('^sourceCode');
    return {title:about ? 'How it works · Gramlot' : 'Playground · Gramlot',source:builder.source.toTytx()};
  }
  return {'/':()=>page(),'/about':()=>page(true)};
}
