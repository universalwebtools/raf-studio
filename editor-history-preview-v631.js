import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
const db=getDatabase(getApp()),$=s=>document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms));
const P={main:'website/public/editorDraft',extras:'website/public/editorExtrasDraft',pro:'website/public/proV6Draft'},KEY='rafHistory631';
let current=null,undo=[],redo=[],busy=false,preview=false,ready=false,timer=null;const live={main:null,extras:null,pro:null};
const cp=x=>structuredClone(x??null),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function load(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'{}');undo=x.undo||[];redo=x.redo||[]}catch{}}
function persist(){undo=undo.slice(-15);redo=redo.slice(-15);try{sessionStorage.setItem(KEY,JSON.stringify({undo,redo}))}catch{}paintButtons()}
function paintButtons(){for(const [id,on] of [['u3',undo.length],['r3',redo.length]]){const b=$('#'+id);if(b){b.disabled=!on;b.style.opacity=on?'1':'.38';b.title=id==='u3'?'Cofnij (Ctrl+Z)':'Ponów (Ctrl+Shift+Z)'}}}
async function read(){const [a,b,c]=await Promise.all([get(ref(db,P.main)),get(ref(db,P.extras)),get(ref(db,P.pro))]);return{main:a.val()??null,extras:b.val()??null,pro:c.val()??null}}
async function write(s){await Promise.all([set(ref(db,P.main),s.main??null),set(ref(db,P.extras),s.extras??null),set(ref(db,P.pro),s.pro??null)])}
function status(x){const e=$('#rafStatus3');if(e)e.textContent=x}
function record(next){if(!ready||busy||preview||!current||same(next,current))return;undo.push(cp(current));redo=[];current=cp(next);persist()}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>record(cp(live)),180)}
async function flush(){try{document.activeElement?.blur?.()}catch{};if(/Zmiany robocze|zapisywanie|zmiany/i.test($('#rafStatus3')?.textContent||''))await wait(2050);else await wait(120);const x=await read();record(x);current=cp(x)}
async function undoNow(){if(busy)return;busy=true;try{status('Cofanie…');await flush();if(!undo.length){status('Brak zmian do cofnięcia');return}const x=undo.pop();redo.push(cp(current));current=cp(x);persist();sessionStorage.setItem('raf631scroll',String(scrollY));await write(x);location.reload()}finally{busy=false}}
async function redoNow(){if(busy)return;busy=true;try{status('Ponawianie…');await flush();if(!redo.length){status('Brak zmian do ponowienia');return}const x=redo.pop();undo.push(cp(current));current=cp(x);persist();sessionStorage.setItem('raf631scroll',String(scrollY));await write(x);location.reload()}finally{busy=false}}
function previewStyle(){if($('#rafPreview631Css'))return;const s=document.createElement('style');s.id='rafPreview631Css';s.textContent='body.raf-preview631 #rafTop3,body.raf-preview631 #rafPanel3,body.raf-preview631 #rafNav3,body.raf-preview631 .rbox3,body.raf-preview631 .guide3,body.raf-preview631 #rafProModal61{display:none!important}body.raf-preview631>.nav{display:block!important}body.raf-preview631 .rsel,body.raf-preview631 .sel55,body.raf-preview631 .pro61-selected,body.raf-preview631 .custom62-selected{outline:none!important}#rafPreviewBack631{position:fixed;right:18px;top:18px;z-index:1000050;border:1px solid #ffffff35;background:#111e;color:#fff;border-radius:999px;padding:11px 16px;font:700 12px system-ui;cursor:pointer}';document.head.appendChild(s)}
function setPreview(on){previewStyle();preview=on;document.body.classList.toggle('raf-preview631',on);let b=$('#rafPreviewBack631');if(on){if(!b){b=document.createElement('button');b.id='rafPreviewBack631';b.textContent='← Wróć do edycji';b.onclick=()=>setPreview(false);document.body.appendChild(b)}b.style.display='block'}else if(b)b.style.display='none'}
load();current=await read();Object.assign(live,cp(current));ready=true;paintButtons();
const y=sessionStorage.getItem('raf631scroll');if(y){sessionStorage.removeItem('raf631scroll');setTimeout(()=>scrollTo(0,+y||0),120)}
onValue(ref(db,P.main),s=>{live.main=s.val()??null;schedule()});onValue(ref(db,P.extras),s=>{live.extras=s.val()??null;schedule()});onValue(ref(db,P.pro),s=>{live.pro=s.val()??null;schedule()});
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||e.key.toLowerCase()!=='z')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();e.shiftKey?redoNow():undoNow()},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('#u3,#r3,#preview3');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(b.id==='u3')undoNow();else if(b.id==='r3')redoNow();else setPreview(true)},true);
window.rafUndo631=undoNow;window.rafRedo631=redoNow;
