// RAF.studio — global history controller v5.0
const $=(s,r=document)=>r.querySelector(s);
function extraSelected(){return !!$('.extraSelected50')}
function undo(){if(extraSelected()&&typeof window.rafExtrasUndo==='function'){window.rafExtrasUndo();flash('Cofnięto zmianę');return}const b=$('#u3');if(b)b.click()}
function redo(){if(extraSelected()&&typeof window.rafExtrasRedo==='function'){window.rafExtrasRedo();flash('Ponowiono zmianę');return}const b=$('#r3');if(b)b.click()}
function flash(t){const s=$('#rafStatus3');if(!s)return;const old=s.textContent;s.textContent=t;setTimeout(()=>{if(s.textContent===t)s.textContent=old||'✓ Edytor v5.0'},700)}
document.addEventListener('keydown',e=>{const tag=e.target?.tagName?.toLowerCase();const editing=['input','textarea','select'].includes(tag)||e.target?.isContentEditable;if(e.ctrlKey&&!e.altKey&&e.key.toLowerCase()==='z'){if(editing&&!(e.shiftKey||e.target?.isContentEditable))return;e.preventDefault();e.stopPropagation();e.shiftKey?redo():undo()}},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('#u3,#r3');if(!b||!extraSelected())return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();b.id==='u3'?window.rafExtrasUndo?.():window.rafExtrasRedo?.()},true);
