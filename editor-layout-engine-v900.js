// RAF.studio 9.0 — shared layout engine for editor + public renderer
export const TYPO_KEYS=['fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','color','textAlign','textTransform','textDecoration','fontKerning'];
export function baseCfg(){return{x:0,y:0,width:null,height:null,scale:1,rotate:0,z:0,hidden:false,deleted:false,locked:false,group:'',label:'',crop:null,src:'',text:null,href:null,layoutMode:'auto',fontFamily:null,fontSize:null,fontWeight:null,fontStyle:null,lineHeight:null,letterSpacing:null,color:null,textAlign:null,textTransform:null,textDecoration:null,fontKerning:null}}
const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
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
 const put=(css,val,important=false)=>{if(val!==null&&val!==undefined&&val!=='')el.style.setProperty(css,String(val),important?'important':'');else el.style.removeProperty(css)};
 put('font-family',c.fontFamily?'"'+String(c.fontFamily).replace(/"/g,'')+'"':null);
 put('font-size',c.fontSize!=null?num(c.fontSize)+'px':null,true);
 put('font-weight',c.fontWeight);put('font-style',c.fontStyle);
 put('line-height',c.lineHeight,true);put('letter-spacing',c.letterSpacing!=null?num(c.letterSpacing)+'px':null);
 put('color',c.color);put('text-align',c.textAlign);put('text-transform',c.textTransform);put('text-decoration',c.textDecoration);put('font-kerning',c.fontKerning);
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
 const mode=layoutMode(el,c),x=num(c.x),y=num(c.y);
 el.dataset.rafLayoutMode=mode;
 if(mode==='layout'){
  el.style.removeProperty('position');el.style.removeProperty('left');el.style.removeProperty('top');
  if(x||y)el.style.translate=x+'px '+y+'px';else el.style.removeProperty('translate');
 }else{
  el.style.position='relative';el.style.left=x+'px';el.style.top=y+'px';el.style.removeProperty('translate');
 }
 if(c.width>0){el.style.boxSizing='border-box';el.style.width=num(c.width)+'px';el.style.maxWidth=num(c.width)+'px'}else if(c.width===null){el.style.removeProperty('width');el.style.removeProperty('max-width')}
 if(c.height>0){el.style.boxSizing='border-box';el.style.height=num(c.height)+'px'}else if(c.height===null)el.style.removeProperty('height');
 el.style.rotate=num(c.rotate)+'deg';
 const media=applyCrop(el,c.crop,c.scale);if(!media){el.style.transformOrigin='center center';el.style.scale=String(Math.max(.05,num(c.scale,1)))}
 applyTypography(el,c);
 if(c.z)el.style.zIndex=String(c.z);else if(c.z===0)el.style.removeProperty('z-index');
 if(c.src&&el instanceof HTMLImageElement)el.src=c.src;
 if(c.hidden||c.deleted){el.dataset.rafHidden900='1';el.style.display='none'}else if(el.dataset.rafHidden900==='1'){el.style.removeProperty('display');delete el.dataset.rafHidden900}
}
export function mergedCfg(layout,device,id){
 const own=layout?.[device]?.[id]||{},desk=layout?.desktop?.[id]||{};
 return device==='desktop'?{...baseCfg(),...own}:{...baseCfg(),...desk,...own};
}
