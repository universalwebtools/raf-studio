// RAF.studio 9.0 — stable object IDs shared by editor and renderer
const clean=s=>String(s??'').trim().replace(/\s+/g,' ').slice(0,96);
const classes=el=>[...(el?.classList||[])].filter(x=>!/^v(?:72|760|900)/.test(x)&&!/(?:selected|rsel|sel55|pro61|custom62)/i.test(x)).sort().slice(0,4).join('.');
export function semanticId(el){
 if(!el)return'';
 if(el.dataset?.rafV76Clone)return'clone:'+el.dataset.rafV76Clone;
 if(el.dataset?.siteText)return'tx:'+el.dataset.siteText;
 if(['heroK','heroT','heroD'].includes(el.id))return'tx:'+el.id;
 if(el.dataset?.homeText)return'tx:'+el.dataset.homeText;
 if(el.dataset?.custom62Id&&el.dataset?.custom62)return'cs:'+el.dataset.custom62Id+':'+el.dataset.custom62;
 if(el.dataset?.homeMedia)return'media:'+el.dataset.homeMedia;
 if(el.dataset?.rafElement)return'el:'+el.dataset.rafElement;
 if(el.matches?.('header.hero'))return document.body.dataset.e752?'section:LegacyHero':'section:Hero';
 if(el.dataset?.rafSection)return'section:'+el.dataset.rafSection;
 if(el.dataset?.homeSection)return'section:'+el.dataset.homeSection;
 if(el.classList?.contains('actions'))return'group:heroActions';
 if(el.classList?.contains('contactActions'))return'group:contactActions';
 if(el.dataset?.offerIndex!=null)return'offer:'+el.dataset.offerIndex;
 if(el.dataset?.reviewIndex!=null)return'review:'+el.dataset.reviewIndex;
 if(el.dataset?.brandIndex!=null)return'brand:'+el.dataset.brandIndex;
 return'';
}
function sectionKey(el){
 const s=el?.closest?.('[data-raf-section],[data-home-section],header.hero,.tpl75Section');
 return semanticId(s)||s?.id||classes(s)||'page';
}
export function fingerprint(el){
 if(!el)return'';
 const v7=el.dataset?.rafV7Id||'';
 const role=el.getAttribute?.('role')||'';
 const aria=el.getAttribute?.('aria-label')||'';
 const href=el.getAttribute?.('href')||'';
 const src=el.getAttribute?.('src')||'';
 const text=clean(el.textContent);
 const cls=classes(el);
 const parent=el.parentElement;
 let same=0;
 if(parent){
  const peers=[...parent.children].filter(x=>x.tagName===el.tagName&&classes(x)===cls);
  same=Math.max(0,peers.indexOf(el));
 }
 return ['fp9',sectionKey(el),el.tagName?.toLowerCase()||'node',v7,cls,role,aria,href,src.split('?')[0].slice(-80),text,same].join('|');
}
export function uuid(){return crypto?.randomUUID?.()||('raf-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10))}
export function resolveObjectId(el,map={},create=false){
 const semantic=semanticId(el);if(semantic)return semantic;
 const fp=fingerprint(el);if(!fp)return'';
 if(map[fp])return map[fp];
 if(!create)return el.dataset?.rafV72Id||el.dataset?.rafV7Id||'';
 const id='node:'+uuid();map[fp]=id;return id;
}
export function stampObjectId(el,map={},create=false){
 const id=resolveObjectId(el,map,create);if(id)el.dataset.rafV72Id=id;return id;
}
