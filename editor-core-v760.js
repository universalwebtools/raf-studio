// RAF.studio — unified visual core v7.7.0
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';

const db=getDatabase(getApp());
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const cp=x=>structuredClone(x??{});
const queryDevice=()=>new URLSearchParams(location.search).get('device');
const dev=()=>queryDevice()|| (innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop');
const TEXT='[data-home-text],#heroK,#heroT,#heroD,[data-custom62="title"],[data-custom62="text"]';
const CAND=TEXT+',[data-raf-free],[data-raf-element]:not(.nav):not(.navlinks):not(.brand),[data-home-media],[data-raf-section],header.hero,.actions,.contactActions,.facts>.card,.offerCard54,.googleSummary54,.reviewCard54,.trustedLogo54,.raf-custom-section,[data-custom62="button"],[data-custom62="image"],[data-custom62="video"],[data-raf-v76-clone]';
const ROOT='website/public/editorDraft/builder';
const SNAP_DISTANCE=7;
const MIN_SIZE=24;

let layout={desktop:{},tablet:{},mobile:{}};
let clones=[];
let sel=new Set();
let overlay=null,guides=null,drag=null,marq=null,saveTimer=null,decorTimer=null;
let undo=[],redo=[],lastAt=0,renderingClones=false,migrationDirty=false;

function baseCfg(){return{x:0,y:0,width:null,height:null,rotate:0,z:0,hidden:false,locked:false,group:'',label:'',crop:null,src:''}}
function css(){
 if($('#core760css'))return;
 const s=document.createElement('style');s.id='core760css';
 s.textContent=
 'body.raf-e3 .rbox3{display:none!important}'+
 'body.raf-e3 [data-raf-v72-id]{cursor:move}'+
 'body.raf-e3 [data-raf-v72-id].v72sel{outline:2px solid #22a8ff!important;outline-offset:3px}'+
 'body.raf-e3 [data-raf-v72-id].v72grp{box-shadow:0 0 0 1px #b54cff77 inset}'+
 'body.raf-e3 [data-raf-v72-id].v760locked{cursor:not-allowed}'+
 '#v72box{position:absolute;z-index:1000013;border:2px solid #22a8ff;box-sizing:border-box;pointer-events:none}'+
 '#v72box.multi{border-color:#ad45eb}'+
 '#v72move,#v72rotate,.v760handle{position:absolute;pointer-events:auto;touch-action:none;user-select:none}'+
 '#v72move{left:4px;top:-31px;background:#168ee6;color:#fff;border-radius:7px;padding:5px 9px;font:700 11px system-ui;cursor:move;white-space:nowrap}'+
 '#v72box.multi #v72move{background:#9835d5}'+
 '#v72rotate{left:50%;top:-48px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#fff;border:2px solid #22a8ff;cursor:grab}'+
 '#v72rotate:after{content:"";position:absolute;width:1px;height:16px;background:#22a8ff;left:50%;top:14px}'+
 '.v760handle{width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid #22a8ff;margin:-7px}'+
 '.v760handle[data-dir="nw"]{left:0;top:0;cursor:nwse-resize}.v760handle[data-dir="n"]{left:50%;top:0;cursor:ns-resize}.v760handle[data-dir="ne"]{left:100%;top:0;cursor:nesw-resize}'+
 '.v760handle[data-dir="e"]{left:100%;top:50%;cursor:ew-resize}.v760handle[data-dir="se"]{left:100%;top:100%;cursor:nwse-resize}.v760handle[data-dir="s"]{left:50%;top:100%;cursor:ns-resize}'+
 '.v760handle[data-dir="sw"]{left:0;top:100%;cursor:nesw-resize}.v760handle[data-dir="w"]{left:0;top:50%;cursor:ew-resize}'+
 '.v72marq{position:fixed;z-index:1000014;border:1px solid #22a8ff;background:#22a8ff20;pointer-events:none}'+
 '.v72multi{border-bottom:1px solid #ffffff16;padding-bottom:12px;margin-bottom:12px}.v72multi small{color:#76cfff}'+
 '.v72grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:7px}.v72grid button{padding:7px!important}'+
 '#v760guides{position:fixed;inset:0;z-index:1000015;pointer-events:none}#v760guides .v760line{position:fixed;display:none;background:#ff3aa6;box-shadow:0 0 0 1px #ff3aa633,0 0 8px #ff3aa688}'+
 '#v760guides .v760line.v{width:1px}#v760guides .v760line.h{height:1px}#v760guideLabel{position:fixed;display:none;padding:3px 6px;border-radius:5px;background:#ff3aa6;color:#fff;font:800 9px/1 system-ui;letter-spacing:.08em;white-space:nowrap;box-shadow:0 3px 12px #0008}'+
 'body.raf-preview64 #v72box,body.raf-preview64 .v72marq,body.raf-preview64 #v760guides{display:none!important}';
 document.head.appendChild(s)
}

function pathKey(el){
 const a=[];let n=el;
 while(n&&n!==document.body&&a.length<6){
  const p=n.parentElement;if(!p)break;
  const same=[...p.children].filter(x=>x.tagName===n.tagName);
  a.unshift(n.tagName.toLowerCase()+(same.length>1?':'+same.indexOf(n):''));
  if(n.matches('[data-raf-section],header.hero'))break;n=p
 }
 return a.join('>')
}
function legacyId(el){return'dom:'+pathKey(el)}
function clonePart(el,root){const a=[];let n=el;while(n&&n!==root){const p=n.parentElement;if(!p)break;const same=[...p.children].filter(x=>x.tagName===n.tagName);a.unshift(n.tagName.toLowerCase()+':'+same.indexOf(n));n=p}return'clonepart:'+root.dataset.rafV76Clone+':'+a.join('>')}
function id(el){
 if(!el)return'';
 if(el.dataset.rafV72Id)return el.dataset.rafV72Id;
 let k='';
 const cloneRoot=el.closest?.('[data-raf-v76-clone]');
 if(cloneRoot&&cloneRoot!==el)k=clonePart(el,cloneRoot);
 else if(el.dataset.rafV76Clone)k='clone:'+el.dataset.rafV76Clone;
 else if(el.dataset.rafV7Id)k=el.dataset.rafV7Id;
 else if(['heroK','heroT','heroD'].includes(el.id))k='tx:'+el.id;
 else if(el.dataset.homeText)k='tx:'+el.dataset.homeText;
 else if(el.dataset.custom62Id&&el.dataset.custom62)k='cs:'+el.dataset.custom62Id+':'+el.dataset.custom62;
 else if(el.dataset.homeMedia)k='media:'+el.dataset.homeMedia;
 else if(el.dataset.rafElement)k='el:'+el.dataset.rafElement;
 else if(el.matches('header.hero'))k='section:Hero';
 else if(el.dataset.rafSection)k='section:'+el.dataset.rafSection;
 else if(el.classList.contains('actions'))k='group:heroActions';
 else if(el.classList.contains('contactActions'))k='group:contactActions';
 else if(el.matches('.facts>.card'))k='about:fact:'+[...el.parentElement.children].indexOf(el);
 else if(el.dataset.offerIndex!=null)k='offer:'+el.dataset.offerIndex;
 else if(el.dataset.reviewIndex!=null)k='review:'+el.dataset.reviewIndex;
 else if(el.dataset.brandIndex!=null)k='brand:'+el.dataset.brandIndex;
 else k=legacyId(el);
 el.dataset.rafV72Id=k;
 return k
}
function ownCfg(k,el){
 const d=dev();layout[d]||={};
 if(!layout[d][k]&&el&&el.dataset.rafV7Id){
  const old=legacyId(el);
  if(layout[d][old]){layout[d][k]=cp(layout[d][old]);migrationDirty=true}
 }
 layout[d][k]=layout[d][k]||{};
 return layout[d][k]
}
function cfg(k,el){const d=dev(),own=ownCfg(k,el),desk=layout.desktop?.[k]||{};return d==='desktop'?{...baseCfg(),...own}:{...baseCfg(),...desk,...own}}
function cropApply(el,c){
 if(!(el instanceof HTMLImageElement)||!c)return;
 if(c.src)el.src=c.src;
 if(el.dataset.homeMedia)el.style.transform='none';
 el.style.objectFit=c.fit||'cover';
 el.style.objectPosition=(Number(c.x??50))+'% '+(Number(c.y??50))+'%';
 el.style.transformOrigin=(Number(c.x??50))+'% '+(Number(c.y??50))+'%';
 el.style.scale=String(Math.max(.1,Number(c.zoom)||1));
 if((Number(c.zoom)||1)>1&&el.parentElement)el.parentElement.style.overflow='hidden'
}
function apply(el){
 const c=cfg(id(el),el);
 el.style.position='relative';
 el.style.left=(Number(c.x)||0)+'px';el.style.top=(Number(c.y)||0)+'px';
 if(c.width>0){el.style.boxSizing='border-box';el.style.width=c.width+'px';el.style.maxWidth=c.width+'px'}else if(c.width===null){el.style.removeProperty('width');el.style.removeProperty('max-width')}
 if(c.height>0){el.style.boxSizing='border-box';el.style.height=c.height+'px'}else if(c.height===null)el.style.removeProperty('height');
 el.style.rotate=(Number(c.rotate)||0)+'deg';
 if(c.z)el.style.zIndex=String(c.z);
 if(c.src&&el instanceof HTMLImageElement)el.src=c.src;
 cropApply(el,c.crop);
 if(c.hidden){el.dataset.v72hidden='1';el.style.display='none'}else if(el.dataset.v72hidden==='1'){el.style.removeProperty('display');el.dataset.v72hidden='0'}
 el.classList.toggle('v72grp',!!c.group);el.classList.toggle('v760locked',!!c.locked)
}
function cleanClone(node,cloneId){
 const all=[node,...node.querySelectorAll('*')];
 all.forEach((x,i)=>{
  x.classList.remove('v72sel','rsel','sel55','pro61-selected','custom62-selected','v72grp','v760locked');
  x.removeAttribute('contenteditable');x.removeAttribute('data-raf-v72-id');x.removeAttribute('data-e3bound');
  if(x.id)x.removeAttribute('id');
  if(i===0){
   x.dataset.rafV76Clone=cloneId;x.dataset.rafFree='1';
   for(const p of ['position','left','top','width','max-width','height','z-index','display','rotate','scale','outline'])x.style.removeProperty(p)
  }
 });
 return node
}
function findById(k){return $$('[data-raf-v72-id],'+CAND).find(x=>id(x)===k)||null}
function renderClones(){
 if(renderingClones)return;renderingClones=true;
 try{
  for(const d of clones){
   if($('[data-raf-v76-clone="'+CSS.escape(d.id)+'"]'))continue;
   const source=findById(d.sourceId);if(!source?.parentElement||!d.html)continue;
   const t=document.createElement('template');t.innerHTML=d.html.trim();const node=t.content.firstElementChild;if(!node)continue;
   cleanClone(node,d.id);source.insertAdjacentElement('afterend',node);id(node);apply(node)
  }
 }finally{renderingClones=false}
}
function decorate(){
 css();
 $$(CAND).forEach(el=>{if(el.closest('#rafTop3,#rafPanel3,#rafProModal61,#tpl752,#widgetsModal770,#v72box,#v760layers,#v760menu,#v760history'))return;id(el);apply(el)});
 renderClones();
 if(migrationDirty){migrationDirty=false;save()}
}

function emit(type='selection'){window.dispatchEvent(new CustomEvent('raf:v760-'+type,{detail:{ids:[...sel].map(id),elements:[...sel]}}))}
function clear(){sel.forEach(x=>x.classList.remove('v72sel'));sel.clear();boxUpdate();emit()}
function add(el){
 if(!el||!el.isConnected)return;
 for(const x of [...sel])if(x!==el&&x.contains(el)){sel.delete(x);x.classList.remove('v72sel')}
 for(const x of sel)if(x!==el&&el.contains(x))return;
 sel.add(el);el.classList.add('v72sel')
}
function select(el,append=false){
 if(!el)return;if(!append)clear();
 const g=cfg(id(el),el).group;
 if(g)$$('[data-raf-v72-id]').forEach(x=>{if(cfg(id(x),x).group===g)add(x)});else add(el);
 panel();boxUpdate();emit()
}
function bounds(){
 const rs=[...sel].filter(x=>x.isConnected&&x.getClientRects().length).map(x=>x.getBoundingClientRect());
 if(!rs.length)return null;
 const left=Math.min(...rs.map(x=>x.left)),top=Math.min(...rs.map(x=>x.top)),right=Math.max(...rs.map(x=>x.right)),bottom=Math.max(...rs.map(x=>x.bottom));
 return{left,top,right,bottom,width:right-left,height:bottom-top}
}
const rectData=r=>({left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height});
function contentRect(el){
 const r=el.getBoundingClientRect(),c=getComputedStyle(el),n=x=>parseFloat(x)||0;
 const left=r.left+n(c.borderLeftWidth)+n(c.paddingLeft),top=r.top+n(c.borderTopWidth)+n(c.paddingTop),right=r.right-n(c.borderRightWidth)-n(c.paddingRight),bottom=r.bottom-n(c.borderBottomWidth)-n(c.paddingBottom);
 return{left,top,right,bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top)}
}
function snapTargets(){
 const moving=[...sel].filter(x=>x.isConnected),movingSet=new Set(moving),scopeSet=new Set(moving.map(x=>x.closest('[data-raf-section],header.hero')).filter(Boolean)),scope=scopeSet.size===1?[...scopeSet][0]:null,targets=[];
 $$('[data-raf-v72-id]').forEach(el=>{
  if(movingSet.has(el)||!el.isConnected||!el.getClientRects().length)return;
  if(scope&&el.closest('[data-raf-section],header.hero')!==scope)return;
  if(moving.some(x=>x.contains(el)||el.contains(x)))return;
  const r=el.getBoundingClientRect();if(r.width>0&&r.height>0)targets.push({rect:rectData(r),source:'element'})
 });
 const containers=new Set();
 moving.forEach(el=>{if(el.parentElement&&el.parentElement!==document.body)containers.add(el.parentElement);const a=el.closest('article,.card,[data-raf-free]');if(a&&!movingSet.has(a))containers.add(a)});
 if(scope&&!movingSet.has(scope))containers.add(scope);
 containers.forEach(el=>{if(!el.isConnected||!el.getClientRects().length)return;const r=contentRect(el);if(r.width>0&&r.height>0)targets.push({rect:r,source:el===scope?'section':'container'})});
 return targets
}
function axisAnchors(rect,axis){return axis==='x'?[{v:rect.left,role:'start'},{v:rect.left+rect.width/2,role:'center'},{v:rect.right,role:'end'}]:[{v:rect.top,role:'start'},{v:rect.top+rect.height/2,role:'center'},{v:rect.bottom,role:'end'}]}
function bestAxisSnap(axis,box,targets){
 let best=null;const own=axisAnchors(box,axis);
 for(const target of targets)for(const a of own)for(const b of axisAnchors(target.rect,axis)){
  const same=a.role===b.role,adjacent=target.source==='element'&&((a.role==='start'&&b.role==='end')||(a.role==='end'&&b.role==='start'));
  if(!same&&!adjacent)continue;
  const delta=b.v-a.v,distance=Math.abs(delta);if(distance>SNAP_DISTANCE)continue;
  const priority=same?0:1;
  if(!best||distance<best.distance-.01||(Math.abs(distance-best.distance)<.01&&priority<best.priority)){
   const snapped={...box};if(axis==='x'){snapped.left+=delta;snapped.right+=delta}else{snapped.top+=delta;snapped.bottom+=delta}
   best={delta,distance,priority,pos:b.v,source:target.source,target:target.rect,box:snapped}
  }
 }
 return best
}
function snapMove(box,dx,dy,targets){
 const raw={left:box.left+dx,top:box.top+dy,right:box.right+dx,bottom:box.bottom+dy,width:box.width,height:box.height};
 const x=bestAxisSnap('x',raw,targets),y=bestAxisSnap('y',raw,targets);
 return{dx:x?.delta||0,dy:y?.delta||0,x,y}
}
function guideEnsure(){
 if(guides?.isConnected)return guides;
 guides=document.createElement('div');guides.id='v760guides';
 guides.innerHTML='<div id="v760guideV" class="v760line v"></div><div id="v760guideH" class="v760line h"></div><div id="v760guideLabel"></div>';
 document.body.appendChild(guides);return guides
}
function guideHide(){if(guides)guides.querySelectorAll('.v760line,#v760guideLabel').forEach(x=>x.style.display='none')}
function guideShow(s){
 const g=guideEnsure(),v=$('#v760guideV',g),h=$('#v760guideH',g),lab=$('#v760guideLabel',g);
 if(s.x){const from=Math.min(s.x.box.top,s.x.target.top)-10,to=Math.max(s.x.box.bottom,s.x.target.bottom)+10;Object.assign(v.style,{display:'block',left:s.x.pos+'px',top:Math.max(0,from)+'px',height:Math.max(1,to-Math.max(0,from))+'px'})}else v.style.display='none';
 if(s.y){const from=Math.min(s.y.box.left,s.y.target.left)-10,to=Math.max(s.y.box.right,s.y.target.right)+10;Object.assign(h.style,{display:'block',left:Math.max(0,from)+'px',top:s.y.pos+'px',width:Math.max(1,to-Math.max(0,from))+'px'})}else h.style.display='none';
 if(s.x||s.y){lab.textContent=(s.x?.source==='section'||s.y?.source==='section')?'ŚRODEK / KRAWĘDŹ SEKCJI':'WYRÓWNANIE';lab.style.left=Math.max(4,Math.min(innerWidth-150,(s.x?.pos??s.y?.box.left??0)+7))+'px';lab.style.top=Math.max(4,Math.min(innerHeight-24,(s.y?.pos??s.x?.box.top??0)+7))+'px';lab.style.display='block'}else lab.style.display='none'
}

