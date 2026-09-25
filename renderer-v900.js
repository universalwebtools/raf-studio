// RAF.studio 9.0 — one final renderer for editor draft and public state
import {getApps,getApp,initializeApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,onValue,get} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';
import {applyLayout,mergedCfg} from './editor-layout-engine-v900.js?v=9.0.0';
import {resolveObjectId,semanticId} from './editor-object-id-v900.js?v=9.0.0';

const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app);
const Q=new URLSearchParams(location.search),EDITOR=Q.has('editor'),$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const device=()=>Q.get('device')||(innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop');
let state={},timer=0,ready=false,structureSig='';
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

function esc(s=''){return String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]))}
function youtubeId(url=''){return String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/)?.[1]||''}
function vimeoId(url=''){return String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]||''}
function videoMarkup(url=''){const y=youtubeId(url),v=vimeoId(url);if(y)return '<div class="rafVideoEmbed"><iframe src="https://www.youtube-nocookie.com/embed/'+y+'" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';if(v)return '<div class="rafVideoEmbed"><iframe src="https://player.vimeo.com/video/'+v+'" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';if(url)return '<video src="'+esc(url)+'" controls playsinline class="rafDirectVideo"></video>';return''}
function fieldStyle(el,x={}){if(!el)return;el.style.translate=(Number(x.x)||0)+'px '+(Number(x.y)||0)+'px';el.style.scale=String(Number(x.scale)||1);if(x.width)el.style.width=Number(x.width)+'px';if(x.fontSize)el.style.fontSize=Number(x.fontSize)+'px';if(x.fontWeight)el.style.fontWeight=String(x.fontWeight);if(x.color)el.style.color=x.color;if(x.align)el.style.textAlign=x.align;if(x.opacity!=null)el.style.opacity=String(Number(x.opacity)/100)}
function customSectionNode(s){
 const sec=document.createElement('section');sec.className='section raf-custom-section';sec.dataset.rafSection=s.id;sec.dataset.customSection='1';
 const img=s.imageUrl?'<div class="portrait"><img data-custom-field="image" data-custom-id="'+esc(s.id)+'" src="'+esc(s.imageUrl)+'" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>':'';
 const btn=s.buttonText?'<a class="btn primary" data-custom-field="button" data-custom-id="'+esc(s.id)+'" href="'+esc(s.buttonUrl||'#')+'">'+esc(s.buttonText)+'</a>':'';
 const title='<h2 data-custom-field="title" data-custom-id="'+esc(s.id)+'">'+esc(s.title||'NOWA SEKCJA.')+'</h2>',text='<p data-custom-field="text" data-custom-id="'+esc(s.id)+'">'+esc(s.text||'')+'</p>';
 if(s.type==='gallery'){const urls=s.images?.length?s.images:(s.imageUrl?[s.imageUrl]:[]),imgs=urls.map(u=>'<img data-custom-field="image" data-custom-id="'+esc(s.id)+'" src="'+esc(u)+'" loading="lazy" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:18px">').join('');sec.innerHTML='<div class="wrap"><div class="sectionHead">'+title+text+'</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">'+imgs+'</div>'+btn+'</div>'}
 else if(s.type==='video')sec.innerHTML='<div class="wrap"><div class="sectionHead">'+title+text+'</div><div data-custom-field="video" data-custom-id="'+esc(s.id)+'">'+videoMarkup(s.videoUrl||'')+'</div>'+btn+'</div>';
 else if(s.type==='cta')sec.innerHTML='<div class="wrap contactBox"><div>'+title+text+'</div><div>'+btn+'</div></div>';
 else sec.innerHTML='<div class="wrap about">'+img+'<div>'+title+text+btn+'</div></div>';
 if(s.hidden)sec.style.display='none';const ss=s.sectionStyle||{};if(ss.paddingTop!=null)sec.style.paddingTop=Number(ss.paddingTop)+'px';if(ss.paddingBottom!=null)sec.style.paddingBottom=Number(ss.paddingBottom)+'px';if(ss.minHeight)sec.style.minHeight=Number(ss.minHeight)+'px';if(ss.background)sec.style.background=ss.background;
 for(const name of ['title','text','button'])fieldStyle(sec.querySelector('[data-custom-field="'+name+'"]'),s.fieldStyles?.[name]||{});
 return sec
}
function legacyCloneSource(x){if(['heroK','heroT','heroD'].includes(x.sourceKey))return document.getElementById(x.sourceKey);return document.querySelector('[data-home-text="'+CSS.escape(x.sourceKey||'')+'"]')}
function renderLegacyClones(builder){
 document.querySelectorAll('[data-raf-clone]').forEach(x=>x.remove());
 for(const x of builder.clones||[]){const src=legacyCloneSource(x);if(!src?.parentElement)continue;const el=src.cloneNode(true);el.removeAttribute('id');el.removeAttribute('data-home-text');el.dataset.rafClone=x.id;el.textContent=x.text??src.textContent;const d=mergeDevice(x.styles||{});el.style.position='relative';el.style.transformOrigin='center center';el.style.transform='translate('+(Number(d.moveX)||0)+'px,'+(Number(d.moveY)||0)+'px) rotate('+(Number(d.rotate)||0)+'deg) scale('+(Number(d.scale)||1)+')';if(d.width)el.style.width=Number(d.width)+'px';if(d.fontSize)el.style.fontSize=Number(d.fontSize)+'px';if(d.color)el.style.color=d.color;if(d.zIndex!=null)el.style.zIndex=String(d.zIndex);if(d.hidden)el.style.display='none';src.parentElement.appendChild(el)}
}
function cleanV76(node,id){
 const all=[node,...node.querySelectorAll('*')];all.forEach((x,i)=>{x.classList.remove('v72sel','rsel','sel55','pro61-selected','custom62-selected','v72grp','v760locked');x.removeAttribute('contenteditable');x.removeAttribute('data-raf-v72-id');if(x.id)x.removeAttribute('id');if(i===0){x.dataset.rafV76Clone=id;x.dataset.rafFree='1'}});return node
}
function findLayoutNode(id,map){for(const el of $$('[data-raf-v76-clone],[data-raf-element],[data-home-text],[data-site-text],[data-home-media],[data-raf-section],header.hero,[data-raf-v7-id]'))if(layoutId(el,map)===id)return el;return null}
function renderV76Clones(builder){
 const defs=Array.isArray(builder.clonesV76)?builder.clonesV76:[],map=builder.stableIdsV900||{};
 for(const d of defs){if(document.querySelector('[data-raf-v76-clone="'+CSS.escape(d.id)+'"]'))continue;const source=findLayoutNode(d.sourceId,map);if(!source?.parentElement||!d.html)continue;const t=document.createElement('template');t.innerHTML=d.html.trim();const node=t.content.firstElementChild;if(!node)continue;cleanV76(node,d.id);source.insertAdjacentElement('afterend',node)}
}
function flowParentKey(parent,map){
 if(parent.id==='rafTemplate752')return'root:template752';if(parent.id==='rafMain')return'root:main';const section=parent.closest('[data-raf-section],header.hero'),sectionKey=section?layoutId(section,map):'page';if(parent===section)return'parent:'+sectionKey;const parts=[];let n=parent;while(n&&n!==section&&parts.length<5){const p=n.parentElement;if(!p)break;const same=[...p.children].filter(x=>x.tagName===n.tagName),cls=[...n.classList].filter(x=>!/^v(72|760|900)/.test(x)&&!/(selected|rsel)/i.test(x)).slice(0,2).join('.');parts.unshift(n.tagName.toLowerCase()+(cls?'.'+cls:'')+(same.length>1?':'+same.indexOf(n):''));n=p}return'parent:'+sectionKey+'>'+parts.join('>')
}
function applyFlow(builder){
 const map=builder.stableIdsV900||{};for(const row of builder.flowOrderV772||[]){const ordered=(row.items||[]).map(id=>findLayoutNode(id,map)).filter(Boolean),parent=ordered[0]?.parentElement;if(!parent||flowParentKey(parent,map)!==row.parent)continue;const children=[...parent.children],positions=[];children.forEach((x,i)=>{if(ordered.includes(x)&&x.parentElement===parent)positions.push(i)});if(positions.length<2)continue;const desired=ordered.filter(x=>x.parentElement===parent),final=[...children];positions.forEach((pos,i)=>{if(desired[i])final[pos]=desired[i]});final.forEach(x=>parent.appendChild(x))}
}
function renderStructure(s){
 const b=s.builder||{},sig=JSON.stringify({customSections:b.customSections||[],sectionOrder:b.sectionOrder||[],clones:b.clones||[],clonesV76:b.clonesV76||[],flow:b.flowOrderV772||[]});if(sig===structureSig){applyFlow(b);return}structureSig=sig;
 const main=$('#rafMain')||$('main');if(main){document.querySelectorAll('.raf-custom-section').forEach(x=>x.remove());const custom={};for(const x of b.customSections||[]){const node=customSectionNode(x);custom[x.id]=node;main.appendChild(node)}for(const key of b.sectionOrder||['Hero','TwoWorlds','About','Reviews','Brands','Contact']){if(key==='Hero')continue;const node=document.querySelector('[data-raf-section="'+CSS.escape(key)+'"]')||custom[key];if(node)main.appendChild(node)}for(const x of b.customSections||[])if(!(b.sectionOrder||[]).includes(x.id)&&custom[x.id])main.appendChild(custom[x.id])}
 renderLegacyClones(b);renderV76Clones(b);applyFlow(b);window.dispatchEvent(new CustomEvent('raf:renderer900-structure'))
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
 state=cp(s||{});document.documentElement.dataset.rafRenderer='9.0.0';renderStructure(state);
 for(const el of $$('[data-home-text],[data-site-text],#heroK,#heroT,#heroD'))applyLegacyText(el,state);
 for(const el of $$('[data-home-media]'))applyLegacyMedia(el,state);
 for(const el of $$('[data-raf-element]'))applyBuilderElement(el,state);
 for(const el of $$('[data-raf-section],header.hero'))applySection(el,state);
 applyFreeLayout(state);
 ready=true;if(!EDITOR)requestAnimationFrame(()=>requestAnimationFrame(()=>window.rafReleasePublicBoot?.()));window.dispatchEvent(new CustomEvent('raf:renderer900-applied',{detail:{device:device(),editor:EDITOR}}));
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
