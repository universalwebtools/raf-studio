// RAF.studio — public transform, clone, crop and flow-order runtime v7.7.2
import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';

const Q=new URLSearchParams(location.search);
if(!Q.has('editor')&&!Q.has('tplPreview')){
 const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app);
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 const dev=()=>innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop';
 const TEXT='[data-home-text],#heroK,#heroT,#heroD,[data-custom62="title"],[data-custom62="text"]';
 const CAND=TEXT+',[data-raf-free],[data-raf-element]:not(.nav):not(.navlinks):not(.brand),[data-home-media],[data-raf-section],header.hero,.actions,.contactActions,.facts>.card,.offerCard54,.googleSummary54,.reviewCard54,.trustedLogo54,.raf-custom-section,[data-custom62="button"],[data-custom62="image"],[data-custom62="video"],[data-raf-v76-clone]';
 let layout={},clones=[],flowOrders=[],timer=null,rendering=false;

 function pathKey(el){
  const a=[];let n=el;
  while(n&&n!==document.body&&a.length<6){const p=n.parentElement;if(!p)break;const same=[...p.children].filter(x=>x.tagName===n.tagName);a.unshift(n.tagName.toLowerCase()+(same.length>1?':'+same.indexOf(n):''));if(n.matches('[data-raf-section],header.hero'))break;n=p}
  return a.join('>')
 }
 function idFor(el){
  if(!el)return'';if(el.dataset.rafV7PublicId)return el.dataset.rafV7PublicId;
  let id='';
  const cloneRoot=el.closest?.('[data-raf-v76-clone]');
  if(cloneRoot&&cloneRoot!==el){const a=[];let n=el;while(n&&n!==cloneRoot){const p=n.parentElement;if(!p)break;const same=[...p.children].filter(x=>x.tagName===n.tagName);a.unshift(n.tagName.toLowerCase()+':'+same.indexOf(n));n=p}id='clonepart:'+cloneRoot.dataset.rafV76Clone+':'+a.join('>')}
  else if(el.dataset.rafV76Clone)id='clone:'+el.dataset.rafV76Clone;
  else if(el.dataset.rafV7Id)id=el.dataset.rafV7Id;
  else if(['heroK','heroT','heroD'].includes(el.id))id='tx:'+el.id;
  else if(el.dataset.homeText)id='tx:'+el.dataset.homeText;
  else if(el.dataset.custom62Id&&el.dataset.custom62)id='cs:'+el.dataset.custom62Id+':'+el.dataset.custom62;
  else if(el.dataset.homeMedia)id='media:'+el.dataset.homeMedia;
  else if(el.dataset.rafElement)id='el:'+el.dataset.rafElement;
  else if(el.matches('header.hero'))id='section:Hero';
  else if(el.dataset.rafSection)id='section:'+el.dataset.rafSection;
  else if(el.classList.contains('actions'))id='group:heroActions';
  else if(el.classList.contains('contactActions'))id='group:contactActions';
  else if(el.matches('.facts>.card'))id='about:fact:'+[...el.parentElement.children].indexOf(el);
  else if(el.dataset.offerIndex!=null)id='offer:'+el.dataset.offerIndex;
  else if(el.dataset.reviewIndex!=null)id='review:'+el.dataset.reviewIndex;
  else if(el.dataset.brandIndex!=null)id='brand:'+el.dataset.brandIndex;
  else id='dom:'+pathKey(el);
  el.dataset.rafV7PublicId=id;return id
 }
 function cfg(id){const d=dev(),desk=layout.desktop?.[id]||{},cur=layout[d]?.[id]||{};return d==='desktop'?desk:{...desk,...cur}}
 function cropApply(el,c){
  if(!(el instanceof HTMLImageElement)||!c)return;
  if(c.src)el.src=c.src;if(el.dataset.homeMedia)el.style.transform='none';el.style.objectFit=c.fit||'cover';el.style.objectPosition=(Number(c.x??50))+'% '+(Number(c.y??50))+'%';el.style.transformOrigin=(Number(c.x??50))+'% '+(Number(c.y??50))+'%';el.style.scale=String(Math.max(.1,Number(c.zoom)||1));
  if((Number(c.zoom)||1)>1&&el.parentElement)el.parentElement.style.overflow='hidden'
 }
	 function applyOne(el){
	  const id=idFor(el),c=cfg(id);if(!id||!c||!Object.keys(c).length)return;
	  if(el.matches('.rw-floating-button')){el.style.position='fixed';el.style.removeProperty('left');el.style.removeProperty('top');el.style.translate=(Number(c.x)||0)+'px '+(Number(c.y)||0)+'px'}else{el.style.position='relative';el.style.left=(Number(c.x)||0)+'px';el.style.top=(Number(c.y)||0)+'px';el.style.removeProperty('translate')}
  if(c.width!=null&&Number(c.width)>0){el.dataset.v760PublicWidth='1';el.style.boxSizing='border-box';el.style.width=Number(c.width)+'px';el.style.maxWidth=Number(c.width)+'px'}else if(el.dataset.v760PublicWidth==='1'){el.style.removeProperty('width');el.style.removeProperty('max-width');el.dataset.v760PublicWidth='0'}
  if(c.height!=null&&Number(c.height)>0){el.dataset.v760PublicHeight='1';el.style.boxSizing='border-box';el.style.height=Number(c.height)+'px'}else if(el.dataset.v760PublicHeight==='1'){el.style.removeProperty('height');el.dataset.v760PublicHeight='0'}
  el.style.rotate=(Number(c.rotate)||0)+'deg';if(c.z)el.style.zIndex=String(c.z);else el.style.removeProperty('z-index');if(c.src&&el instanceof HTMLImageElement)el.src=c.src;cropApply(el,c.crop);if(c.hidden){el.dataset.v760PublicHidden='1';el.style.display='none'}else if(el.dataset.v760PublicHidden==='1'){el.style.removeProperty('display');el.dataset.v760PublicHidden='0'}
 }
 function cleanClone(node,id){
  const all=[node,...node.querySelectorAll('*')];
  all.forEach((x,i)=>{x.classList.remove('v72sel','rsel','sel55','pro61-selected','custom62-selected','v72grp','v760locked');x.removeAttribute('contenteditable');x.removeAttribute('data-raf-v72-id');x.removeAttribute('data-raf-v7-public-id');x.removeAttribute('data-e3bound');if(x.id)x.removeAttribute('id');if(i===0){x.dataset.rafV76Clone=id;x.dataset.rafFree='1';for(const p of ['position','left','top','width','max-width','height','z-index','display','rotate','scale','outline'])x.style.removeProperty(p)}});return node
 }
 function findById(k){return $$('[data-raf-v7-public-id],'+CAND).find(x=>idFor(x)===k)||null}
 function renderClones(){
  if(rendering)return;rendering=true;
  try{for(const d of clones){if($('[data-raf-v76-clone="'+CSS.escape(d.id)+'"]'))continue;const source=findById(d.sourceId);if(!source?.parentElement||!d.html)continue;const t=document.createElement('template');t.innerHTML=d.html.trim();const node=t.content.firstElementChild;if(!node)continue;cleanClone(node,d.id);source.insertAdjacentElement('afterend',node);idFor(node);applyOne(node)}}finally{rendering=false}
 }
 function flowParentKey(parent){
  if(parent.id==='rafTemplate752')return'root:template752';if(parent.id==='rafMain')return'root:main';
  const section=parent.closest('[data-raf-section],header.hero'),sectionKey=section?idFor(section):'page';if(parent===section)return'parent:'+sectionKey;
  const parts=[];let n=parent;while(n&&n!==section&&parts.length<5){const p=n.parentElement;if(!p)break;const same=[...p.children].filter(x=>x.tagName===n.tagName),cls=[...n.classList].filter(x=>!/^v(72|760)/.test(x)&&!/(selected|rsel)/i.test(x)).slice(0,2).join('.');parts.unshift(n.tagName.toLowerCase()+(cls?'.'+cls:'')+(same.length>1?':'+same.indexOf(n):''));n=p}
  return'parent:'+sectionKey+'>'+parts.join('>')
 }
 function applyFlowOrders(){
  for(const row of flowOrders){const ordered=(row.items||[]).map(findById).filter(Boolean),parent=ordered[0]?.parentElement;if(!parent||flowParentKey(parent)!==row.parent)continue;const children=[...parent.children],positions=[];children.forEach((x,i)=>{if(ordered.includes(x)&&x.parentElement===parent)positions.push(i)});if(positions.length<2)continue;const desired=ordered.filter(x=>x.parentElement===parent),current=positions.map(i=>children[i]);if(current.every((x,i)=>x===desired[i]))continue;const final=[...children];positions.forEach((pos,i)=>{if(desired[i])final[pos]=desired[i]});final.forEach(x=>parent.appendChild(x))}
 }
 function apply(){ $$(CAND).forEach(applyOne);renderClones();$$(CAND).forEach(applyOne);applyFlowOrders() }
 function schedule(){clearTimeout(timer);requestAnimationFrame(apply);timer=setTimeout(apply,140);setTimeout(apply,500)}
 onValue(ref(db,WEBSITE_ROOT+'/public/builder'),s=>{const b=s.val()||{};layout=b.freeLayoutV7||{};clones=Array.isArray(b.clonesV76)?b.clonesV76:[];flowOrders=Array.isArray(b.flowOrderV772)?b.flowOrderV772:[];schedule()});
 onValue(ref(db,WEBSITE_ROOT+'/public/homeMedia'),schedule);
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});addEventListener('resize',schedule,{passive:true})
}
