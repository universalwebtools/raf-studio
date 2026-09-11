// RAF.studio — accordion / FAQ atomic controls v8.7.7
// Native <summary> disclosure markers must always travel with their question.
// Universal element discovery may mark the generated text span inside <summary>
// as a separate movable object. This module makes every summary an atomic editor
// object: marker + question are one selectable/movable/scalable element.
(function(){
 if(!new URLSearchParams(location.search).has('editor'))return;
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 let core=null,editing=null,queued=false;
 const cleanText=el=>String(el?.innerText??el?.textContent??'').replace(/\r/g,'').trim();
 function status(t){const e=$('#rafStatus3');if(e)e.textContent=t}
 function summaryId(el){
  if(el.dataset.rafV7Id)return el.dataset.rafV7Id;
  const details=el.closest('details'),root=el.closest('[data-raf-section],#rafTemplate752,#rafMain')||document.body;
  const all=[...root.querySelectorAll('summary')],i=Math.max(0,all.indexOf(el));
  const base=details?.dataset?.rafV7Id||details?.dataset?.rafV72Id||root.dataset?.rafSection||root.id||'page';
  return 'faq877:'+String(base).replace(/[^a-zA-Z0-9:_-]/g,'-')+':'+i
 }
 function neutralizeChildren(summary){
  // Keep the visual span if one was inserted by universal-elements, but it must
  // never become an independent editor object. The native triangle belongs to
  // SUMMARY, so moving SUMMARY moves both the triangle and the question.
  for(const el of summary.querySelectorAll('[data-raf-free],[data-raf-v72-id],[data-raf-v7-id]')){
   el.removeAttribute('data-raf-free');el.removeAttribute('data-raf-v72-id');el.removeAttribute('data-raf-v7-id');
   el.classList.remove('v72sel','v72grp','v760moveArmed','v760moving')
  }
 }
 function normalizeOne(summary){
  if(!(summary instanceof HTMLElement))return;
  summary.dataset.rafFree='1';
  if(!summary.dataset.rafV7Id)summary.dataset.rafV7Id=summaryId(summary);
  summary.dataset.rafAccordionAtomic='877';
  neutralizeChildren(summary);
  if(core){
   let c;try{c=core.cfgFor(summary)}catch{}
   if(c?.text!=null&&cleanText(summary)!==String(c.text).trim()){
    const span=summary.querySelector(':scope > [data-raf-universal-text]');
    if(span)span.textContent=String(c.text);else summary.textContent=String(c.text)
   }
  }
 }
 function normalize(){queued=false;core=core||window.rafCore760||window.rafCore72;$$('summary').forEach(normalizeOne);refreshVersionLabels()}
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(normalize)}
 function atomicTarget(node){const s=node?.closest?.('summary');return s||null}
 function beginText(summary){
  core=core||window.rafCore760||window.rafCore72;if(!core||editing)return false;
  normalizeOne(summary);core.selectElement?.(summary,false);
  const textNode=summary.querySelector(':scope > [data-raf-universal-text]')||summary;
  const original=cleanText(summary);let changed=false;
  const checkpoint=()=>{if(changed)return;changed=true;core.checkpoint?.()};
  const onInput=()=>{checkpoint();status('✎ Edycja pytania FAQ…')};
  const finish=(cancel=false)=>{
   if(!editing)return;const value=cancel?original:cleanText(summary);editing=null;
   textNode.removeEventListener('input',onInput);textNode.removeEventListener('blur',onBlur);textNode.removeEventListener('keydown',onKey);textNode.removeAttribute('contenteditable');
   if(cancel){textNode.textContent=original;status('↶ Anulowano edycję pytania FAQ')}
   else if(changed){core.patchOne?.(summary,{text:value},{commitNow:false});textNode.textContent=value;core.save?.();status('✓ Pytanie FAQ zapisane')}
   schedule();window.dispatchEvent(new CustomEvent('raf:v760-selection'))
  };
  const onBlur=()=>finish(false);
  const onKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(true)}else if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();finish(false)}};
  editing={summary,textNode,original};textNode.setAttribute('contenteditable','true');textNode.spellcheck=true;textNode.addEventListener('input',onInput);textNode.addEventListener('blur',onBlur);textNode.addEventListener('keydown',onKey);
  requestAnimationFrame(()=>{textNode.focus({preventScroll:true});const sel=getSelection(),r=document.createRange();r.selectNodeContents(textNode);r.collapse(false);sel.removeAllRanges();sel.addRange(r)});
  status('✎ Edytujesz całe pytanie FAQ • trójkąt pozostaje z pytaniem • Esc anuluje');return true
 }
 // Run before the core dblclick handler. For summaries double click means text edit;
 // single/double-drag continues to use the normal core move logic on SUMMARY.
 window.addEventListener('dblclick',e=>{
  if(e.button!==0)return;const summary=atomicTarget(e.target);if(!summary||e.target.closest('#rafTop3,#rafPanel3,#v72box'))return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();beginText(summary)
 },true);
 // If a stale child span somehow became selected, immediately promote selection to
 // its summary parent. This also repairs old drafts without deleting their layout.
 function repairSelection(){
  core=core||window.rafCore760||window.rafCore72;if(!core?.selected)return;
  const selected=core.selected(),promote=[];for(const el of selected){const s=el?.closest?.('summary');if(s&&s!==el)promote.push([el,s])}
  if(!promote.length)return;const keep=selected.filter(el=>!promote.some(([old])=>old===el));core.clear?.();for(const el of keep)core.selectElement?.(el,true);for(const [,s] of promote){normalizeOne(s);core.selectElement?.(s,true)}
 }
 function inspector(){
  core=core||window.rafCore760||window.rafCore72;if(!core?.selected)return;const selected=core.selected();if(selected.length!==1||selected[0].tagName!=='SUMMARY'){$('#faq877Inspector')?.remove();return}
  const summary=selected[0],host=$('#v760common')||$('#v72panel')||$('#rafPanel3');if(!host||$('#faq877Inspector'))return;
  const box=document.createElement('div');box.id='faq877Inspector';box.style.cssText='border-top:1px solid #43b9ff44;margin-top:10px;padding-top:10px';box.innerHTML='<div style="font:900 10px system-ui;letter-spacing:.12em;color:#70caff;margin-bottom:6px">PYTANIE FAQ + ROZWIJACZ</div><label style="display:block;font:10px system-ui;color:#aaa">Treść pytania<textarea id="faq877Text" style="box-sizing:border-box;width:100%;min-height:72px;margin-top:4px;background:#111;color:#fff;border:1px solid #ffffff25;border-radius:8px;padding:8px"></textarea></label><small style="display:block;color:#777;margin-top:5px">Trójkąt rozwijania jest teraz na stałe scalony z pytaniem — przesuwanie i skalowanie zawsze obejmuje oba.</small>';
  host.appendChild(box);const ta=$('#faq877Text',box);ta.value=cleanText(summary);let before=ta.value,committed=false;
  ta.addEventListener('focus',()=>{before=cleanText(summary);committed=false});
  ta.addEventListener('input',()=>{if(!committed&&ta.value!==before){core.checkpoint?.();committed=true}const span=summary.querySelector(':scope > [data-raf-universal-text]');if(span)span.textContent=ta.value;else summary.textContent=ta.value});
  ta.addEventListener('change',()=>{if(committed){core.patchOne?.(summary,{text:ta.value},{commitNow:false});core.save?.();status('✓ Pytanie FAQ zapisane')}})
 }
 function refreshVersionLabels(){
  const select=$('#editorVersion770 select');if(select){let o=[...select.options].find(x=>x.value==='8.7.7');if(!o){o=document.createElement('option');o.value='8.7.7';o.textContent='8.7.7 — FAQ SCALONE + RESPONSIVE DOCK';select.insertBefore(o,select.firstChild)}if((new URLSearchParams(location.search).get('ev')||'')==='8.7.7')select.value='8.7.7'}
  for(const el of $$('#v72panel small,#rafPanel3 small'))if(/V8\.7\.2 CORE/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/V8\.7\.2 CORE/i,'V8.7.7 CORE');
  try{if(parent&&parent!==window){const b=parent.document.querySelector('.bar b');if(b&&/RESPONSIVE/i.test(b.textContent||''))b.textContent='RAF.studio — RESPONSIVE 8.7.7'}}catch{}
 }
 for(const ev of ['raf:universal-elements-ready','raf:v760-ready','raf:v760-selection','raf:v760-change','raf:template752-rendered','raf:history-main'])window.addEventListener(ev,()=>{schedule();setTimeout(()=>{repairSelection();inspector();refreshVersionLabels()},0)});
 new MutationObserver(()=>{schedule();setTimeout(inspector,0)}).observe(document.documentElement,{subtree:true,childList:true});
 setInterval(()=>{normalize();repairSelection();inspector()},350);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 window.rafAccordion877={refresh:normalize,edit:beginText};
})();
