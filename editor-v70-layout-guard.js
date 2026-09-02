// RAF.studio v7 — protect freeLayoutV7 from legacy full-draft autosaves
import {getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,onValue,set} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
const db=getDatabase(getApp()),P='website/public/editorDraft/builder/freeLayoutV7',KEY='raf_v7_layout_backup';
let restoring=false,ready=false;
function meaningful(v){return v&&typeof v==='object'&&Object.keys(v).length>0}
onValue(ref(db,P),async s=>{
 const v=s.val();
 if(meaningful(v)){try{sessionStorage.setItem(KEY,JSON.stringify(v))}catch{}ready=true;return}
 if(!ready||restoring)return;
 let backup=null;try{backup=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{}
 if(!meaningful(backup))return;
 restoring=true;try{await set(ref(db,P),backup)}finally{restoring=false}
});
