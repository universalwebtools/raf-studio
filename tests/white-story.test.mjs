// Run: node --experimental-vm-modules tests/white-story.test.mjs
// No network and no access to the real Firebase database.
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {TEMPLATES752,TEMPLATE_IDS752,buildTemplate,TEMPLATE_BUILD} from '../template-collection-v893.js';
import {contactMailto} from '../template-white-story-v893.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id='rojczyk-white',d=buildTemplate(id);
assert.equal(TEMPLATE_IDS752.length,9);
assert.equal(TEMPLATE_IDS752[0],id);
assert.equal(TEMPLATE_BUILD,'893-white-1');
for(const templateId of TEMPLATE_IDS752){
 const x=buildTemplate(templateId);
 assert.equal(x.builder.sectionOrder.length,TEMPLATES752[templateId].sections.length,templateId);
 assert.equal((x.html.match(/<section\b/g)||[]).length,TEMPLATES752[templateId].sections.length,templateId);
 assert.equal(x.builder.templateV752.id,templateId);
}
assert.equal(d.pro.global.bg,'#ffffff');
assert.equal(d.pro.siteHeader.enabled,false);
assert.equal((d.html.match(/class="rw-gallery-item"/g)||[]).length,6);
const ids=[...d.html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'unique DOM ids');
for(const m of d.html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(m[1]),'anchor: '+m[1]);
for(const attr of ['data-home-text','data-home-media','data-raf-element','data-raf-section']){
 const keys=[...d.html.matchAll(new RegExp(attr+'="([^"]+)"','g'))].map(m=>m[1]);
 assert.equal(keys.length,new Set(keys).size,'unique editor keys: '+attr);
}
for(const m of d.html.matchAll(/data-home-text="([^"]+)"/g))assert.equal(typeof d.homeContent[m[1]],'string');
for(const m of d.html.matchAll(/src="(\/assets\/[^"]+)"/g))await access(path.join(root,m[1]));
assert.ok(!d.html.includes('maciejrojczyk.pl'),'no copied assets, links, or contact identity');
assert.ok(!d.html.includes('602 192 932'));
assert.ok(d.html.includes('Miejsce na autentyczne opinie'));
const email=contactMailto('mailto:owner@example.com',{name:'Ala & Jan',email:'reply@example.com',date:'2027-06-05',service:'Film',message:'Cześć!\nŚlub w górach.'});
assert.ok(email.startsWith('mailto:owner@example.com?'));
const params=new URLSearchParams(email.split('?')[1]);
assert.equal(params.get('subject'),'Zapytanie — Film');
assert.ok(params.get('body').includes('Ala & Jan'));
assert.ok(params.get('body').includes('Ślub w górach.'));
assert.throws(()=>contactMailto('not-an-email',{}));

