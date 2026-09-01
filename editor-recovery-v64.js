// RAF.studio v6.4 — recover fields reset by v6.1 + sanitize broken Firebase arrays
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
const db=getDatabase(getApp()),root='website/public';
const snap=await get(ref(db,`${root}/editorDraft`));
if(snap.exists()){
  const d=snap.val()||{};d.builder||={};d.builder.elements||={};
  let changed=false;
  const cleanObjects=v=>(Array.isArray(v)?v:Object.values(v||{})).filter(x=>x&&typeof x==='object');
  const cleanStrings=v=>(Array.isArray(v)?v:Object.values(v||{})).filter(x=>typeof x==='string'&&x.trim());
  const cs=cleanObjects(d.builder.customSections),cl=cleanObjects(d.builder.clones),ord=cleanStrings(d.builder.sectionOrder);
  if(JSON.stringify(cs)!==JSON.stringify(d.builder.customSections||[])){d.builder.customSections=cs;changed=true}
  if(JSON.stringify(cl)!==JSON.stringify(d.builder.clones||[])){d.builder.clones=cl;changed=true}
  if(JSON.stringify(ord)!==JSON.stringify(d.builder.sectionOrder||[])){d.builder.sectionOrder=ord;changed=true}
  // Old versions accidentally stored text for structural navigation containers, destroying all links with textContent.
  for(const key of ['nav','navlinks','brandLogo']){
    const by=d.builder.elements[key];if(!by)continue;
    for(const dev of ['desktop','tablet','mobile'])if(by[dev]&&Object.prototype.hasOwnProperty.call(by[dev],'text')){delete by[dev].text;changed=true}
  }
  if(d.builder.recoveredV64!=='1'){
    const pub=(await get(ref(db,`${root}/visualStyles`))).val()||{};
    d.visualStyles||={};d.visualStyles.texts||={};d.visualStyles.sections||={};
    const resetTextFields=['moveX','moveY','scale','rotate','width','fontSize','lineHeight','letterSpacing'];
    const isReset=(k,v)=>k==='scale'?Number(v??1)===1:k==='moveX'||k==='moveY'||k==='rotate'?Number(v||0)===0:(v==null||v==='');
    for(const [key,pCfg] of Object.entries(pub.texts||{})){
      d.visualStyles.texts[key]||={};
      for(const dev of ['desktop','tablet','mobile']){
        const p=pCfg?.[dev];if(!p)continue;const cur=d.visualStyles.texts[key][dev]||={};
        for(const f of resetTextFields)if(isReset(f,cur[f])&&!isReset(f,p[f])){cur[f]=p[f];changed=true}
      }
    }
    for(const [key,pCfg] of Object.entries(pub.sections||{})){
      d.visualStyles.sections[key]||={};
      for(const dev of ['desktop','tablet','mobile']){
        const p=pCfg?.[dev];if(!p)continue;const cur=d.visualStyles.sections[key][dev]||={};
        for(const f of ['paddingTop','paddingBottom','minHeight'])if((cur[f]==null||cur[f]==='')&&p[f]!=null&&p[f]!==''){cur[f]=p[f];changed=true}
      }
    }
    d.builder.recoveredV64='1';changed=true;
  }
  if(changed){await set(ref(db,`${root}/editorDraft`),d);if(!sessionStorage.getItem('rafRecoveredV64')){sessionStorage.setItem('rafRecoveredV64','1');location.reload();await new Promise(()=>{})}}
}
