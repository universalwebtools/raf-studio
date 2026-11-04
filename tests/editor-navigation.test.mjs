import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {editorDestination} from '../editor-interactions-v893.js';

const current='https://raf-studio.pl/?editor=direct&ev=8.9.3&device=mobile&embedded=1';
for(const href of ['/film/','/fotografia/','/film.html','/index.html#kontakt']){
  const url=new URL(editorDestination(href,current));
  assert.equal(url.searchParams.get('editor'),'direct');
  assert.equal(url.searchParams.get('ev'),'8.9.3');
  assert.equal(url.searchParams.get('device'),'mobile');
  assert.equal(url.searchParams.get('embedded'),'1');
  assert.equal(url.pathname,new URL(href,current).pathname);
  assert.equal(url.hash,new URL(href,current).hash);
}
for(const href of ['https://galeria.raf-studio.pl/','https://example.com/film/','mailto:hello@example.com','tel:123','/ankieta']){
  assert.equal(editorDestination(href,current),null,'No editor parameters on external or custom destinations');
}

// The same click must wait for queued draft writes, and remain on the canvas
// after a failed save. Run the real router against a minimal browser boundary.
const source=await readFile(new URL('../editor-interactions-v893.js',import.meta.url),'utf8');
async function harness(){
  let listener;const visits=[],status={textContent:''};
  const context=vm.createContext({URL,console:{error(){}},document:{
    addEventListener(type,fn){if(type==='click')listener=fn},
    activeElement:{blur(){}},querySelector(){return status}
  },location:{href:current,assign(url){visits.push(url)}}});
  const mod=new vm.SourceTextModule(source,{context});await mod.link(()=>{});await mod.evaluate();
  mod.namespace.installEditorNavigation();
  const link={href:'https://raf-studio.pl/film/',target:'',matches:()=>true,hasAttribute:()=>false,getAttribute:()=>'/film/'};
  const target={closest:selector=>selector.startsWith('a[href]')?link:null};
  const click=()=>listener({target,button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true}});
  return{api:mod.namespace,click,visits,status};
}
const queued=await harness();let finish;
queued.api.registerNavigationSave(()=>new Promise(resolve=>{finish=resolve}));
const navigation=queued.click();assert.equal(queued.visits.length,0);
finish();await navigation;assert.equal(queued.visits.length,1);
assert.equal(new URL(queued.visits[0]).searchParams.get('embedded'),'1');
const failed=await harness();let broken=true;
failed.api.registerNavigationSave(async()=>{if(broken)throw Error('offline')});
await failed.click();assert.equal(failed.visits.length,0);assert.match(failed.status.textContent,/Nie udało się zapisać/);
broken=false;await failed.click();assert.equal(failed.visits.length,1,'Click can retry a failed save');
console.log('PASS: editor destinations, embedded phone state, external links, draft-save barrier and retry');
