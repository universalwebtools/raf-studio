// RAF.studio — universal editable elements hotfix v8.7.3
// Every visible site element inside the real page canvas gets a stable editor id.
// This intentionally excludes editor chrome, modals and runtime helper overlays.
(function(){
 const ROOTS=['#rafTemplate752','#rafMain','body>nav.nav','body>header.hero','body>footer.footer','body>.floating'];
 const SKIP='script,style,link,meta,title,template,noscript,#rafTop3,#rafPanel3,#rafProModal61,#tpl752,#widgetsModal770,#v72box,#v760layers,#v760menu,#v760history,#v760guides,.v72marq';
 let queued=false;
 const escPart=s=>String(s||'').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,40)||'page';
 function roots(){
  const out=[];for(const sel of ROOTS)document.querySelectorAll(sel).forEach(el=>{if(!out.includes(el))out.push(el)});return out
 }
 function rootKey(root){
  if(root.id)return root.id;
  if(root.matches('nav.nav'))return'nav';if(root.matches('header.hero'))return'hero';if(root.matches('footer.footer'))return'footer';if(root.matches('.floating'))return'floating';return root.tagName.toLowerCase()
 }
 function pathOf(root,el){
  const parts=[];let n=el;
  while(n&&n!==root&&parts.length<10){const p=n.parentElement;if(!p)break;const same=[...p.children].filter(x=>x.tagName===n.tagName),i=Math.max(0,same.indexOf(n));parts.unshift(n.tagName.toLowerCase()+':'+i);n=p}
  return parts.join('>')||el.tagName.toLowerCase()
 }
 function stableId(root,el){
  const tpl=escPart(document.body?.dataset?.e752||'base');
  return'univ873:'+tpl+':'+rootKey(root)+':'+pathOf(root,el)
 }
 function eligible(el){
  if(!(el instanceof Element)||el.matches(SKIP)||el.closest(SKIP))return false;
  if(el===document.documentElement||el===document.body)return false;
  return true
 }
 function markRoot(root){
  if(!eligible(root))return;
  const all=[root,...root.querySelectorAll('*')];
  for(const el of all){
   if(!eligible(el))continue;
   // Preserve ids supplied by dedicated widgets/template engine; only fill gaps.
   if(!el.dataset.rafV7Id&&!el.dataset.rafElement&&!el.dataset.homeText&&!el.dataset.siteText&&!el.dataset.homeMedia&&!el.dataset.rafSection&&!el.dataset.rafV76Clone)el.dataset.rafV7Id=stableId(root,el);
   el.dataset.rafFree='1';
  }
 }
 function run(){queued=false;for(const root of roots())markRoot(root);window.dispatchEvent(new CustomEvent('raf:universal-elements-ready'))}
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('raf:template752-rendered',schedule);
 window.addEventListener('raf:template752-repair',schedule);
 window.rafUniversalElements873={refresh:run};
})();
