import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,update,set,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {getStorage,ref as fileRef,listAll,getMetadata,getDownloadURL,uploadBytesResumable} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js';
const {sanitize,clone,escapeHTML}=await import('./studio-runtime-v910.js?v='+window.RAF_EDITOR_VERSION.asset);
const db=getDatabase(getApp()),storage=getStorage(getApp()),ROOT='website/public',DRAFT=ROOT+'/editorDraft';
let queue=Promise.resolve();
export const uid=prefix=>prefix+'_'+crypto.randomUUID();
export const read=async path=>(await get(ref(db,path))).val()||{};
export const state=()=>read(DRAFT);
export const watch=fn=>onValue(ref(db,DRAFT),s=>fn(s.val()||{}));
export async function change(label,fn){
 const job=queue.catch(()=>{}).then(async()=>{
  const host=window.rafStudio910?.workWindow?.()||window;await host.rafCore900?.flush();host.rafHistory900?.flush();
  const main=await state(),before=clone(main.builder?.studio910||{}),next=clone(before);
  await fn(next,main);host.rafHistory900?.begin(label);
  await set(ref(db,DRAFT+'/builder/studio910'),next);host.rafHistory900?.commit(label);host.rafHistory900?.flush();return next;
 });queue=job;return job;
}
export async function saveContainer(elements,core,mode='stack',label='Kontener'){
 if(elements.length<2)throw new Error('Zaznacz co najmniej dwa elementy.');
 if(elements.some(el=>el.parentElement!==elements[0].parentElement))throw new Error('Kontener można utworzyć z elementów tego samego rodzica. Wybierz je w drzewie warstw.');
 const id=uid('container'),rects=elements.map(el=>el.getBoundingClientRect()),left=Math.min(...rects.map(r=>r.left)),top=Math.min(...rects.map(r=>r.top)),bottom=Math.max(...rects.map(r=>r.bottom));
 const positions=Object.fromEntries(elements.map((el,i)=>[core.id(el),{x:rects[i].left-left,y:rects[i].top-top,width:el.offsetWidth}]));
 await change('Utwórz kontener',s=>{s.containers||=[];s.containers.push({id,items:elements.map(core.id),mode,label,direction:'column',gap:16,padding:0,columns:2,freeHeight:bottom-top,positions})});return id;
}
export async function releaseContainer(id){await change('Rozpakuj kontener',s=>{s.containers=(s.containers||[]).filter(c=>c.id!==id)})}
const captureProperties=['display','position','width','height','max-width','min-height','padding','margin','gap','grid-template-columns','flex-direction','align-items','justify-content','font-family','font-size','font-weight','font-style','line-height','letter-spacing','color','background-color','border','border-radius','object-fit','object-position','text-align'];
export function captureSection(el,core){
 const root=sanitize(el.cloneNode(true)),original=[el,...el.querySelectorAll('*')],copies=[root,...root.querySelectorAll('*')],layout=core.layoutState(),overrides={};
 for(let i=0;i<copies.length;i++){
  const source=original[i],node=copies[i];if(!source)continue;const cs=source.ownerDocument.defaultView.getComputedStyle(source);node.dataset.rafTemplateNode=String(i);
  for(const p of captureProperties){const value=cs.getPropertyValue(p);if(value)node.style.setProperty(p,value)}
  if(cs.position==='fixed'||cs.position==='sticky')node.style.position='relative';
  const id=core.id(source);for(const d of ['desktop','tablet','mobile'])if(layout[d]?.[id]){overrides[d]||={};overrides[d][i]=clone(layout[d][id])}
  for(const a of ['src','poster'])if(source.getAttribute(a))node.setAttribute(a,new URL(source.getAttribute(a),location.href).href);
 }
 root.style.width='100%';root.style.maxWidth='100%';root.style.margin='0';
 return{html:root.outerHTML,overrides,revision:Date.now()};
}
export async function saveSection(el,core,name){const id=uid('template'),value={...captureSection(el,core),name:name.trim()||'Moja sekcja',createdAt:Date.now()};await change('Zapisz własną sekcję',s=>{s.library||={};s.library[id]=value});return id}
export async function insertSection(templateId,{linked=false,afterId=''}={}){const id=uid('section');await change('Wstaw własną sekcję',s=>{const tpl=s.library?.[templateId];if(!tpl)throw new Error('Nie znaleziono sekcji.');s.sections||=[];s.sections.push({id,templateId,linked,afterId,snapshot:linked?null:clone(tpl)})});return id}
export async function updateSection(templateId,el,core){const value=captureSection(el,core);await change('Aktualizuj wspólną sekcję',s=>{if(!s.library?.[templateId])throw new Error('Nie znaleziono wzorca.');s.library[templateId]={...s.library[templateId],...value}})}
export function documentSnapshot(doc=document){
 const roots=[...doc.body.children].filter(el=>!el.matches('script,style,[data-studio-ui],iframe#studioFrame910')&&!/^(rafTop|rafPanel|rafModal|v72|v760|rafDock|rafPreview|tpl752|pages860|widgetsModal|rafProModal|rafHeaderEdit|rafStudio)/.test(el.id)&&!el.matches('.authGate,.authUserBar'));
 const content=roots.map(el=>{const copy=sanitize(el.cloneNode(true));copy.removeAttribute('data-studio-canvas-hidden');copy.querySelectorAll('[data-studio-ui]').forEach(x=>x.remove());return copy.outerHTML}).join('');
 const styles=[...doc.querySelectorAll('link[rel="stylesheet"],style')].filter(s=>!/studio|shell|core760|editor/i.test(s.id)).map(s=>s.outerHTML).join('');
 return '<!doctype html><html lang="pl"><head><base href="'+escapeHTML(location.origin+'/')+'"><meta name="viewport" content="width=device-width,initial-scale=1">'+styles+'<style>body{margin:0!important;padding:0!important;visibility:visible!important;opacity:1!important;min-width:0!important}html{overflow:auto!important}.v72sel{outline:none!important}iframe{pointer-events:none}</style></head><body>'+content+'</body></html>';
}
export async function files(){
 const refs=[];async function walk(path){const r=await listAll(fileRef(storage,path));refs.push(...r.items);for(const p of r.prefixes)await walk(p.fullPath)}await walk('website/media');
 const rows=[];for(let i=0;i<refs.length;i+=6)await Promise.all(refs.slice(i,i+6).map(async r=>{try{const [meta,url]=await Promise.all([getMetadata(r),getDownloadURL(r)]);rows.push({id:btoa(unescape(encodeURIComponent(r.fullPath))).replace(/[^\w-]/g,'_'),path:r.fullPath,name:r.name||r.fullPath.split('/').pop(),url,size:meta.size||0,type:meta.contentType||'',folder:''})}catch(e){rows.push({id:r.fullPath,name:r.name,error:e.message})}}));
 const saved=(await state()).builder?.studio910?.media||{};return rows.map(x=>({...x,...Object.values(saved).find(v=>v.path===x.path)}));
}
export async function upload(file,folder,onProgress){
 if(!file||!/^image\/|^video\//.test(file.type))throw new Error('Wybierz zdjęcie lub film.');
 if(file.size>250*1024*1024)throw new Error('Maksymalny rozmiar pliku to 250 MB.');
 const name=file.name.replace(/[^\p{L}\p{N}._-]/gu,'_'),path='website/media/'+uid('studio')+'_'+name;
 const task=uploadBytesResumable(fileRef(storage,path),file,{contentType:file.type});
 await new Promise((resolve,reject)=>task.on('state_changed',snap=>onProgress?.(Math.round(snap.bytesTransferred/snap.totalBytes*100)),reject,resolve));
 const url=await getDownloadURL(task.snapshot.ref),id=uid('media'),value={id,path,name:file.name,url,size:file.size,type:file.type,folder:folder||'',createdAt:Date.now()};
 await change('Dodaj media',s=>{s.media||={};s.media[id]=value});return value;
}
export function usages(url,main,pages={},pro={}){
 const result=new Set();const visit=(value,label)=>{if(typeof value==='string'){if(value===url||value.includes('"'+url+'"'))result.add(label)}else if(value&&typeof value==='object')for(const [k,v] of Object.entries(value)){if(['media','library','versionHistoryV76'].includes(k))continue;visit(v,label)}};
 visit(main,'Strona główna');visit(pro,'HERO / sekcje PRO');for(const [key,page] of Object.entries(pages.items||pages))visit(page,page.name||page.title||key);return [...result];
}
export async function mediaContext(){const [main,pages,pro]=await Promise.all([state(),read(ROOT+'/customPagesDraft'),read(ROOT+'/proV6Draft')]);return{main,pages,pro}}
export function validate(doc=document,main={}){
 const issues=[],visible=el=>{const r=el.getBoundingClientRect(),s=doc.defaultView.getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&!el.closest('[data-studio-ui],#rafTop3,#rafPanel3,#v72box')};
 const add=(el,message,severity='warning')=>issues.push({id:el.dataset.rafV72Id||el.closest('[data-raf-v72-id]')?.dataset.rafV72Id||'',message,severity,el});
 for(const el of doc.querySelectorAll('a'))if(visible(el)){
  const href=el.getAttribute('href')||'';if(!href||href==='#')add(el,'Przycisk lub link nie ma celu: '+el.textContent.trim().slice(0,45));
  else if(/^javascript:/i.test(href))add(el,'Niedozwolony adres linku.','error');
  else if(href.startsWith('#')&&!doc.getElementById(href.slice(1)))add(el,'Brak sekcji docelowej '+href);
 }
 for(const el of doc.querySelectorAll('img'))if(visible(el)){
  if(!el.getAttribute('src'))add(el,'Zdjęcie bez pliku.','error');else if(el.complete&&!el.naturalWidth)add(el,'Zdjęcie nie zostało wczytane.');
  if(!el.hasAttribute('alt'))add(el,'Brak opisu alternatywnego zdjęcia.');
 }
 const width=doc.documentElement.clientWidth;
 for(const el of doc.querySelectorAll('[data-raf-v72-id]'))if(visible(el)&&!el.querySelector('[data-raf-v72-id]')){const r=el.getBoundingClientRect();if(r.left< -2||r.right>width+2)add(el,'Element wychodzi poza szerokość '+width+' px.');}
 for(const form of doc.querySelectorAll('form'))if(visible(form)&&!form.action?.replace(doc.URL,'')&&!main.site?.email&&!form.dataset.email)add(form,'Formularz nie ma ustawionego odbiorcy.','error');
 return issues;
}
export async function publishedContext(){return read(ROOT)}
export const flush=()=>queue;
