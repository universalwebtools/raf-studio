// RAF.studio — FAQ editor glue v8.7.7
// The visual disclosure triangle is supplied by accordion-runtime-v877.js as a
// pseudo-element of the same movable question span. Therefore the question keeps
// all normal RAF text editing, scaling and movement, while its arrow can never be
// left behind as a separate object.
(function(){
 if(!new URLSearchParams(location.search).has('editor'))return;
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 function refreshVersionLabels(){
  const q=new URLSearchParams(location.search),current=q.get('ev')||'8.7.7',select=$('#editorVersion770 select');
  if(select){
   let o=[...select.options].find(x=>x.value==='8.7.7');
   if(!o){o=document.createElement('option');o.value='8.7.7';o.textContent='8.7.7 — FAQ SCALONE + RESPONSIVE DOCK';select.insertBefore(o,select.firstChild)}
   if(current==='8.7.7')select.value='8.7.7'
  }
  for(const el of $$('#v72panel small,#rafPanel3 small')){
   if(/V8\.7\.2 CORE/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/V8\.7\.2 CORE/i,current==='8.7.7'?'V8.7.7 CORE':('V'+current+' CORE'))
  }
  try{if(parent&&parent!==window){const b=parent.document.querySelector('.bar b');if(b&&/RESPONSIVE/i.test(b.textContent||''))b.textContent='RAF.studio — RESPONSIVE '+current}}catch{}
 }
 function noteFaqSelection(){
  const core=window.rafCore760||window.rafCore72;if(!core?.selected)return;const a=core.selected();
  if(a.length!==1)return;const el=a[0],summary=el.closest?.('summary');if(!summary)return;
  const p=$('#rafPanel3'),existing=$('#faq877Note');if(existing)return;const box=document.createElement('div');box.id='faq877Note';box.style.cssText='border:1px solid #9b59ff55;background:#170d22;color:#ddd;border-radius:9px;padding:8px;margin:8px 0;font:10px/1.4 system-ui';box.innerHTML='<b style="color:#d6a4ff">FAQ</b><br>Rozwijacz jest scalony z pytaniem. Przesunięcie lub skalowanie pytania przesuwa i skaluje strzałkę razem z nim.';(p||document.body).appendChild(box)
 }
 function run(){window.rafFaqRuntime877?.refresh?.();refreshVersionLabels();noteFaqSelection()}
 for(const ev of ['raf:v760-ready','raf:v760-selection','raf:v760-change','raf:universal-elements-ready','raf:template752-rendered'])window.addEventListener(ev,()=>setTimeout(run,0));
 new MutationObserver(()=>setTimeout(refreshVersionLabels,0)).observe(document.documentElement,{subtree:true,childList:true});
 setInterval(run,400);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
 window.rafAccordion877={refresh:run};
})();