function boxEnsure(){
 if(overlay?.isConnected)return overlay;
 overlay=document.createElement('div');overlay.id='v72box';
 overlay.innerHTML='<div id="v72move">✥ PRZESUŃ</div><div id="v72rotate" title="Obrót"></div>'+['nw','n','ne','e','se','s','sw','w'].map(d=>'<div class="v760handle" data-dir="'+d+'"></div>').join('');
 document.body.appendChild(overlay);
 $('#v72move').onpointerdown=beginMove;$('#v72rotate').onpointerdown=beginRotate;
 $$('.v760handle',overlay).forEach(h=>h.onpointerdown=beginResize);
 return overlay
}
function boxUpdate(){
 const b=bounds();
 if(!b||document.body.classList.contains('raf-preview64')){overlay?.remove();overlay=null;return}
 const o=boxEnsure();o.classList.toggle('multi',sel.size>1);
 Object.assign(o.style,{left:b.left+scrollX+'px',top:b.top+scrollY+'px',width:b.width+'px',height:b.height+'px'});
 $('#v72move').textContent=sel.size>1?'✥ PRZESUŃ '+sel.size+' ELEMENTY':'✥ PRZESUŃ';
 $$('.v760handle,#v72rotate',o).forEach(x=>x.style.display=sel.size===1?'block':'none')
}
function stateShot(){return{layout:cp(layout),clones:cp(clones)}}
function restoreState(x){layout=cp(x.layout||{});clones=cp(x.clones||[]);applyAll();save()}
function commit(){undo.push(stateShot());if(undo.length>80)undo.shift();redo=[];lastAt=Date.now();window.dispatchEvent(new CustomEvent('raf:history-source',{detail:{source:'core',at:lastAt}}))}
function save(){
 clearTimeout(saveTimer);const l=cp(layout),c=cp(clones);
 saveTimer=setTimeout(()=>Promise.all([set(ref(db,ROOT+'/freeLayoutV7'),l),set(ref(db,ROOT+'/clonesV76'),c)]).then(()=>{const s=$('#rafStatus3');if(s)s.textContent='✓ Wersja robocza zapisana'}).catch(console.error),140);
 const s=$('#rafStatus3');if(s)s.textContent='● Zmiany robocze';emit('change')
}
function applyAll(){decorate();boxUpdate();panel();emit('change')}
function undoNow(){if(!undo.length)return false;redo.push(stateShot());restoreState(undo.pop());lastAt=Date.now();return true}
function redoNow(){if(!redo.length)return false;undo.push(stateShot());restoreState(redo.pop());lastAt=Date.now();return true}

