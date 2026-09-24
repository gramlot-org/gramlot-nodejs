import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const [runtime,playwright,executablePath]=process.argv.slice(2);
if(!executablePath)throw Error('Usage: node test/native-browser.mjs RUNTIME PLAYWRIGHT_ENTRY CHROMIUM');
const {chromium}=await import(pathToFileURL(playwright));
const child=spawn(runtime,[fileURLToPath(new URL('./native-browser-host.mjs',import.meta.url))],{stdio:['ignore','pipe','inherit']});
let browser;
try {
 const url=await new Promise((res,rej)=>{const timer=setTimeout(()=>rej(Error('startup timeout')),10000);createInterface({input:child.stdout}).once('line',line=>{clearTimeout(timer);res(line);});child.once('exit',code=>{clearTimeout(timer);rej(Error(`exit ${code}`));});});
 browser=await chromium.launch({headless:true,executablePath});
 const page=await browser.newPage(), errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(url);await page.waitForFunction(()=>window.gramlot?.state==='started');
 assert.equal(await page.locator('h1').textContent(),'Hello World');
 const result=await page.evaluate(async()=>{
  const app=window.gramlot, source=app.source.getItem('main');
  source.getNodes()[0].setValue('Updated');const updated=document.querySelector('h1').textContent;
  const child=app.builder.wrapSource(source).p('Added');const inserted=document.querySelector('p').textContent;
  source.popNode(child.label);const deleted=document.querySelector('p')===null;
  await app.remoteSource(source.getNodes()[1],'details');const remote=document.getElementById('slot').textContent;
  app.dispose();return {updated,inserted,deleted,remote,records:app.renderer.records.size,dom:document.getElementById('gramlot-root').childNodes.length};
 });
 assert.deepEqual(result,{updated:'Updated',inserted:'Added',deleted:true,remote:'Remote HTML',records:0,dom:0});
 await page.waitForFunction(async pageId => (await fetch('/gramlot/main', {
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId})
 })).status===404, await page.evaluate(()=>window.gramlot.pageId));
 await page.goto(url);await page.waitForFunction(()=>window.gramlot?.state==='started');
 const pageId=await page.evaluate(()=>window.gramlot.pageId);
 await page.goto('about:blank');
 let closed=false;
 for(let attempt=0;attempt<40;attempt++){
  const response=await fetch(url+'/gramlot/main',{
   method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId})
  });
  if(response.status===404){closed=true;break;}
  await new Promise(resolve=>setTimeout(resolve,50));
 }
 assert.equal(closed,true,'pagehide beacon closes the server page');
 assert.deepEqual(errors,[]);console.log('PASS installed native host '+runtime);
}finally{await browser?.close();child.kill();await new Promise(r=>child.exitCode!==null?r():child.once('exit',r));}
