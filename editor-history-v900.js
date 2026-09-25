// RAF.studio 9.0 — ONE history for the whole editor
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';

const db=getDatabase(getApp()),$=(s,r=document)=>r.querySelector(s);
const P={main:'website/public/editorDraft',extras:'website/public/editorExtrasDraft',pro:'website/public/proV6Draft',pages:'website/public/customPagesDraft'};
const KEY='rafHistory900';
const cp=x=>structuredClone(x??null);
const canonical=v=>{
 if(v===undefined||v===null)return null;
 if(typeof v==='number'||typeof v==='string'||typeof v==='boolean')return v;
 if(Array.isArray(v))return v.map(canonical);
 if(typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=canonical(v[k]);return o}
 return null
};
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
let live={main:null,extras:null,pro:null,pages:null},current=null,undo=[],redo=[],ready=false,busy=false,passiveTimer=0,txn=null,txnTimer=0,preview=false,queue=Promise.resolve();

function status(t){const e=$('#rafStatus3');if(e)e.textContent=t}
function loadLocal(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'{}');undo=Array.isArray(x.undo)?x.undo:[];redo=Array.isArray(x.redo)?x.redo:[]}catch{undo=[];redo=[]}}
function persist(){undo=undo.slice(-80);redo=redo.slice(-80);try{sessionStorage.setItem(KEY,JSON.stringify({undo,redo}))}catch{}paint()}
function paint(){for(const [id,on] of [['u3',undo.length>0],['r3',redo.length>0]]){const b=$('#'+id);if(b){b.disabled=!on;b.style.opacity=on?'1':'.38'}}}
async function readRaw(){const [a,b,c,d]=await Promise.all(Object.values(P).map(path=>get(ref(db,path))));return{main:a.val()??null,extras:b.val()??null,pro:c.val()??null,pages:d.val()??null}}
function push(before,after,label='Zmiana'){
 if(same(before,after))return false;
 undo.push({state:cp(before),label,at:Date.now()});redo=[];current=cp(after);persist();return true
}
function finalizeNow(){
 clearTimeout(txnTimer);txnTimer=0;if(!ready||busy)return false;
 const after=cp(live);
 if(txn){const t=txn;txn=null;return push(t.before,after,t.label)}
 if(!same(current,after))return push(current,after,'Zmiana');
 return false
}
function begin(label='Zmiana'){
 if(!ready||busy)return;
 if(txn){if(txn.label===label){txn.last=Date.now();return}finalizeNow()}
 txn={before:cp(current),label,at:Date.now(),last:Date.now()};
}
function commit(label){
 if(!ready||busy)return;
 if(!txn)begin(label||'Zmiana');
 if(label&&txn)txn.label=label;
 clearTimeout(txnTimer);txnTimer=setTimeout(finalizeNow,480);
}
function schedulePassive(){
 if(!ready||busy)return;
 if(txn){commit(txn.label);return}
 clearTimeout(passiveTimer);passiveTimer=setTimeout(()=>finalizeNow(),650);
}
async function writeState(state){
 busy=true;clearTimeout(passiveTimer);clearTimeout(txnTimer);txn=null;
 try{
  await Promise.all([
   set(ref(db,P.main),state?.main??null),set(ref(db,P.extras),state?.extras??null),
   set(ref(db,P.pro),state?.pro??null),set(ref(db,P.pages),state?.pages??null)
  ]);
  live=cp(state);current=cp(state);
  window.dispatchEvent(new CustomEvent('raf:history-main',{detail:state?.main||{}}));
  window.dispatchEvent(new CustomEvent('raf:history-extras',{detail:state?.extras||{}}));
  window.dispatchEvent(new CustomEvent('raf:history-pro',{detail:state?.pro||{}}));
  window.dispatchEvent(new CustomEvent('raf:history-pages',{detail:state?.pages||{}}));
  window.rafRenderer900?.apply?.(state?.main||{});
  window.rafCore900?.applyState?.(state?.main||{});
 }finally{busy=false;paint()}
}
async function undoNow(){
 finalizeNow();if(!undo.length)return false;status('Cofanie…');
 const item=undo.pop(),before=cp(current);redo.push({state:before,label:item.label,at:Date.now()});persist();
 await writeState(item.state);status('✓ Cofnięto: '+(item.label||'zmianę'));return true
}
async function redoNow(){
 finalizeNow();if(!redo.length)return false;status('Ponawianie…');
 const item=redo.pop(),before=cp(current);undo.push({state:before,label:item.label,at:Date.now()});persist();
 await writeState(item.state);status('✓ Ponowiono: '+(item.label||'zmianę'));return true
}
function queued(kind){queue=queue.then(()=>kind==='redo'?redoNow():undoNow()).catch(e=>{console.error('RAF history 9',e);status('⚠ Historia: '+e.message);return false});return queue}
function previewStyle(){if($('#rafPreview900Css'))return;const s=document.createElement('style');s.id='rafPreview900Css';s.textContent='body.raf-preview64 #rafTop3,body.raf-preview64 #rafPanel3,body.raf-preview64 #v72box,body.raf-preview64 #v760layers,body.raf-preview64 #rafDockLauncher889,body.raf-preview64 #rafHeaderEdit900{display:none!important}#rafPreview900Back{position:fixed;right:18px;top:18px;z-index:1000060;border:1px solid #ffffff35;background:#111e;color:#fff;border-radius:999px;padding:11px 16px;font:700 12px system-ui;cursor:pointer}';document.head.appendChild(s)}
function setPreview(on){previewStyle();preview=!!on;document.body.classList.toggle('raf-preview64',preview);let b=$('#rafPreview900Back');if(preview){if(!b){b=document.createElement('button');b.id='rafPreview900Back';b.textContent='← Wróć do edycji';b.onclick=()=>setPreview(false);document.body.appendChild(b)}b.style.display='block'}else if(b)b.style.display='none'}
function sourceLabel(target){
 if(target?.closest?.('#rafProModal61'))return'PRO';
 if(target?.closest?.('#widgetsModal770,.wePanel'))return'Widżet';
 if(target?.closest?.('#pages860'))return'Podstrona';
 if(target?.closest?.('#rafHeaderPanel900'))return'Header';
 if(target?.closest?.('#rafPanel3'))return'Właściwości elementu';
 if(target?.closest?.('#tpl752'))return'Szablon';
 return'Zmiana';
}
function noteExternal(target){
 if(!target||target.closest?.('#u3,#r3,#preview3,#v760common,#v72panel'))return;
 const owner=target.closest?.('#rafPanel3,#rafProModal61,#widgetsModal770,#pages860,#tpl752,#rafModal3');
 if(!owner)return;const label=sourceLabel(target);begin(label);clearTimeout(txnTimer);txnTimer=setTimeout(finalizeNow,target.matches?.('input[type="text"],input[type="number"],textarea')?1100:650);
}

