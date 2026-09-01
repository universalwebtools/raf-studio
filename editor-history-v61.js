// RAF.studio — unified history + calm guides v6.1
import { getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase,ref,get,set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
const db=getDatabase(getApp()),$=s=>document.querySelector(s);
let forwarding=false,synthetic=false,panelUndo=[],panelRedo=[],lastAction='base',snapshotBusy=false;
function mode(){if(window.rafPro61Active?.())return'pro';if($('.sel55')&&typeof window.rafV54Undo==='function')return'sections';return'base'}
function base(which){const b=$(which==='undo'?'#u3':'#r3');if(!b)return;forwarding=true;try{if(typeof b.onclick==='function')b.onclick.call(b,new MouseEvent('click',{bubbles:false,cancelable:true}));else b.click()}finally{forwarding=false}}
async function restorePanel(stack,target){if(!stack.length)return false;const current=(await get(ref(db,'website/public/editorDraft'))).val()||{};target.push(structuredClone(current));const prev=stack.pop();sessionStorage.setItem('raf61scroll',String(scrollY));await set(ref(db,'website/public/editorDraft'),prev);location.reload();return true}
async function undo(){const m=mode();if(m==='pro'){window.rafPro61Undo?.();return}if(m==='sections'){window.rafV54Undo?.();return}if(lastAction==='panelExternal'&&panelUndo.length){await restorePanel(panelUndo,panelRedo);return}base('undo')}
async function redo(){const m=mode();if(m==='pro'){window.rafPro61Redo?.();return}if(m==='sections'){window.rafV54Redo?.();return}if(lastAction==='panelExternal'&&panelRedo.length){await restorePanel(panelRedo,panelUndo);return}base('redo')}
window.rafUndo61=undo;window.rafRedo61=redo;
addEventListener('load',()=>{const y=sessionStorage.getItem('raf61scroll');if(y){sessionStorage.removeItem('raf61scroll');setTimeout(()=>scrollTo(0,+y||0),80)}});
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||e.key.toLowerCase()!=='z')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();e.shiftKey?redo():undo()},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('#u3,#r3');if(!b||forwarding)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();b.id==='u3'?undo():redo()},true);
// Before editing any legacy panel field, make a real snapshot. Text uses the original editor stack;
// media/sections use a DB snapshot fallback because legacy code never pushed them to undo.
document.addEventListener('focusin',async e=>{if(mode()!=='base'||!e.target.closest?.('#rafPanel3 input,#rafPanel3 textarea,#rafPanel3 select')||snapshotBusy)return;const h=$('.rmove3');if(h){synthetic=true;lastAction='base';try{h.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:98765,clientX:0,clientY:0}))}catch{};return}snapshotBusy=true;try{const s=await get(ref(db,'website/public/editorDraft'));panelUndo.push(structuredClone(s.val()||{}));if(panelUndo.length>30)panelUndo.shift();panelRedo=[];lastAction='panelExternal'}finally{snapshotBusy=false}},true);
document.addEventListener('focusout',e=>{if(!synthetic||!e.target.closest?.('#rafPanel3 input,#rafPanel3 textarea,#rafPanel3 select'))return;try{document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerId:98765,clientX:0,clientY:0}))}catch{}synthetic=false},true);
document.addEventListener('pointerdown',e=>{if(e.pointerId!==98765&&e.target.closest?.('.rmove3,.peDrag')){lastAction='base';document.body.classList.add('raf-dragging61')}},true);
const stop=e=>{if(e?.pointerId===98765)return;document.body.classList.remove('raf-dragging61');document.querySelectorAll('.proGuide60').forEach(x=>x.style.display='none')};
document.addEventListener('pointerup',stop,true);document.addEventListener('pointercancel',stop,true);
