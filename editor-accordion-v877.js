// RAF.studio — FAQ editor glue v8.8.3
// The separator line and disclosure arrow live on the same movable question element.
(function(){
 if(!new URLSearchParams(location.search).has('editor'))return;
 const $=(s,r=document)=>r.querySelector(s);
 function noteFaqSelection(){
  const core=window.rafCore760||window.rafCore72;if(!core?.selected)return;const a=core.selected();
  const old=$('#faq877Note');if(a.length!==1){old?.remove();return}
  const el=a[0],summary=el.closest?.('summary');if(!summary){old?.remove();return}
  const p=$('#rafPanel3,#v72panel');if(!p||old)return;
  const box=document.createElement('div');box.id='faq877Note';box.style.cssText='border:1px solid #9b59ff55;background:#170d22;color:#ddd;border-radius:9px;padding:8px;margin:8px 0;font:10px/1.4 system-ui';
  box.innerHTML='<b style="color:#d6a4ff">FAQ — komponent scalony</b><br>Linia + strzałka + pytanie są jednym elementem. Przesuwanie, ALT multi-select i skalowanie działają na całość.';
  p.appendChild(box)
 }
 function run(){window.rafFaqRuntime877?.refresh?.();noteFaqSelection()}
 for(const ev of ['raf:v760-ready','raf:v760-selection','raf:v760-change','raf:universal-elements-ready','raf:template752-rendered'])window.addEventListener(ev,()=>setTimeout(run,0));
 setInterval(run,500);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
 window.rafAccordion877={refresh:run};
})();
