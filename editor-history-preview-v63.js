// RAF.studio — unified history + preview v6.3
import { getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const db=getDatabase(getApp());
const $=(s,r=document)=>r.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const PATHS={main:'website/public/editorDraft',extras:'website/public/editorExtrasDraft',pro:'website/public/proV6Draft'};
const KEY='rafHistory63';
let current=null,undo=[],redo=[],busy=false,preview=false;

function clone(x){return structuredClone(x??null)}
function eq(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch{return false}}
function saveSession(){try{sessionStorage.setItem(KEY,JSON.stringify({undo:undo.slice(-20),redo:redo.slice(-20)}))}catch{undo=undo.slice(-8);redo=redo.slice(-8);try{sessionStorage.setItem(KEY,JSON.stringify({undo,redo}))}catch{}}buttons()}
function loadSession(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'{}');undo=Array.isArray(x.undo)?x.undo:[];redo=Array.isArray(x.redo)?x.redo:[]}catch{undo=[];redo=[]}}
function buttons(){for(const [id,on] of [['u3',undo.length>0],['r3',redo.length>0]]){const b=$('#'+id);if(!b)continue;b.disabled=!on;b.style.opacity=on?'1':'.38';b.title=id==='u3'?'Cofnij (Ctrl+Z)':'Ponów (Ctrl+Shift+Z)'}}
async function readAll(){const [a,b,c]=await Promise.all([get(ref(db,PATHS.main)),get(ref(db,PATHS.extras)),get(ref(db,PATHS.pro))]);return{main:a.val()??null,extras:b.val()??null,pro:c.val()??null}}
async function writeAll(s){await Promise.all([set(ref(db,PATHS.main),s?.main??null),set(ref(db,PATHS.extras),s?.extras??null),set(ref(db,PATHS.pro),s?.pro??null)])}
function status(t){const e=$('#rafStatus3');if(e)e.textContent=t}
async function syncCurrentAfterPending(){try{document.activeElement?.blur?.()}catch{};const st=$('#rafStatus3')?.textContent||'';if(/Zmiany robocze|zapisywanie|zmiany/i.test(st))await sleep(2050);else await sleep(120);const fresh=await readAll();if(current&&!eq(fresh,current)){undo.push(clone(current));if(undo.length>20)undo.shift();redo=[];current=clone(fresh);saveSession()}else if(!current)current=clone(fresh)}
async function doUndo(){if(busy)return;busy=true;try{status('Cofanie…');await syncCurrentAfterPending();if(!undo.length){status('Brak zmian do cofnięcia');return}const prev=undo.pop();redo.push(clone(current));current=clone(prev);saveSession();sessionStorage.setItem('raf63scroll',String(scrollY));await writeAll(prev);location.reload()}finally{busy=false}}
async function doRedo(){if(busy)return;busy=true;try{status('Ponawianie…');await syncCurrentAfterPending();if(!redo.length){status('Brak zmian do ponowienia');return}const next=redo.pop();undo.push(clone(current));current=clone(next);saveSession();sessionStorage.setItem('raf63scroll',String(scrollY));await writeAll(next);location.reload()}finally{busy=false}}

function previewCss(){if($('#rafPreview63Css'))return;const s=document.createElement('style');s.id='rafPreview63Css';s.textContent=`body.raf-preview63 #rafTop3,body.raf-preview63 #rafPanel3,body.raf-preview63 #rafNav3,body.raf-preview63 .rbox3,body.raf-preview63 .guide3,body.raf-preview63 .proGuide60,body.raf-preview63 #rafProModal61{display:none!important}body.raf-preview63>.nav{display:block!important}body.raf-preview63 .rsel,body.raf-preview63 .sel55,body.raf-preview63 .pro61-selected,body.raf-preview63 .custom62-selected{outline:none!important}#rafPreviewBack63{position:fixed;right:18px;top:18px;z-index:1000050;border:1px solid #ffffff35;background:#111e;color:#fff;border-radius:999px;padding:11px 16px;font:700 12px system-ui;box-shadow:0 10px 40px #0008;backdrop-filter:blur(16px);cursor:pointer}`;document.head.appendChild(s)}
function setPreview(on){previewCss();preview=on;document.body.classList.toggle('raf-preview63',on);let b=$('#rafPreviewBack63');if(on){if(!b){b=document.createElement('button');b.id='rafPreviewBack63';b.textContent='← Wróć do edycji';b.onclick=()=>setPreview(false);document.body.appendChild(b)}b.style.display='block';scrollTo({top:Math.max(0,scrollY),behavior:'instant'})}else if(b)b.style.display='none'}

loadSession();
current=await readAll();
buttons();
const y=sessionStorage.getItem('raf63scroll');if(y){sessionStorage.removeItem('raf63scroll');setTimeout(()=>scrollTo(0,+y||0),120)}

// Capture every editor command here, before older handlers can swallow it.
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||e.key.toLowerCase()!=='z')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();e.shiftKey?doRedo():doUndo()},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('#u3,#r3,#preview3');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(b.id==='u3')doUndo();else if(b.id==='r3')doRedo();else setPreview(true)},true);

// Record committed Firebase draft states regardless of which editor module produced them.
let pollBusy=false,lastSeen=JSON.stringify(current);
setInterval(async()=>{if(pollBusy||busy||preview)return;pollBusy=true;try{const next=await readAll(),ser=JSON.stringify(next);if(ser!==lastSeen){if(current&&!eq(next,current)){undo.push(clone(current));if(undo.length>20)undo.shift();redo=[];current=clone(next);saveSession()}lastSeen=ser}}catch{}finally{pollBusy=false}},650);

window.rafUndo63=doUndo;window.rafRedo63=doRedo;
