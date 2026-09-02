// RAF.studio — v7 migration: v6 freeLayout + legacy text moveX/moveY -> one V7 layout
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
const db=getDatabase(getApp()),ROOT='website/public/editorDraft',BASE=`${ROOT}/builder`;
const DEVICES=['desktop','tablet','mobile'];
function mapKey(k){if(k==='hero:actions')return'group:heroActions';if(k==='contact:actions')return'group:contactActions';if(k.startsWith('re:'))return'el:'+k.slice(3);if(k.startsWith('hm:'))return'media:'+k.slice(3);return k}
function num(v){v=Number(v);return Number.isFinite(v)?v:0}
let dst=(await get(ref(db,`${BASE}/freeLayoutV7`))).val()||{};
if(!Object.keys(dst).length){
 const src=(await get(ref(db,`${BASE}/freeLayout`))).val()||{};
 for(const [device,items] of Object.entries(src)){dst[device]||={};for(const [k,v] of Object.entries(items||{}))dst[device][mapKey(k)]={...(v||{})}}
 if(Object.keys(dst).length)await set(ref(db,`${BASE}/freeLayoutV7`),dst);
}
const marker=await get(ref(db,`${BASE}/v7TextMoveMigrated`));
if(!marker.exists()){
 const vsSnap=await get(ref(db,`${ROOT}/visualStyles/texts`)),texts=vsSnap.val()||{};
 let changed=false;
 for(const [textKey,byDevice] of Object.entries(texts)){
  for(const d of DEVICES){
   const c=byDevice?.[d];if(!c||typeof c!=='object')continue;
   const mx=num(c.moveX),my=num(c.moveY);if(!mx&&!my)continue;
   const id=`tx:${textKey}`;dst[d]||={};dst[d][id]||={x:0,y:0,z:0,hidden:false,locked:false,group:''};
   dst[d][id].x=num(dst[d][id].x)+mx;dst[d][id].y=num(dst[d][id].y)+my;
   await set(ref(db,`${ROOT}/visualStyles/texts/${textKey}/${d}/moveX`),0);
   await set(ref(db,`${ROOT}/visualStyles/texts/${textKey}/${d}/moveY`),0);
   changed=true;
  }
 }
 if(changed)await set(ref(db,`${BASE}/freeLayoutV7`),dst);
 await set(ref(db,`${BASE}/v7TextMoveMigrated`),true);
}
