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
  for(const key of ['nav','navlinks','brandLogo']){
    const by=d.builder.elements[key];if(!by)continue;
    for(const dev of ['desktop','tablet','mobile'])if(by[dev]&&Object.prototype.hasOwnProperty.call(by[dev],'text')){delete by[dev].text;changed=true}
  }
  if(d.builder.recoveredV64!=='2'){
    const [pubSnap,histSnap]=await Promise.all([get(ref(db,`${root}/visualStyles`)),get(ref(db,'website/history'))]);
    const pub=pubSnap.val()||{};
    const histories=Object.values(histSnap.val()||{}).filter(x=>x?.data?.visualStyles).sort((a,b)=>(b.ts||0)-(a.ts||0)).map(x=>x.data.visualStyles);
    const sources=[pub,...histories];
    d.visualStyles||={};d.visualStyles.texts||={};d.visualStyles.sections||={};
    const resetTextFields=['moveX','moveY','scale','rotate','width','fontSize','lineHeight','letterSpacing'];
    const isReset=(k,v)=>k==='scale'?Number(v??1)===1:k==='moveX'||k==='moveY'||k==='rotate'?Number(v||0)===0:(v==null||v==='');
    const findText=(key,dev,f)=>{for(const src of sources){const v=src?.texts?.[key]?.[dev]?.[f];if(!isReset(f,v))return v}return undefined};
    const allTextKeys=new Set([...Object.keys(d.visualStyles.texts||{}),...sources.flatMap(s=>Object.keys(s?.texts||{}))]);
    for(const key of allTextKeys){d.visualStyles.texts[key]||={};for(const dev of ['desktop','tablet','mobile']){const cur=d.visualStyles.texts[key][dev]||={};for(const f of resetTextFields){if(isReset(f,cur[f])){const v=findText(key,dev,f);if(v!==undefined){cur[f]=v;changed=true}}}}}
    const findSection=(key,dev,f)=>{for(const src of sources){const v=src?.sections?.[key]?.[dev]?.[f];if(v!=null&&v!=='')return v}return undefined};
    const allSectionKeys=new Set([...Object.keys(d.visualStyles.sections||{}),...sources.flatMap(s=>Object.keys(s?.sections||{}))]);
    for(const key of allSectionKeys){d.visualStyles.sections[key]||={};for(const dev of ['desktop','tablet','mobile']){const cur=d.visualStyles.sections[key][dev]||={};for(const f of ['paddingTop','paddingBottom','minHeight']){if(cur[f]==null||cur[f]===''){const v=findSection(key,dev,f);if(v!==undefined){cur[f]=v;changed=true}}}}}
    d.builder.recoveredV64='2';changed=true;
  }
  if(changed){await set(ref(db,`${root}/editorDraft`),d);if(!sessionStorage.getItem('rafRecoveredV642')){sessionStorage.setItem('rafRecoveredV642','1');location.reload();await new Promise(()=>{})}}
}
