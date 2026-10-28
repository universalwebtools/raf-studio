// One crop renderer for the editor and published page. The existing <img>
// remains the frame: no wrapper changes template selectors, stable IDs or links.
const states=new WeakMap(), released=new Map();
const n=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function cropGeometry(width,height,naturalWidth,naturalHeight,crop={}){
 const w=Math.max(1,width),h=Math.max(1,height),nw=Math.max(1,naturalWidth),nh=Math.max(1,naturalHeight);
 const fit=crop.fit==='contain'?'contain':'cover';
 const factor=(fit==='contain'?Math.min(w/nw,h/nh):Math.max(w/nw,h/nh))*clamp(n(crop.zoom,1),.5,4);
 const imageWidth=nw*factor,imageHeight=nh*factor;
 return {width:w,height:h,imageWidth,imageHeight,left:(w-imageWidth)*clamp(n(crop.x,50),0,100)/100,top:(h-imageHeight)*clamp(n(crop.y,50),0,100)/100};
}
export function panCrop(crop,g,dx,dy){
 const axis=(value,delta,space)=>Math.abs(space)<.01?value:clamp(value+delta/space*100,0,100);
 return {...crop,x:axis(n(crop.x,50),dx,g.width-g.imageWidth),y:axis(n(crop.y,50),dy,g.height-g.imageHeight)};
}

function css(){
 if(document.getElementById('rafImageFrame893Css'))return;
 const style=document.createElement('style');style.id='rafImageFrame893Css';
 // Paint the source in the image's own content box instead of scaling its box.
 // Keep src/alt intact for loading, accessibility, galleries and downloading.
 style.textContent='img[data-raf-crop-render="1"]{object-fit:none!important;object-position:-1000000px -1000000px!important;background-repeat:no-repeat!important;background-origin:content-box!important;background-clip:content-box!important}'+
 '#rafTemplate752 .rw-hero-photo.raf-image-wide893{z-index:0}#rafTemplate752 .rw-hero-grid:has(.raf-image-wide893) .rw-hero-copy{position:relative;z-index:1}'+
 '@media print{img[data-raf-crop-render="1"]{print-color-adjust:exact;-webkit-print-color-adjust:exact}}';
 document.head.appendChild(style);
}
function releaseBounds(img,enabled){
 const wanted=new Set();
 if(enabled){
  const section=img.closest('[data-raf-section],header.hero');
  for(let p=img.parentElement;p&&p!==section&&p!==document.body;p=p.parentElement){
   const cs=getComputedStyle(p);
   if(released.has(p)||/(hidden|clip)/.test(cs.overflowX+' '+cs.overflowY))wanted.add(p);
  }
 }
 for(const [p,state] of released){
  for(const owner of state.owners)if(!owner.isConnected)state.owners.delete(owner);
  if(!wanted.has(p))state.owners.delete(img);
  if(!state.owners.size){for(const [key,[value,priority]] of Object.entries(state.original)){if(value)p.style.setProperty(key,value,priority);else p.style.removeProperty(key)}released.delete(p)}
 }
 for(const p of wanted){
  if(!released.has(p)){const original={};for(const key of ['overflow','overflow-x','overflow-y','min-width'])original[key]=[p.style.getPropertyValue(key),p.style.getPropertyPriority(key)];released.set(p,{original,owners:new Set()})}
  released.get(p).owners.add(img);p.style.setProperty('overflow','visible','important');p.style.setProperty('min-width','0','important');
 }
}
export function linearMatrix(el){
 let matrix=new DOMMatrix();
 for(let p=el;p&&p instanceof Element;p=p.parentElement){
  const cs=getComputedStyle(p),scale=cs.scale==='none'?[1,1]:cs.scale.split(' ').map(Number),angle=cs.rotate==='none'?0:parseFloat(cs.rotate.split(' ').at(-1));
  const zoom=parseFloat(cs.zoom)||1;
  let local=new DOMMatrix().scale(zoom).rotate(angle||0).scale(scale[0]||1,scale[1]??scale[0]??1);
  if(cs.transform!=='none'){const t=new DOMMatrix(cs.transform);t.e=0;t.f=0;local=local.multiply(t)}
  matrix=local.multiply(matrix);
 }
 return matrix;
}
export function imageMetrics(img,crop){
 const width=img.offsetWidth,height=img.offsetHeight,matrix=linearMatrix(img),rect=img.getBoundingClientRect();
 const corners=[[0,0],[width,0],[0,height],[width,height]].map(([x,y])=>matrix.transformPoint({x,y}));
 matrix.e=rect.left-Math.min(...corners.map(p=>p.x));matrix.f=rect.top-Math.min(...corners.map(p=>p.y));
 return {matrix,geometry:cropGeometry(width,height,img.naturalWidth,img.naturalHeight,crop)};
}
export function applyImageFrame(img,config={}){
 if(!(img instanceof HTMLImageElement))return false;
 css();
 let state=states.get(img);
 if(!state){
  const original={};for(const key of ['background-image','background-size','background-position','object-fit','object-position','transform'])original[key]=[img.style.getPropertyValue(key),img.style.getPropertyPriority(key)];
  state={original,config:{},painted:false};states.set(img,state);
  img.addEventListener('load',()=>{applyImageFrame(img,state.config);window.dispatchEvent(new Event('raf:image-frame-loaded'))});
 }
 state.config=config;
 const crop=config.crop;
 if(config.src&&img.getAttribute('src')!==config.src)img.src=config.src;
 else if(crop?.src&&img.getAttribute('src')!==crop.src)img.src=crop.src;
 const free=!!config.imageFrame||!!(Number(config.x)||Number(config.y)||config.width>0||config.height>0||Number(config.scale)&&Number(config.scale)!==1);
 img.dataset.rafFrameManaged=(free||crop)?'1':'0';
 releaseBounds(img,free);
 img.parentElement?.classList.toggle('raf-image-wide893',config.imageFrame==='page');
 img.style.transformOrigin='center center';img.style.scale=String(Math.max(.05,n(config.scale,1)));
 if(state.wasPage&&config.imageFrame!=='page'){
  if(!(config.width>0)){img.style.removeProperty('width');img.style.removeProperty('max-width')}
  if(!(config.height>0))img.style.removeProperty('height');
 }
 state.wasPage=config.imageFrame==='page';
 if(config.imageFrame==='page'){
  const parent=linearMatrix(img.parentElement),scale=Math.max(.05,Math.hypot(parent.a,parent.b));
  const width=document.documentElement.clientWidth/scale;
  img.style.width=width+'px';img.style.maxWidth=width+'px';img.style.left='0px';
  if(config.imageFrameHeight>0)img.style.height=config.imageFrameHeight/scale+'px';
  img.style.left=((0-img.getBoundingClientRect().left)/(parent.a||scale)+n(config.x,0))+'px';
 }
 if(!crop){
  if(state.painted){delete img.dataset.rafCropRender;for(const [key,[value,priority]] of Object.entries(state.original)){if(value)img.style.setProperty(key,value,priority);else img.style.removeProperty(key)}state.painted=false}
  return true;
 }
 if(!img.naturalWidth||!img.offsetWidth)return true;
 const g=cropGeometry(img.clientWidth,img.clientHeight,img.naturalWidth,img.naturalHeight,crop);
 img.dataset.rafCropRender='1';state.painted=true;
 img.style.transform='none';
 img.style.backgroundImage='url('+JSON.stringify(img.currentSrc||img.src)+')';
 img.style.backgroundSize=g.imageWidth+'px '+g.imageHeight+'px';
 img.style.backgroundPosition=g.left+'px '+g.top+'px';
 return true;
}
