// RAF.studio — global history controller v5.4
const $=(s,r=document)=>r.querySelector(s);
function v54Selected(){return !!$('.sel54')}
function undo(){if(v54Selected()&&typeof window.rafV54Undo==='function'){window.rafV54Undo();return}const b=$('#u3');if(b&&!b.dataset.history54Forward){b.dataset.history54Forward='1';try{b.click()}finally{delete b.dataset.history54Forward}}}
function redo(){if(v54Selected()&&typeof window.rafV54Redo==='function'){window.rafV54Redo();return}const b=$('#r3');if(b&&!b.dataset.history54Forward){b.dataset.history54Forward='1';try{b.click()}finally{delete b.dataset.history54Forward}}}
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||e.key.toLowerCase()!=='z')return;const tag=e.target?.tagName?.toLowerCase(),editing=['input','textarea','select'].includes(tag)||e.target?.isContentEditable;if(editing&&!v54Selected())return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();e.shiftKey?redo():undo()},true);
document.addEventListener('click',e=>{const b=e.target.closest?.('#u3,#r3');if(!b||b.dataset.history54Forward||!v54Selected())return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();b.id==='u3'?window.rafV54Undo?.():window.rafV54Redo?.()},true);
