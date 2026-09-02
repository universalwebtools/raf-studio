// RAF.studio — migrate v6 freeLayout -> v7 freeLayoutV7 once
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
const db=getDatabase(getApp()),BASE='website/public/editorDraft/builder';
function mapKey(k){if(k==='hero:actions')return'group:heroActions';if(k==='contact:actions')return'group:contactActions';if(k.startsWith('re:'))return'el:'+k.slice(3);if(k.startsWith('hm:'))return'media:'+k.slice(3);return k}
const dst=await get(ref(db,`${BASE}/freeLayoutV7`));
if(!dst.exists()){
 const src=await get(ref(db,`${BASE}/freeLayout`));
 if(src.exists()){
  const old=src.val()||{},out={};
  for(const [device,items] of Object.entries(old)){out[device]={};for(const [k,v] of Object.entries(items||{})){out[device][mapKey(k)]={...(v||{})}}}
  await set(ref(db,`${BASE}/freeLayoutV7`),out);
 }
}