function beginMove(e){
 if(!sel.size)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();commit();
 const items=[...sel].filter(x=>!cfg(id(x),x).locked).map(el=>({el,k:id(el),x:Number(cfg(id(el),el).x)||0,y:Number(cfg(id(el),el).y)||0}));
 drag={mode:'move',pid:e.pointerId,sx:e.clientX,sy:e.clientY,items,startBox:bounds(),targets:snapTargets()};
 try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
}
function beginResize(e){
 if(sel.size!==1)return;const el=[...sel][0],c=cfg(id(el),el);if(c.locked)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();commit();
 const r=el.getBoundingClientRect(),w=el.offsetWidth||r.width,h=el.offsetHeight||r.height;
 drag={mode:'resize',dir:e.currentTarget.dataset.dir,pid:e.pointerId,sx:e.clientX,sy:e.clientY,el,k:id(el),x:Number(c.x)||0,y:Number(c.y)||0,w,h,ratio:w/Math.max(1,h),media:el.matches('img,video')};
 try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
}
function beginRotate(e){
 if(sel.size!==1)return;const el=[...sel][0],c=cfg(id(el),el);if(c.locked)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();commit();
 const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 drag={mode:'rotate',pid:e.pointerId,el,k:id(el),cx,cy,start:Number(c.rotate)||0,angle:Math.atan2(e.clientY-cy,e.clientX-cx)};
 try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
}
function resizeLive(e){
 const d=drag,dir=d.dir,dx=e.clientX-d.sx,dy=e.clientY-d.sy;
 let nw=d.w+(dir.includes('e')?dx:dir.includes('w')?-dx:0),nh=d.h+(dir.includes('s')?dy:dir.includes('n')?-dy:0);
 if(e.altKey){nw=d.w+(dir.includes('e')?2*dx:dir.includes('w')?-2*dx:0);nh=d.h+(dir.includes('s')?2*dy:dir.includes('n')?-2*dy:0)}
 const corner=dir.length===2,preserve=(corner&&d.media)||e.shiftKey;
 if(preserve){
  const byW=Math.abs((nw-d.w)/Math.max(1,d.w))>=Math.abs((nh-d.h)/Math.max(1,d.h));
  if(byW)nh=nw/d.ratio;else nw=nh*d.ratio
 }
 nw=Math.max(MIN_SIZE,nw);nh=Math.max(MIN_SIZE,nh);
 let ox=dir.includes('w')?d.w-nw:0,oy=dir.includes('n')?d.h-nh:0;
 if(e.altKey){ox=(d.w-nw)/2;oy=(d.h-nh)/2}
 const c=ownCfg(d.k,d.el);c.x=d.x+ox;c.y=d.y+oy;c.width=Math.round(nw*100)/100;c.height=Math.round(nh*100)/100;apply(d.el)
}
function group(){if(sel.size<2)return;commit();const g='g760_'+Date.now().toString(36);sel.forEach(x=>{ownCfg(id(x),x).group=g;apply(x)});save();panel()}
function ungroup(){if(!sel.size)return;commit();sel.forEach(x=>{ownCfg(id(x),x).group='';apply(x)});save();panel()}
function nudge(dx,dy){if(!sel.size)return;commit();sel.forEach(x=>{const v=cfg(id(x),x),c=ownCfg(id(x),x);if(!v.locked){c.x=(Number(v.x)||0)+dx;c.y=(Number(v.y)||0)+dy;apply(x)}});save();boxUpdate();panel()}
function align(m){
 const b=bounds();if(!b)return;commit();
 sel.forEach(el=>{const r=el.getBoundingClientRect(),v=cfg(id(el),el),c=ownCfg(id(el),el);if(v.locked)return;c.x=Number(v.x)||0;c.y=Number(v.y)||0;if(m==='left')c.x+=b.left-r.left;if(m==='center')c.x+=(b.left+b.width/2)-(r.left+r.width/2);if(m==='right')c.x+=b.right-r.right;if(m==='top')c.y+=b.top-r.top;if(m==='middle')c.y+=(b.top+b.height/2)-(r.top+r.height/2);if(m==='bottom')c.y+=b.bottom-r.bottom;apply(el)});
 save();boxUpdate();panel()
}
function panel(){
 const p=$('#rafPanel3');if(!p||!sel.size)return;
 $('#v72panel')?.remove();const d=document.createElement('div');d.id='v72panel';d.className='v72multi';
 d.innerHTML='<small>V7.7 CORE • '+(sel.size===1?'ELEMENT':'MULTI-SELECT')+'</small><h3>'+(sel.size===1?id([...sel][0]):sel.size+' elementy')+'</h3><div class="v72grid"><button data-a="left">← Lewo</button><button data-a="center">↔ Środek</button><button data-a="right">Prawo →</button><button data-a="top">↑ Góra</button><button data-a="middle">↕ Środek</button><button data-a="bottom">↓ Dół</button><button id="v72g">Grupuj</button><button id="v72ug">Rozgrupuj</button><button id="v72reset">Reset XY</button></div><div style="font-size:9px;color:#777;margin-top:8px">Uchwyty: rogi, boki i obrót • Shift = proporcje • Alt = od środka<br>Linie + magnes • Alt podczas ruchu = bez magnesu</div>';
 p.prepend(d);$$('[data-a]',d).forEach(x=>x.onclick=()=>align(x.dataset.a));$('#v72g').onclick=group;$('#v72ug').onclick=ungroup;$('#v72reset').onclick=()=>patchSelected({x:0,y:0});
 p.classList.add('raf-panel-open62');p.style.display='block'
}
function cand(e){return e.target.closest?.('[data-raf-v72-id]')||e.target.closest?.(CAND)}
function hits(l,t,r,b){
 const a=$$(CAND).filter(el=>{if(el.closest('#rafTop3,#rafPanel3,#rafProModal61,#tpl752,#widgetsModal770,#v72box,#v760layers,#v760menu,#v760history'))return false;const q=el.getBoundingClientRect();return q.width&&q.height&&q.right>=l&&q.left<=r&&q.bottom>=t&&q.top<=b});
 return a.filter(el=>!a.some(o=>o!==el&&el.contains(o)))
}

