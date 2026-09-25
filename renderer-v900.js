// RAF.studio 9.0 — one final renderer for editor draft and public state
import {getApps,getApp,initializeApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,onValue,get} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';
import {applyLayout,mergedCfg} from './editor-layout-engine-v900.js?v=9.0.0';
import {resolveObjectId,semanticId} from './editor-object-id-v900.js?v=9.0.0';

const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app);
const Q=new URLSearchParams(location.search),EDITOR=Q.has('editor'),$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const device=()=>Q.get('device')||(innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop');
let state={},timer=0,ready=false;
window.RAF_RENDERER900_ACTIVE=true;

const cp=x=>structuredClone(x??{});
function mergeDevice(obj={}){const d=device(),desk=obj.desktop||{},own=obj[d]||{};return d==='desktop'?desk:{...desk,...own}}
function textKey(el){if(['heroK','heroT','heroD'].includes(el.id))return el.id;return el.dataset.siteText||el.dataset.homeText||''}
function pathKey(el){const a=[];let n=el;while(n&&n!==document.body&&a.length<7){const p=n.parentElement;if(!p)break;const same=[...p.children].filter(x=>x.tagName===n.tagName);a.unshift(n.tagName.toLowerCase()+(same.length>1?':'+same.indexOf(n):''));if(n.matches('[data-raf-section],header.hero'))break;n=p}return a.join('>')}
function layoutId(el,map){return resolveObjectId(el,map,false)||semanticId(el)||el.dataset.rafV7Id||('dom:'+pathKey(el))}
function applyLegacyText(el,s){
 const k=textKey(el);if(!k)return;const v=['heroK','heroT','heroD'].includes(k)?s.site?.[k]:s.homeContent?.[k];if(v!==undefined&&!el.isContentEditable)el.textContent=String(v);
 const c=mergeDevice(s.visualStyles?.texts?.[k]||{});
 if(c.fontFamily)el.style.fontFamily='"'+c.fontFamily+'"';else el.style.removeProperty('font-family');
 if(c.fontSize)el.style.fontSize=Number(c.fontSize)+'px';else el.style.removeProperty('font-size');
 if(c.fontWeight)el.style.fontWeight=c.fontWeight;else el.style.removeProperty('font-weight');
 if(c.fontStyle)el.style.fontStyle=c.fontStyle;else el.style.removeProperty('font-style');
 if(c.lineHeight)el.style.lineHeight=c.lineHeight;else el.style.removeProperty('line-height');
 if(c.letterSpacing!=null)el.style.letterSpacing=Number(c.letterSpacing)+'px';
 if(c.color)el.style.color=c.color;
 if(c.textAlign)el.style.textAlign=c.textAlign;
 if(c.textTransform)el.style.textTransform=c.textTransform;
 if(c.textDecoration)el.style.textDecoration=c.textDecoration;
 if(c.width){el.style.width=el.style.maxWidth=Number(c.width)+'px'}
 const mx=Number(c.moveX)||0,my=Number(c.moveY)||0,rot=Number(c.rotate)||0,sc=Number(c.scale)||1;
 if(mx||my||rot||sc!==1)el.style.transform='translate('+mx+'px,'+my+'px) rotate('+rot+'deg) scale('+sc+')';
}
function applyLegacyMedia(el,s){
 const k=el.dataset.homeMedia,x=s.homeMedia?.[k];if(!x)return;const c=mergeDevice(x);
 if(x.url&&el.getAttribute('src')!==x.url)el.src=x.url;
 el.style.objectFit=c.fit||'cover';el.style.objectPosition=(c.x??50)+'% '+(c.y??50)+'%';el.style.transformOrigin=(c.x??50)+'% '+(c.y??50)+'%';el.style.transform='scale('+(c.zoom??1)+')';
 if(c.brightness!=null||c.contrast!=null)el.style.filter='brightness('+(c.brightness??100)+'%) contrast('+(c.contrast??100)+'%)';
 if(c.opacity!=null)el.style.opacity=String(Number(c.opacity)/100);if(c.radius!=null)el.style.borderRadius=Number(c.radius)+'px';
}
function applyBuilderElement(el,s){
 const k=el.dataset.rafElement;if(!k)return;const c=mergeDevice(s.builder?.elements?.[k]||{});
 if(c.text!=null&&!el.querySelector('img,svg,video,iframe'))el.textContent=String(c.text);
 if(c.href!=null&&el instanceof HTMLAnchorElement)el.setAttribute('href',String(c.href));
 if(c.background)el.style.background=c.background;if(c.color)el.style.color=c.color;if(c.radius!=null)el.style.borderRadius=Number(c.radius)+'px';
 if(c.paddingX!=null){el.style.paddingLeft=el.style.paddingRight=Number(c.paddingX)+'px'}if(c.paddingY!=null){el.style.paddingTop=el.style.paddingBottom=Number(c.paddingY)+'px'}
 if(c.fontSize)el.style.fontSize=Number(c.fontSize)+'px';if(c.hidden)el.style.display='none';
}
function applySection(el,s){
 const k=el.matches('header.hero')?'Hero':(el.dataset.rafSection||el.dataset.homeSection);if(!k)return;const c=mergeDevice(s.visualStyles?.sections?.[k]||{});
 if(c.paddingTop!=null)el.style.paddingTop=Number(c.paddingTop)+'px';if(c.paddingBottom!=null)el.style.paddingBottom=Number(c.paddingBottom)+'px';if(c.minHeight!=null)el.style.minHeight=Number(c.minHeight)+'px';
 if(c.backgroundEnabled===false)el.style.setProperty('background','transparent','important');else if(c.background)el.style.background=c.background;
 if(c.hidden)el.style.display='none';
}
function applyFreeLayout(s){
 const layout=s.builder?.freeLayoutV7||{},map=s.builder?.stableIdsV900||{},d=device();
 const candidates='[data-raf-v72-id],[data-raf-v7-id],[data-raf-free],[data-raf-element]:not(.nav):not(.navlinks):not(.brand),[data-home-text],[data-site-text],[data-home-media],[data-raf-section],header.hero,[data-custom62],[data-raf-v76-clone]';
 for(const el of $$(candidates)){
  if(el.closest('#rafTop3,#rafPanel3,#v72box,#v760layers,#v760menu,#v760history'))continue;
  const id=layoutId(el,map),legacy=semanticId(el)||el.dataset.rafV7Id||('dom:'+pathKey(el));
  const c=layout?.[d]?.[id]||layout?.[d]?.[legacy]||(d!=='desktop'?(layout?.desktop?.[id]||layout?.desktop?.[legacy]):null);
  if(c)applyLayout(el,mergedCfg(layout,d,id in (layout?.[d]||{})||id in (layout?.desktop||{})?id:legacy));
 }
}
function apply(s=state){
 state=cp(s||{});document.documentElement.dataset.rafRenderer='9.0.0';
 for(const el of $$('[data-home-text],[data-site-text],#heroK,#heroT,#heroD'))applyLegacyText(el,state);
 for(const el of $$('[data-home-media]'))applyLegacyMedia(el,state);
 for(const el of $$('[data-raf-element]'))applyBuilderElement(el,state);
 for(const el of $$('[data-raf-section],header.hero'))applySection(el,state);
 applyFreeLayout(state);
 ready=true;window.dispatchEvent(new CustomEvent('raf:renderer900-applied',{detail:{device:device(),editor:EDITOR}}));
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>requestAnimationFrame(()=>apply(state)),35)}
if(EDITOR){
 const path=WEBSITE_ROOT+'/public/editorDraft';
 onValue(ref(db,path),s=>{state=s.val()||{};schedule()});
}else{
 const root=WEBSITE_ROOT+'/public',parts=['site','homeContent','homeMedia','visualStyles','builder'];
 Promise.all(parts.map(k=>get(ref(db,root+'/'+k)))).then(vals=>{parts.forEach((k,i)=>state[k]=vals[i].val()||{});apply(state)});
 for(const k of parts)onValue(ref(db,root+'/'+k),s=>{state[k]=s.val()||{};if(ready)schedule()});
}
const mo=new MutationObserver(()=>schedule());const observe=()=>{mo.disconnect();for(const r of [$('#rafMain'),$('#rafTemplate752'),$('.rafHeader900')].filter(Boolean))mo.observe(r,{subtree:true,childList:true})};observe();
for(const ev of ['raf:template752-rendered','raf:widgets770-rendered','raf:universal-elements-ready'])window.addEventListener(ev,()=>{observe();schedule()});
addEventListener('resize',schedule,{passive:true});
window.rafRenderer900={apply:next=>apply(next||state),state:()=>cp(state),device};
