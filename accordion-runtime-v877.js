// RAF.studio — FAQ fused disclosure runtime v8.8.0 r2
// The disclosure arrow must be part of the exact movable question text element.
// Never leave the browser-native <summary> marker behind when the question moves.
(function(){
 const q=new URLSearchParams(location.search),ev=q.get('ev')||'';
 // Current editor + the release where FAQ fusion was introduced. Older archives
 // keep their own immutable behavior through their archived code.
 if(q.has('editor')&&ev&&!['8.7.7','8.8.0'].includes(ev))return;
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 let queued=false,running=false;
 function css(){
  let s=$('#rafFaq877Css');if(s)s.remove();
  s=document.createElement('style');s.id='rafFaq877Css';s.textContent=`
summary.rafFaq877{list-style:none!important;list-style-type:none!important}
summary.rafFaq877::-webkit-details-marker{display:none!important;width:0!important;height:0!important}
summary.rafFaq877::marker{content:""!important;font-size:0!important}
summary.rafFaq877>.rafFaqText877{display:inline-block!important;position:relative!important;list-style:none!important}
summary.rafFaq877>.rafFaqText877::before{content:"▶"!important;display:inline-block!important;margin-right:.55em!important;font-size:.72em!important;line-height:1!important;transform-origin:center!important;transition:transform .16s ease!important;vertical-align:.08em!important}
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
  // This span is the real movable RAF element. The arrow is its ::before, so
  // x/y/scale applied by the editor can never separate the two.
  text.dataset.rafFree='1';
  summary.dataset.rafFaqFused='1';
 }
 function run(){if(running)return;running=true;queued=false;try{css();$$('summary').forEach(bind)}finally{running=false}}
 function schedule(){if(queued||running)return;queued=true;requestAnimationFrame(run)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
 for(const ev of ['raf:universal-elements-ready','raf:template752-rendered','raf:v760-ready','raf:v760-change','raf:v760-selection'])window.addEventListener(ev,schedule);
 // A short repair loop catches templates rendered asynchronously from Firebase.
 let n=0,t=setInterval(()=>{run();if(++n>40)clearInterval(t)},250);
 window.rafFaqRuntime877={refresh:run};
})();
