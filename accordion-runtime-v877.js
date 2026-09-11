// RAF.studio — FAQ disclosure marker runtime v8.7.7
// The browser's native <summary> marker lives outside the movable text box.
// RAF's universal editor intentionally makes the question text itself movable,
// so the native marker could be left behind. Replace only the VISUAL marker with
// a pseudo-element attached to that same question span. The whole disclosure
// control then moves/scales exactly with the question in editor and public view.
(function(){
 const q=new URLSearchParams(location.search);if(q.has('editor')&&q.get('ev')&&q.get('ev')!=='8.7.7')return;
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 let queued=false;
 function css(){
  if($('#rafFaq877Css'))return;
  const s=document.createElement('style');s.id='rafFaq877Css';s.textContent=`
summary.rafFaq877{list-style:none!important}
summary.rafFaq877::-webkit-details-marker{display:none!important}
summary.rafFaq877::marker{content:""!important}
summary.rafFaq877>.rafFaqText877{display:inline-block;position:relative}
summary.rafFaq877>.rafFaqText877::before{content:"▶";display:inline-block;margin-right:.55em;font-size:.72em;line-height:1;transform-origin:center;transition:transform .16s ease;vertical-align:.08em}
details[open]>summary.rafFaq877>.rafFaqText877::before{transform:rotate(90deg)}
`;
  document.head.appendChild(s)
 }
 function bind(summary){
  if(!(summary instanceof HTMLElement))return;
  summary.classList.add('rafFaq877');
  let text=summary.querySelector(':scope > [data-raf-universal-text]');
  if(!text){const nodes=[...summary.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.nodeValue.trim());if(nodes.length===1){text=document.createElement('span');text.dataset.rafUniversalText='1';text.textContent=nodes[0].nodeValue;nodes[0].replaceWith(text)}}
  if(text)text.classList.add('rafFaqText877')
 }
 function run(){queued=false;css();$$('summary').forEach(bind)}
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
 window.addEventListener('raf:universal-elements-ready',schedule);window.addEventListener('raf:template752-rendered',schedule);
 window.rafFaqRuntime877={refresh:run};
})();
