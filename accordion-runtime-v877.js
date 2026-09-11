// RAF.studio — FAQ fused component runtime v8.8.2
// Arrow + separator line + question are ONE movable/scalable editor element.
// The original <details> border/padding is transferred onto the movable question span,
// so ALT multi-select, move and scale can never leave the FAQ separator behind.
(function(){
 const q=new URLSearchParams(location.search),ev=q.get('ev')||'';
 if(q.has('editor')&&ev&&!['8.7.7','8.8.0','8.8.1','8.8.2'].includes(ev))return;
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 let queued=false,running=false;
 function css(){
  let s=$('#rafFaq877Css');if(s)s.remove();
  s=document.createElement('style');s.id='rafFaq877Css';s.textContent=`
summary.rafFaq877{list-style:none!important;list-style-type:none!important}
summary.rafFaq877::-webkit-details-marker{display:none!important;width:0!important;height:0!important}
summary.rafFaq877::marker{content:""!important;font-size:0!important}
details.rafFaqItem882{border-top:0!important;padding-top:0!important}
summary.rafFaq877>.rafFaqText877{
 display:block!important;position:relative!important;list-style:none!important;
 width:100%!important;box-sizing:border-box!important;
 border-top:var(--raf-faq-border,1px solid #8885)!important;
 padding-top:var(--raf-faq-pad-top,20px)!important;
}
summary.rafFaq877>.rafFaqText877::before{
 content:"▶"!important;display:inline-block!important;margin-right:.55em!important;
 font-size:.72em!important;line-height:1!important;transform-origin:center!important;
 transition:transform .16s ease!important;vertical-align:.08em!important;
}
details[open]>summary.rafFaq877>.rafFaqText877::before{transform:rotate(90deg)!important}
`;
  document.head.appendChild(s)
 }
 function bind(summary){
  if(!(summary instanceof HTMLElement))return;
  summary.classList.add('rafFaq877');
  summary.style.setProperty('list-style','none','important');
  summary.style.setProperty('list-style-type','none','important');
  let text=summary.querySelector(':scope > [data-raf-universal-text],:scope > .rafFaqText877');
  if(!text){
   const nodes=[...summary.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.nodeValue.trim());
   if(nodes.length){
    text=document.createElement('span');text.dataset.rafUniversalText='1';
    text.textContent=nodes.map(n=>n.nodeValue).join('');
    nodes[0].replaceWith(text);nodes.slice(1).forEach(n=>n.remove())
   }
  }
  if(!text)return;
  text.classList.add('rafFaqText877');
  text.dataset.rafFree='1';
  summary.dataset.rafFaqFused='1';
  const details=summary.parentElement?.matches?.('details')?summary.parentElement:null;
  if(details&&!details.dataset.rafFaqLineFused){
   const cs=getComputedStyle(details),bw=parseFloat(cs.borderTopWidth)||0;
   const border=bw>0&&cs.borderTopStyle!=='none'?`${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`:'1px solid rgba(136,136,136,.33)';
   const padTop=cs.paddingTop&&cs.paddingTop!=='0px'?cs.paddingTop:'20px';
   text.style.setProperty('--raf-faq-border',border);
   text.style.setProperty('--raf-faq-pad-top',padTop);
   details.classList.add('rafFaqItem882');
   details.dataset.rafFaqLineFused='1';
  }
 }
 function run(){if(running)return;running=true;queued=false;try{css();$$('summary').forEach(bind)}finally{running=false}}
 function schedule(){if(queued||running)return;queued=true;requestAnimationFrame(run)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
 for(const ev of ['raf:universal-elements-ready','raf:template752-rendered','raf:v760-ready','raf:v760-change','raf:v760-selection'])window.addEventListener(ev,schedule);
 let n=0,t=setInterval(()=>{run();if(++n>40)clearInterval(t)},250);
 window.rafFaqRuntime877={refresh:run};
})();