let database={},writes=[],failPath='',failBackup=false;
const storage=new Map();
const getValue=p=>p.split('/').reduce((v,k)=>v?.[k],database);
const setValue=(p,v)=>{const bits=p.split('/'),key=bits.pop();let target=database;for(const k of bits)target=target[k]??={};target[key]=structuredClone(v)};
const snapshot=v=>({val:()=>structuredClone(v??null),exists:()=>v!=null});
const sdk={getDatabase:()=>({}),ref:(_,p)=>p,get:async p=>snapshot(getValue(p)),set:async(p,v)=>{if(p===failPath||(failBackup&&p.endsWith('/templateBackupLatest')))throw new Error('PERMISSION_DENIED_TEST');writes.push(p);setValue(p,v)}};
const context=vm.createContext({console:{log(){},warn(){},error(){}},URLSearchParams,structuredClone,Date,Promise,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},document:{querySelector:()=>null,querySelectorAll:()=>[]},sessionStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k),removeItem:k=>storage.delete(k)}});
const cache=new Map();
async function loadModule(name){
 if(cache.has(name))return cache.get(name);
 let module;
 if(name.startsWith('https:')){
  const exports=name.includes('firebase-app')?{getApp:()=>({})}:sdk;
  module=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v]of Object.entries(exports))this.setExport(k,v)},{context,identifier:name});
 }else module=new vm.SourceTextModule(await readFile(name,'utf8'),{context,identifier:name});
 cache.set(name,module);
 await module.link((specifier,parent)=>loadModule(specifier.startsWith('https:')?specifier:path.resolve(path.dirname(parent.identifier),specifier.split('?')[0])));
 return module;
}
const module=await loadModule(path.join(root,'editor-templates-v752.js'));await module.evaluate();
const applyTemplate=module.namespace.applyTemplate;
const initial=()=>{database={website:{public:{publishedAt:424242,site:{heroT:'PUBLIC PAGE'},builder:{templateV752:{id:'cam-studio'}},editorDraft:{site:{heroT:'MY DRAFT',email:'owner@example.com'},homeContent:{custom:'Preserve me'},homeMedia:{heroMedia:{url:'/assets/photo-session.png'}},photos:[{id:'existing'}],builder:{templateV752:{id:'cam-studio'},basePublishedAt:10}},editorExtrasDraft:{reviews:[{text:'Existing review'}]},proV6Draft:{global:{bg:'#000'}},customPagesDraft:{privatePage:{title:'Do not touch'}}}}};writes=[];storage.clear();failPath='';failBackup=false};
initial();await applyTemplate(id);
assert.equal(getValue('website/public/editorDraft/builder/templateV752/id'),id);
assert.equal(getValue('website/public/editorDraft/builder/basePublishedAt'),424242);
assert.equal(getValue('website/public/editorDraft/builder/recoveredV64'),'2');
assert.equal(getValue('website/public/editorDraft/site/email'),'owner@example.com');
assert.equal(getValue('website/public/proV6Draft/global/bg'),'#ffffff');
assert.equal(getValue('website/public/site/heroT'),'PUBLIC PAGE');
assert.equal(getValue('website/public/builder/templateV752/id'),'cam-studio');
assert.equal(getValue('website/public/customPagesDraft/privatePage/title'),'Do not touch');
assert.ok(writes.every(p=>/^website\/public\/(editorDraft|editorExtrasDraft|proV6Draft|templateBackupLatest)$/.test(p)));
assert.ok(writes.indexOf('website/public/editorDraft')<writes.indexOf('website/public/proV6Draft'));
assert.equal(getValue('website/public/templateBackupLatest/editorDraft/site/heroT'),'MY DRAFT');
initial();await applyTemplate(id,{keepContent:true});
assert.equal(getValue('website/public/editorDraft/site/heroT'),'MY DRAFT');
assert.equal(getValue('website/public/editorDraft/homeContent/custom'),'Preserve me');
assert.equal(getValue('website/public/editorDraft/homeMedia/heroMedia/url'),'/assets/photo-session.png');
assert.equal(getValue('website/public/editorDraft/photos/0/id'),'existing');
initial();failBackup=true;await applyTemplate(id);
assert.equal(getValue('website/public/editorDraft/builder/templateV752/id'),id);
assert.ok(storage.has('rafTemplateBackupLatest'));
initial();failPath='website/public/editorDraft';await assert.rejects(()=>applyTemplate(id),/PERMISSION_DENIED_TEST/);
assert.equal(getValue('website/public/editorDraft/builder/templateV752/id'),'cam-studio');
assert.ok(!writes.includes('website/public/proV6Draft'));
initial();failPath='website/public/proV6Draft';await applyTemplate(id);
assert.equal(getValue('website/public/editorDraft/builder/templateV752/id'),id);
await assert.rejects(()=>applyTemplate('does-not-exist'));
const admin=await readFile(path.join(root,'admin.html'),'utf8');
assert.ok(!/editor90|by ChatGPT/.test(admin));
for(const file of ['README.md','auth.js','editor.css','editor.js','index.html'])await assert.rejects(()=>access(path.join(root,'editor90',file)));
assert.ok(admin.includes('edytorstrony.html'));
assert.ok(admin.includes('modern=1'));
console.log('PASS: 9 templates; White Story structure/media/links; contact encoding; full apply; keep-content; backup failure; draft failure; companion failure; publication and custom pages preserved; prototype removed.');
