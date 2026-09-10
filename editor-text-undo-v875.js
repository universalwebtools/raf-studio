// RAF.studio — text undo reliability hotfix v8.7.5
// Fixes the first Ctrl+Z after editing text whose layout had no explicit text override.
// Also keeps the inspector textarea in sync when Ctrl+Z is pressed while it has focus.
(function(){
 const TEXT_TAGS='h1,h2,h3,h4,h5,h6,p,span,b,strong,small,blockquote,a,button,label,li,figcaption,em';
 const baselineById=new Map();
 const baselineByEl=new WeakMap();
 let core=null,installed=false;

 function isEditableText(el){
  return !!el?.matches?.(TEXT_TAGS) && !el.querySelector?.('img,video,svg,iframe,input,textarea,select') && !(el.dataset?.rafWidgetAction&&el.children.length)
 }
 function snapshot(el,id){
  if(!el||!isEditableText(el))return;
  const row=core?.cfgFor?.(el);
  // A baseline is only needed when the core has no explicit text value yet.
  if(row?.text!==null&&row?.text!==undefined)return;
  const data={html:el.innerHTML,text:String(el.innerText??el.textContent??''),id:id||core?.id?.(el)||''};
  baselineByEl.set(el,data);if(data.id&&!baselineById.has(data.id))baselineById.set(data.id,data)
 }
 function snapshotAllMissing(){
  if(!core?.list)return;
  try{for(const row of core.list()){if(row?.cfg?.text==null)snapshot(row.el,row.id)}}catch(e){console.warn('RAF text baseline scan',e)}
 }
 function baselineFor(row){return baselineByEl.get(row.el)||baselineById.get(row.id)||null}
 function restoreNullTextDom(){
  if(!core?.list)return;
  try{
   for(const row of core.list()){
    if(row?.cfg?.text!=null||!isEditableText(row.el))continue;
    const base=baselineFor(row);if(!base)continue;
    if(row.el.innerHTML!==base.html)row.el.innerHTML=base.html
   }
  }catch(e){console.warn('RAF text baseline restore',e)}
 }
 function install(){
  core=window.rafCore760||window.rafCore72;if(!core||installed)return false;installed=true;
  snapshotAllMissing();
  const rawUndo=typeof core.undo==='function'?core.undo.bind(core):null;
  const rawRedo=typeof core.redo==='function'?core.redo.bind(core):null;
  const rawApplyLayout=typeof core.applyLayout==='function'?core.applyLayout.bind(core):null;
  const rawRefresh=typeof core.refresh==='function'?core.refresh.bind(core):null;
  if(rawUndo)core.undo=function(){const ok=rawUndo();if(ok)restoreNullTextDom();return ok};
  if(rawRedo)core.redo=function(){const ok=rawRedo();if(ok)restoreNullTextDom();return ok};
  if(rawApplyLayout)core.applyLayout=function(x){const out=rawApplyLayout(x);restoreNullTextDom();return out};
  if(rawRefresh)core.refresh=function(){const out=rawRefresh();snapshotAllMissing();restoreNullTextDom();return out};
  window.rafCore72=core;
  window.dispatchEvent(new CustomEvent('raf:text-undo-875-ready'));
  return true
 }

 // Capture the exact original DOM before direct on-canvas editing starts.
 window.addEventListener('raf:v760-inline-start',e=>{if(!core)core=window.rafCore760||window.rafCore72;snapshot(e.detail?.element,e.detail?.id)},true);
 // Capture newly rendered template text before its first edit.
 window.addEventListener('raf:template752-rendered',()=>setTimeout(()=>{if(!core)core=window.rafCore760||window.rafCore72;snapshotAllMissing()},0));
 // Inspector text: capture baseline before the first keystroke.
 document.addEventListener('focus',e=>{
  if(e.target?.id!=='v760text')return;if(!core)core=window.rafCore760||window.rafCore72;
  const el=core?.selected?.()?.length===1?core.selected()[0]:null;snapshot(el,el?core?.id?.(el):'')
 },true);
 document.addEventListener('input',e=>{
  if(e.target?.id!=='v760text')return;if(!core)core=window.rafCore760||window.rafCore72;
  const el=core?.selected?.()?.length===1?core.selected()[0]:null;snapshot(el,el?core?.id?.(el):'')
 },true);

 // The global history handler runs later. Blur the inspector textarea first so
 // the reverted value can be written back into the field immediately.
 window.addEventListener('keydown',e=>{
  if(!(e.ctrlKey||e.metaKey)||e.altKey||String(e.key).toLowerCase()!=='z')return;
  const active=document.activeElement;if(active?.id==='v760text')active.blur()
 },true);

 if(!install()){
  window.addEventListener('raf:v760-ready',()=>install(),{once:true});
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>120)clearInterval(timer)},50)
 }
})();
