// Shared document features. The editor and public renderer use the same model.
const q=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const containers=new Map(),instances=new Map();
export function templateDefaults(el,device='desktop'){
 const values=el?.__rafTemplateOverrides||{};return {...values.desktop,...(device!=='desktop'?values.tablet:{}),...(device==='mobile'?values.mobile:{})};
}
export const clone=x=>structuredClone(x??{});
export const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sanitize(root){
 for(const el of [root,...root.querySelectorAll('*')]){
  if(el.matches('script,object,embed,base,meta,link')){el.remove();continue}
  for(const a of [...el.attributes])if(/^on/i.test(a.name)||a.name==='srcdoc'||(['href','src','action'].includes(a.name)&&/^\s*(javascript|vbscript):/i.test(a.value)))el.removeAttribute(a.name);
  el.removeAttribute('contenteditable');el.classList.remove('v72sel','rsel','sel55','pro61-selected','v760locked','v72grp','v760moving');
 }
 return root;
}
function lookup(id){return all('[data-raf-v72-id]').find(el=>el.dataset.rafV72Id===id)}
function unwrap(entry){for(const {node,anchor,style} of entry.members){delete node.dataset.studioFreeX;delete node.dataset.studioFreeY;if(style===null)node.removeAttribute('style');else node.setAttribute('style',style);if(anchor.isConnected)anchor.replaceWith(node);else if(entry.el.isConnected)entry.el.before(node)}entry.el.remove()}
function renderContainers(defs,device){
 const wanted=new Map(defs.map(d=>[d.id,d]));
 for(const [id,entry] of [...containers].reverse())if(!wanted.has(id)||!entry.el.isConnected||entry.signature!==JSON.stringify(wanted.get(id).items)){unwrap(entry);containers.delete(id)}
 for(const def of defs){
  let entry=containers.get(def.id);
  if(!entry){
   const nodes=(def.items||[]).map(lookup);if(nodes.length<1||nodes.some(n=>!n))continue;
   const parent=nodes[0].parentElement;if(!parent||nodes.some(n=>n.parentElement!==parent))continue;
   const el=document.createElement('div');el.dataset.rafContainer=def.id;el.dataset.rafV72Id=def.id;el.dataset.rafLayout='1';el.setAttribute('aria-label',def.label||'Kontener');
   parent.insertBefore(el,nodes[0]);const members=nodes.map(node=>{const anchor=document.createComment('raf-container-origin');node.before(anchor);el.append(node);return{node,anchor,style:node.getAttribute('style')}});
   entry={el,members,signature:JSON.stringify(def.items),mode:''};containers.set(def.id,entry);
  }
  const c={...def,...def.breakpoints?.desktop,...(device==='mobile'?def.breakpoints?.tablet:{}),...def.breakpoints?.[device]},el=entry.el;
  // Restore only the placement properties owned by this runtime when leaving FREE.
  if(entry.mode==='free'&&c.mode!=='free')for(const {node} of entry.members){delete node.dataset.studioFreeX;delete node.dataset.studioFreeY;for(const p of ['position','left','top','width'])node.style.removeProperty(p)}
  entry.mode=c.mode;
  Object.assign(el.style,{display:c.mode==='grid'?'grid':c.mode==='free'?'block':'flex',position:'relative',flexDirection:c.direction||'column',flexWrap:c.wrap===false?'nowrap':'wrap',gap:(Number(c.gap)||0)+'px',padding:(Number(c.padding)||0)+'px',alignItems:c.align||'stretch',justifyContent:c.justify||'flex-start',gridTemplateColumns:'repeat('+Math.max(1,Math.min(12,Number(c.columns)||2))+',minmax(0,1fr))',minWidth:'0',height:c.mode==='free'?(Number(c.freeHeight)||200)+'px':'',minHeight:c.mode==='free'?'100px':''});
  if(c.mode==='free')for(const {node} of entry.members){const p=def.positions?.[node.dataset.rafV72Id]||{};node.dataset.studioFreeX=String(p.x||0);node.dataset.studioFreeY=String(p.y||0);Object.assign(node.style,{position:'absolute',left:(p.x||0)+'px',top:(p.y||0)+'px',width:p.width?p.width+'px':''})}
 }
}
function remapTemplate(root,instanceId){
 const oldIds=new Map();
 for(const [i,el] of [root,...root.querySelectorAll('*')].entries()){
  const local=el.dataset.rafTemplateNode||String(i);el.dataset.rafTemplateNode=local;
  el.dataset.rafV72Id='part:'+instanceId+':'+local;el.dataset.rafFree='1';
  if(el.id){oldIds.set(el.id,instanceId+'-'+el.id);el.id=instanceId+'-'+el.id}
  for(const a of ['data-home-text','data-home-media','data-site-text','data-raf-element','data-raf-v7-id','data-raf-v76-clone','data-custom-id'])el.removeAttribute(a);
 }
 for(const a of root.querySelectorAll('a[href^="#"]')){const id=a.getAttribute('href').slice(1);if(oldIds.has(id))a.setAttribute('href','#'+oldIds.get(id))}
 root.dataset.rafV72Id='section:'+instanceId;root.dataset.rafSection=instanceId;root.dataset.rafSavedSection=instanceId;
}
function renderSections(studio){
 const defs=studio.sections||[],wanted=new Set(defs.map(x=>x.id));
 for(const [id,entry] of instances)if(!wanted.has(id)){entry.el.remove();instances.delete(id)}
 for(const def of defs){
  const source=def.linked?studio.library?.[def.templateId]:def.snapshot;if(!source?.html)continue;
  const signature=JSON.stringify([source.html,source.revision]);let entry=instances.get(def.id);
  if(entry?.el.isConnected&&entry.signature===signature)continue;
  const t=document.createElement('template');t.innerHTML=source.html;let el=t.content.firstElementChild;if(!el)continue;sanitize(el);remapTemplate(el,def.id);
  for(const node of [el,...el.querySelectorAll('*')]){const key=node.dataset.rafTemplateNode;node.__rafTemplateOverrides=Object.fromEntries(['desktop','tablet','mobile'].map(d=>[d,source.overrides?.[d]?.[key]||{}]));}
  if(entry?.el.isConnected)entry.el.replaceWith(el);else{const after=def.afterId&&lookup(def.afterId);if(after)after.after(el);else (q('#rafTemplate752')||q('#rafMain')||q('main'))?.append(el)}
  instances.set(def.id,{el,signature});
 }
}
const color=x=>/^#[\da-f]{3,8}$/i.test(x||'')?x:null;
const font=x=>String(x||'').replace(/[^\p{L}\p{N} ,_-]/gu,'').slice(0,100);
export function renderBrand(brand={}){
 let style=q('#rafBrand910');if(!style){style=document.createElement('style');style.id='rafBrand910';document.head.append(style)}
 if(!brand.enabled){if(style.textContent)style.textContent='';return}
 const scope=':is(#rafMain,#rafTemplate752,header.hero,.rafHeader900,.raf-footer,body>.footer)',text=scope+' :is(p,li,label,small)',heading=scope+' :is(h1,h2,h3,h4,h5,h6)',button=scope+' :is(.btn,[data-raf-widget-action])';
 const rules=[];const add=(s,props)=>{const css=Object.entries(props).filter(([,v])=>v!==null&&v!==undefined&&v!=='').map(([k,v])=>k+':'+v+' !important').join(';');if(css)rules.push(s+'{'+css+'}')};
 add(scope,{background:color(brand.background),color:color(brand.text),'font-family':font(brand.bodyFont)});
 add(text,{'font-family':font(brand.bodyFont),color:color(brand.text),'font-size':brand.bodySize?Number(brand.bodySize)+'px':null,'line-height':brand.lineHeight?Number(brand.lineHeight):null});
 add(heading,{'font-family':font(brand.headingFont),color:color(brand.heading)});
 for(const tag of ['h1','h2','h3'])add(scope+' '+tag,{'font-size':brand[tag]?`clamp(24px,${Number(brand[tag])/14}vw,${Number(brand[tag])}px)`:null});
 add(button,{background:color(brand.accent),color:color(brand.buttonText),'border-radius':brand.radius!=null?Number(brand.radius)+'px':null});
 if(brand.sectionGap!=null)add(scope+' :is(section,[data-raf-section])',{'padding-block':Number(brand.sectionGap)+'px'});
 const css=rules.join('\n');if(style.textContent!==css)style.textContent=css;
}
export function applyStudio(studio={},device='desktop',layout={}){
 renderSections(studio);const defs=(studio.containers||[]).map(def=>{const c={...layout.desktop?.[def.id],...(device==='mobile'?layout.tablet?.[def.id]:{}),...layout[device]?.[def.id]};return {...def,...c,mode:c.containerMode||def.mode}});renderContainers(defs,device);renderBrand(studio.brand||{});
}
