// RAF.studio 9.0 — shared layout engine for editor + public renderer
export const TYPO_KEYS=['fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','color','textAlign','textTransform','textDecoration','fontKerning'];
export function baseCfg(){return{x:0,y:0,width:null,height:null,scale:1,rotate:0,z:0,hidden:false,deleted:false,locked:false,group:'',label:'',crop:null,src:'',text:null,href:null,layoutMode:'auto',fontFamily:null,fontSize:null,fontWeight:null,fontStyle:null,lineHeight:null,letterSpacing:null,color:null,textAlign:null,textTransform:null,textDecoration:null,fontKerning:null}}
const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const ownedStyles=new WeakMap(),contentBaseline=new WeakMap();
// Only reset properties that this engine actually changed. Template and media
// styles belong to their renderer until a layout override takes ownership.
function put(el,property,value,priority=''){
 let entries=ownedStyles.get(el);if(!entries){entries=new Map();ownedStyles.set(el,entries)}
 if(value===null||value===undefined||value===''){
  if(!entries.has(property))return;
  const old=entries.get(property);if(old.value)el.style.setProperty(property,old.value,old.priority);else el.style.removeProperty(property);
  entries.delete(property);return;
 }
 if(!entries.has(property))entries.set(property,{value:el.style.getPropertyValue(property),priority:el.style.getPropertyPriority(property)});
 if(el.style.getPropertyValue(property)!==String(value)||el.style.getPropertyPriority(property)!==priority)el.style.setProperty(property,String(value),priority);
}
export function applyContent(el,c={}){
 const text=el.matches?.('h1,h2,h3,h4,h5,h6,p,span,b,strong,small,blockquote,a,button,label,li,figcaption,em,summary')&&!el.querySelector('img,video,svg,iframe,input,textarea,select');
 let base=contentBaseline.get(el);if(!base){base={html:el.innerHTML,href:el.getAttribute('href'),textOwned:false,hrefOwned:false};contentBaseline.set(el,base)}
 if(text&&!el.isContentEditable){
  if(c.text!=null){if(!base.textOwned)base.html=el.innerHTML;base.textOwned=true;if(el.textContent!==String(c.text))el.textContent=String(c.text)}
  else if(base.textOwned){if(el.innerHTML!==base.html)el.innerHTML=base.html;base.textOwned=false}
 }
 if(el instanceof HTMLAnchorElement){
  if(c.href!=null){if(!base.hrefOwned)base.href=el.getAttribute('href');base.hrefOwned=true;if(el.getAttribute('href')!==String(c.href))el.setAttribute('href',String(c.href))}
  else if(base.hrefOwned){if(base.href===null)el.removeAttribute('href');else el.setAttribute('href',base.href);base.hrefOwned=false}
 }
}
export function layoutMode(el,c={}){
 if(c.layoutMode==='free'||c.layoutMode==='layout')return c.layoutMode;
 if(el?.dataset?.rafFree==='1')return'free';
 if(el?.dataset?.rafLayout==='1')return'layout';
 if(el?.matches?.('[data-raf-section],header.hero,.rafHeader900,.rafHeaderNav900,.rafHeaderSocial900'))return'layout';
 const p=el?.parentElement;if(!p)return'free';
 const d=getComputedStyle(p).display;
 if(d==='flex'||d==='inline-flex'||d==='grid'||d==='inline-grid')return'layout';
 return'free';
}
export function applyTypography(el,c={}){
 if(!el?.matches?.('h1,h2,h3,h4,h5,h6,p,span,b,strong,small,blockquote,a,button,label,li,figcaption,em,summary'))return;
 const style=(css,val,important=false)=>put(el,css,val,important?'important':'');
 style('font-family',c.fontFamily?'"'+String(c.fontFamily).replace(/"/g,'')+'"':null);
 style('font-size',c.fontSize!=null?num(c.fontSize)+'px':null,true);
 style('font-weight',c.fontWeight);style('font-style',c.fontStyle);
 style('line-height',c.lineHeight,true);style('letter-spacing',c.letterSpacing!=null?num(c.letterSpacing)+'px':null);
 style('color',c.color);style('text-align',c.textAlign);style('text-transform',c.textTransform);style('text-decoration',c.textDecoration);style('font-kerning',c.fontKerning);
}
export function applyCrop(el,crop,layoutScale=1){
 if(!(el instanceof HTMLImageElement))return false;
 const ls=Math.max(.05,num(layoutScale,1));
 if(!crop){el.style.transformOrigin='center center';el.style.scale=String(ls);return true}
 if(crop.src)el.src=crop.src;
 if(el.dataset.homeMedia)el.style.transform='none';
 el.style.objectFit=crop.fit||'cover';
 el.style.objectPosition=num(crop.x,50)+'% '+num(crop.y,50)+'%';
 el.style.transformOrigin=num(crop.x,50)+'% '+num(crop.y,50)+'%';
 el.style.scale=String(Math.max(.05,num(crop.zoom,1)*ls));
 if(num(crop.zoom,1)>1&&el.parentElement)el.parentElement.style.overflow='hidden';
 return true;
}
export function applyLayout(el,c={}){
 if(!el)return;
 applyContent(el,c);
 const mode=layoutMode(el,c),x=num(c.x),y=num(c.y);
 el.dataset.rafLayoutMode=mode;
 if(mode==='layout'){
  el.style.removeProperty('position');el.style.removeProperty('left');el.style.removeProperty('top');
  if(x||y)el.style.translate=x+'px '+y+'px';else el.style.removeProperty('translate');
 }else{
  el.style.position='relative';el.style.left=x+'px';el.style.top=y+'px';el.style.removeProperty('translate');
 }
 put(el,'width',c.width>0?num(c.width)+'px':null);put(el,'max-width',c.width>0?num(c.width)+'px':null);
 put(el,'height',c.height>0?num(c.height)+'px':null);put(el,'box-sizing',c.width>0||c.height>0?'border-box':null);
 el.style.rotate=num(c.rotate)+'deg';
 const media=applyCrop(el,c.crop,c.scale);if(!media){el.style.transformOrigin='center center';el.style.scale=String(Math.max(.05,num(c.scale,1)))}
 applyTypography(el,c);
 if(c.z)el.style.zIndex=String(c.z);else if(c.z===0)el.style.removeProperty('z-index');
 if(c.src&&el instanceof HTMLImageElement)el.src=c.src;
 put(el,'display',c.hidden||c.deleted?'none':null);
}
export function mergedCfg(layout,device,id){
 const own=layout?.[device]?.[id]||{},desk=layout?.desktop?.[id]||{};
 return device==='desktop'?{...baseCfg(),...own}:{...baseCfg(),...desk,...own};
}
