// RAF.studio — universal editable elements hotfix v8.7.3
// Makes every real CONTENT element selectable without turning layout wrappers
// into positioned editor objects. Also promotes plain-text leaf nodes to spans
// so their text, typography, size and position can be edited like normal text.
(function(){
 const ROOTS=['#rafTemplate752','#rafMain','body>nav.nav','body>header.hero','body>footer.footer','body>.floating'];
 const SKIP='script,style,link,meta,title,template,noscript,#rafTop3,#rafPanel3,#rafProModal61,#tpl752,#widgetsModal770,#v72box,#v760layers,#v760menu,#v760history,#v760guides,.v72marq';
 const CONTENT='h1,h2,h3,h4,h5,h6,p,span,b,strong,small,blockquote,a,button,label,li,figcaption,em,img,picture,video,audio,canvas,svg,iframe,figure,article,form,details,summary,[role="button"],[data-raf-element],[data-home-text],[data-site-text],[data-home-media],[data-raf-section],[data-custom62],[data-raf-v76-clone]';
 const EDITABLE_TEXT=new Set(['H1','H2','H3','H4','H5','H6','P','SPAN','B','STRONG','SMALL','BLOCKQUOTE','A','BUTTON','LABEL','LI','FIGCAPTION','EM']);
 let queued=false,wrapping=false;
 const escPart=s=>String(s||'').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,40)||'page';
 function roots(){const out=[];for(const sel of ROOTS)document.querySelectorAll(sel).forEach(el=>{if(!out.includes(el))out.push(el)});return out}
 function rootKey(root){if(root.id)return root.id;if(root.matches('nav.nav'))return'nav';if(root.matches('header.hero'))return'hero';if(root.matches('footer.footer'))return'footer';if(root.matches('.floating'))return'floating';return root.tagName.toLowerCase()}
 function pathOf(root,el){const parts=[];let n=el;while(n&&n!==root&&parts.length<10){const p=n.parentElement;if(!p)break;const same=[...p.children].filter(x=>x.tagName===n.tagName),i=Math.max(0,same.indexOf(n));parts.unshift(n.tagName.toLowerCase()+':'+i);n=p}return parts.join('>')||el.tagName.toLowerCase()}
 function stableId(root,el){const tpl=escPart(document.body?.dataset?.e752||'base');return'univ873:'+tpl+':'+rootKey(root)+':'+pathOf(root,el)}
 function eligible(el){if(!(el instanceof Element)||el.matches(SKIP)||el.closest(SKIP))return false;if(el===document.documentElement||el===document.body)return false;return true}
 function hasOwnPlainText(el){if(!eligible(el)||EDITABLE_TEXT.has(el.tagName)||el.children.length)return false;return[...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.nodeValue.trim())}
 function promotePlainText(root){
  if(wrapping)return;wrapping=true;
  try{
   const all=[root,...root.querySelectorAll('*')];
   for(const el of all){
    if(!hasOwnPlainText(el)||el.dataset.rafUniversalWrapped==='1')continue;
    const textNodes=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.nodeValue.trim());
    if(textNodes.length!==1)continue;
    const node=textNodes[0],span=document.createElement('span');span.dataset.rafUniversalText='1';span.textContent=node.nodeValue;node.replaceWith(span);el.dataset.rafUniversalWrapped='1'
   }
  }finally{wrapping=false}
 }
 function visuallyLeaf(el){
  if(!eligible(el)||el.children.length)return false;
  try{const c=getComputedStyle(el);return c.backgroundImage!=='none'||parseFloat(c.borderTopWidth)>0||parseFloat(c.borderRightWidth)>0||parseFloat(c.borderBottomWidth)>0||parseFloat(c.borderLeftWidth)>0}catch{return false}
 }
 function mark(root,el){
  if(!eligible(el))return;
  if(!el.dataset.rafV7Id&&!el.dataset.rafElement&&!el.dataset.homeText&&!el.dataset.siteText&&!el.dataset.homeMedia&&!el.dataset.rafSection&&!el.dataset.rafV76Clone)el.dataset.rafV7Id=stableId(root,el);
  el.dataset.rafFree='1'
 }
 function markRoot(root){
  if(!eligible(root))return;promotePlainText(root);
  if(root.matches('[data-raf-section],[data-raf-element]'))mark(root,root);
  root.querySelectorAll(CONTENT).forEach(el=>mark(root,el));
  root.querySelectorAll('*').forEach(el=>{if(el.dataset.rafUniversalText==='1'||visuallyLeaf(el))mark(root,el)})
 }
 function run(){queued=false;for(const root of roots())markRoot(root);window.rafCore760?.refresh?.();window.dispatchEvent(new CustomEvent('raf:universal-elements-ready'))}
 function schedule(){if(queued||wrapping)return;queued=true;requestAnimationFrame(run)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('raf:template752-rendered',schedule);window.addEventListener('raf:template752-repair',schedule);window.addEventListener('raf:v760-ready',schedule);
 window.rafUniversalElements873={refresh:run};
})();