function safeHtml(el,cloneId){const n=cleanClone(el.cloneNode(true),cloneId);return n.outerHTML}
function duplicateSelected(offset=20){
 if(!sel.size)return[];commit();const made=[];
 for(const source of [...sel]){
  const sourceId=id(source),cloneId='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),def={id:cloneId,sourceId,html:safeHtml(source,cloneId),createdAt:Date.now()};
  clones.push(def);renderClones();const node=$('[data-raf-v76-clone="'+CSS.escape(cloneId)+'"]');if(!node)continue;
  const from=cfg(sourceId,source),to=ownCfg('clone:'+cloneId,node);Object.assign(to,cp(from),{x:(Number(from.x)||0)+offset,y:(Number(from.y)||0)+offset,group:'',locked:false,hidden:false});apply(node);made.push(node)
 }
 sel.forEach(x=>x.classList.remove('v72sel'));sel.clear();made.forEach(add);save();panel();boxUpdate();emit();return made
}
function copySelected(){
 const ids=[...sel].map(id);if(!ids.length)return false;
 try{sessionStorage.setItem('rafClipboard760',JSON.stringify({ids,at:Date.now()}))}catch{}
 return true
}
function pasteClipboard(){let x;try{x=JSON.parse(sessionStorage.getItem('rafClipboard760')||'null')}catch{}if(!x?.ids?.length)return false;const old=[...sel];clear();x.ids.map(findById).filter(Boolean).forEach(add);const made=duplicateSelected(24);clear();made.forEach(add);panel();boxUpdate();emit();if(!made.length)old.forEach(add);return!!made.length}
function copyStyle(){if(sel.size!==1)return false;const el=[...sel][0],c=cp(cfg(id(el),el));for(const k of ['x','y','z','hidden','locked','group','label'])delete c[k];try{sessionStorage.setItem('rafStyleClipboard760',JSON.stringify(c))}catch{}return true}
function pasteStyle(){let s;try{s=JSON.parse(sessionStorage.getItem('rafStyleClipboard760')||'null')}catch{}if(!s||!sel.size)return false;commit();sel.forEach(el=>{Object.assign(ownCfg(id(el),el),cp(s));apply(el)});save();boxUpdate();return true}
function patchSelected(patch,{commitNow=true}={}){if(!sel.size)return;if(commitNow)commit();sel.forEach(el=>{Object.assign(ownCfg(id(el),el),cp(patch));apply(el)});save();boxUpdate();panel();emit()}
function patchOne(el,patch,{commitNow=true}={}){if(!el)return;if(commitNow)commit();Object.assign(ownCfg(id(el),el),cp(patch));apply(el);save();boxUpdate();emit('change')}
function toggleLocked(){if(!sel.size)return;const on=!cfg(id([...sel][0]),[...sel][0]).locked;patchSelected({locked:on})}
function toggleHidden(){if(!sel.size)return;const on=!cfg(id([...sel][0]),[...sel][0]).hidden;patchSelected({hidden:on})}
function zOrder(mode){if(!sel.size)return;const values=Object.values(layout[dev()]||{}).map(x=>Number(x.z)||0),max=Math.max(0,...values),min=Math.min(0,...values);patchSelected({z:mode==='front'?max+1:min-1})}
function resetTransform(){patchSelected({x:0,y:0,width:null,height:null,rotate:0})}
function rename(label){patchSelected({label:String(label||'').slice(0,80)})}
function list(){
 decorate();const out=[],seen=new Set();
 for(const el of $$('[data-raf-v72-id]')){const k=id(el);if(seen.has(k)||el.closest('#rafTop3,#rafPanel3,#rafProModal61,#tpl752,#widgetsModal770,#v72box,#v760layers,#v760menu,#v760history'))continue;seen.add(k);const c=cfg(k,el),section=el.closest('[data-raf-section],header.hero'),sectionId=section?id(section):'page';out.push({id:k,el,cfg:c,sectionId,tag:el.tagName.toLowerCase(),label:c.label||el.getAttribute('aria-label')||el.alt||el.textContent?.trim().replace(/\s+/g,' ').slice(0,46)||k})}
 return out
}