loadLocal();
const first=await readRaw();live=cp(first);current=cp(first);ready=true;paint();
for(const [key,path] of Object.entries(P))onValue(ref(db,path),s=>{live[key]=s.val()??null;schedulePassive()});
window.addEventListener('keydown',e=>{
 if(!(e.ctrlKey||e.metaKey)||e.altKey)return;const k=String(e.key||'').toLowerCase();
 if(k!=='z'&&k!=='y')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const active=document.activeElement;if(active?.isContentEditable)active.blur();
 queued(k==='y'||(k==='z'&&e.shiftKey)?'redo':'undo')
},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('#u3,#r3,#preview3');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(b.id==='u3')queued('undo');else if(b.id==='r3')queued('redo');else setPreview(true)},true);
document.addEventListener('input',e=>noteExternal(e.target),true);document.addEventListener('change',e=>noteExternal(e.target),true);
window.rafHistory900={begin,commit,flush:finalizeNow,undo:()=>queued('undo'),redo:()=>queued('redo'),canUndo:()=>undo.length>0,canRedo:()=>redo.length>0,current:()=>cp(current),preview:setPreview};
window.rafUndo72=()=>queued('undo');window.rafRedo72=()=>queued('redo');window.rafPreview72=setPreview;
window.dispatchEvent(new CustomEvent('raf:history900-ready'));
