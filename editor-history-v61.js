// RAF.studio — unified history + calm guides v6.1
const $=s=>document.querySelector(s);
let forwarding=false,synthetic=false;
function mode(){if(window.rafPro61Active?.())return'pro';if($('.sel55')&&typeof window.rafV54Undo==='function')return'sections';return'base'}
function base(which){const b=$(which==='undo'?'#u3':'#r3');if(!b)return;forwarding=true;try{if(typeof b.onclick==='function')b.onclick.call(b,new MouseEvent('click',{bubbles:false,cancelable:true}));else b.click()}finally{forwarding=false}}
function undo(){const m=mode();if(m==='pro')window.rafPro61Undo?.();else if(m==='sections')window.rafV54Undo?.();else base('undo')}
function redo(){const m=mode();if(m==='pro')window.rafPro61Redo?.();else if(m==='sections')window.rafV54Redo?.();else base('redo')}
window.rafUndo61=undo;window.rafRedo61=redo;
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||e.key.toLowerCase()!=='z')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();e.shiftKey?redo():undo()},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('#u3,#r3');if(!b||forwarding)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();b.id==='u3'?undo():redo()},true);
// Legacy text editor only snapshots on drag. Start a synthetic no-move drag while a text field is edited,
// so the original editor's own undo stack receives a proper pre-edit snapshot.
document.addEventListener('focusin',e=>{if(mode()!=='base'||!e.target.closest?.('#rafPanel3 input,#rafPanel3 textarea,#rafPanel3 select')||synthetic)return;const h=$('.rmove3');if(!h)return;synthetic=true;try{h.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:98765,clientX:0,clientY:0}))}catch{}},true);
document.addEventListener('focusout',e=>{if(!synthetic||!e.target.closest?.('#rafPanel3 input,#rafPanel3 textarea,#rafPanel3 select'))return;try{document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerId:98765,clientX:0,clientY:0}))}catch{}synthetic=false},true);
// Alignment lines only while the move handle is actually dragged.
document.addEventListener('pointerdown',e=>{if(e.pointerId!==98765&&e.target.closest?.('.rmove3,.peDrag'))document.body.classList.add('raf-dragging61')},true);
const stop=e=>{if(e?.pointerId===98765)return;document.body.classList.remove('raf-dragging61');document.querySelectorAll('.proGuide60').forEach(x=>x.style.display='none')};
document.addEventListener('pointerup',stop,true);document.addEventListener('pointercancel',stop,true);