window.addEventListener('pointerdown',e=>{
 if(e.button!==0||document.body.classList.contains('raf-crop-active')&&e.target.closest('img')||e.target.closest('#rafTop3,#rafPanel3,#rafProModal61,#tpl752,#widgetsModal770,input,textarea,select,[contenteditable="true"],#v72box,#v760layers,#v760menu,#v760history'))return;
 decorate();const el=cand(e);
 if(e.shiftKey){marq={pid:e.pointerId,sx:e.clientX,sy:e.clientY,startEl:el,moved:false,base:new Set(sel)};e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return}
 if(el){if(!sel.has(el))select(el,false);drag={mode:'pending',pid:e.pointerId,sx:e.clientX,sy:e.clientY,items:[...sel].filter(x=>!cfg(id(x),x).locked).map(x=>({el:x,k:id(x),x:Number(cfg(id(x),x).x)||0,y:Number(cfg(id(x),x).y)||0})),startBox:bounds(),targets:snapTargets()};return}
 if(e.target.closest('a,button,img,video,iframe'))return;clear();marq={pid:e.pointerId,sx:e.clientX,sy:e.clientY,startEl:null,moved:false,base:new Set()};e.preventDefault()
},true);
window.addEventListener('pointermove',e=>{
 if(marq&&e.pointerId===marq.pid){
  const dx=e.clientX-marq.sx,dy=e.clientY-marq.sy;if(!marq.moved&&Math.hypot(dx,dy)>4){marq.moved=true;const m=document.createElement('div');m.className='v72marq';m.id='v72marq';document.body.appendChild(m)}
  if(marq.moved){const l=Math.min(marq.sx,e.clientX),t=Math.min(marq.sy,e.clientY),r=Math.max(marq.sx,e.clientX),b=Math.max(marq.sy,e.clientY),m=$('#v72marq');Object.assign(m.style,{left:l+'px',top:t+'px',width:r-l+'px',height:b-t+'px'});sel.forEach(x=>x.classList.remove('v72sel'));sel=new Set(marq.base);sel.forEach(x=>x.classList.add('v72sel'));hits(l,t,r,b).forEach(add);boxUpdate();e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}return
 }
 if(!drag||e.pointerId!==drag.pid)return;
 if(drag.mode==='pending'){if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<4)return;commit();drag.mode='move'}
 if(drag.mode==='move'){
  let dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(!e.altKey&&drag.startBox){const s=snapMove(drag.startBox,dx,dy,drag.targets||[]);dx+=s.dx;dy+=s.dy;guideShow(s)}else guideHide();
  drag.items.forEach(i=>{const c=ownCfg(i.k,i.el);c.x=i.x+dx;c.y=i.y+dy;apply(i.el)});boxUpdate();e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()
 }else if(drag.mode==='resize'){guideHide();resizeLive(e);boxUpdate();e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
 else if(drag.mode==='rotate'){const c=ownCfg(drag.k,drag.el),a=Math.atan2(e.clientY-drag.cy,e.clientX-drag.cx);c.rotate=drag.start+(a-drag.angle)*180/Math.PI;if(e.shiftKey)c.rotate=Math.round(c.rotate/15)*15;apply(drag.el);boxUpdate();e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
},true);
function finishPointer(e){
 if(marq&&e.pointerId===marq.pid){if(!marq.moved&&marq.startEl){if(sel.has(marq.startEl)){sel.delete(marq.startEl);marq.startEl.classList.remove('v72sel')}else add(marq.startEl)}$('#v72marq')?.remove();marq=null;panel();boxUpdate();guideHide();emit();e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return}
 if(drag&&e.pointerId===drag.pid){if(['move','resize','rotate'].includes(drag.mode))save();drag=null;panel();boxUpdate();guideHide();emit()}
}
window.addEventListener('pointerup',finishPointer,true);
window.addEventListener('pointercancel',e=>{finishPointer(e);guideHide()},true);
document.addEventListener('keydown',e=>{
 if(e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='g'){e.preventDefault();e.shiftKey?ungroup():group();return}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z')return;
 if(!sel.size)return;const s=e.shiftKey?10:1;
 if(e.key==='ArrowLeft'){e.preventDefault();nudge(-s,0)}if(e.key==='ArrowRight'){e.preventDefault();nudge(s,0)}if(e.key==='ArrowUp'){e.preventDefault();nudge(0,-s)}if(e.key==='ArrowDown'){e.preventDefault();nudge(0,s)}
},true);
addEventListener('scroll',boxUpdate,{passive:true});addEventListener('resize',()=>{decorate();boxUpdate()},{passive:true});
new MutationObserver(()=>{clearTimeout(decorTimer);decorTimer=setTimeout(()=>{decorate();boxUpdate();emit('layers')},100)}).observe(document.body,{subtree:true,childList:true});
window.addEventListener('raf:history-main',e=>{const n=e.detail?.builder;if(n?.freeLayoutV7){layout=cp(n.freeLayoutV7);clones=cp(n.clonesV76||[]);applyAll()}});

(async()=>{
 const [d,p,dc,pc]=await Promise.all([get(ref(db,ROOT+'/freeLayoutV7')),get(ref(db,'website/public/builder/freeLayoutV7')),get(ref(db,ROOT+'/clonesV76')),get(ref(db,'website/public/builder/clonesV76'))]);
 layout=cp(d.exists()?d.val():(p.val()||{desktop:{},tablet:{},mobile:{}}));clones=cp(dc.exists()?dc.val():(pc.val()||[]));decorate();
 window.rafCore760={
  undo:undoNow,redo:redoNow,canUndo:()=>undo.length>0,canRedo:()=>redo.length>0,lastAt:()=>lastAt,applyLayout:x=>{layout=cp(x||{});applyAll()},
  selected:()=>[...sel],selectElement:(el,append=false)=>select(el,append),selectById:k=>{const el=findById(k);if(el){select(el,false);if(!cfg(k,el).hidden)el.scrollIntoView({behavior:'smooth',block:'center'});return true}return false},clear,
  id,cfgFor:el=>cfg(id(el),el),list,save,checkpoint:commit,patchSelected,patchOne,duplicate:duplicateSelected,copy:copySelected,paste:pasteClipboard,copyStyle,pasteStyle,
  toggleLocked,toggleHidden,front:()=>zOrder('front'),back:()=>zOrder('back'),resetTransform,rename,device:dev,refresh:()=>{decorate();boxUpdate();emit('layers')}
 };
 window.rafCore72=window.rafCore760;
 window.dispatchEvent(new CustomEvent('raf:v760-ready'))
})().catch(e=>console.error('RAF core 7.6',e));
