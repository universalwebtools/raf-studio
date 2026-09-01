// RAF.studio — global history controller v5.5
const $=(s,r=document)=>r.querySelector(s);
function sectionSelected(){return !!($('.sel55')||$('.sel54'))}
function undo(){if(sectionSelected()&&typeof window.rafV54Undo==='function'){window.rafV54Undo();return}const b=$('#u3');if(b&&!b.dataset.history55Forward){b.dataset.history55Forward='1';try{b.click()}finally{delete b.dataset.history55Forward}}}
function redo(){if(sectionSelected()&&typeof window.rafV54Redo==='function'){window.rafV54Redo();return}const b=$('#r3');if(b&&!b.dataset.history55Forward){b.dataset.history55Forward='1';try{b.click()}finally{delete b.dataset.history55Forward}}}
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||e.key.toLowerCase()!=='z')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();e.shiftKey?redo():undo()},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('#u3,#r3');if(!b||b.dataset.history55Forward||!sectionSelected())return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();b.id==='u3'?window.rafV54Undo?.():window.rafV54Redo?.()},true);
