// RAF.studio v6.5.2 — keep editorDraft identical to last published state
import { getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
const db=getDatabase(getApp()),root='website/public';
let syncing=false,lastSeen=null;
async function syncToPublished(stamp,{reload=false}={}){
  if(syncing||!stamp)return;
  syncing=true;
  try{
    const [draftSnap,siteSnap,contentSnap,mediaSnap,stylesSnap,builderSnap]=await Promise.all([
      get(ref(db,`${root}/editorDraft`)),get(ref(db,`${root}/site`)),get(ref(db,`${root}/homeContent`)),get(ref(db,`${root}/homeMedia`)),get(ref(db,`${root}/visualStyles`)),get(ref(db,`${root}/builder`))
    ]);
    const d=draftSnap.val()||{};
    const builder=builderSnap.val()||{};
    builder.basePublishedAt=stamp;
    const next={
      ...d,
      site:siteSnap.val()||{},
      homeContent:contentSnap.val()||{},
      homeMedia:mediaSnap.val()||{},
      visualStyles:stylesSnap.val()||{},
      builder
    };
    await set(ref(db,`${root}/editorDraft`),next);
    try{localStorage.setItem('rafEditorBaseline',String(stamp))}catch{}
    if(reload){
      const key=`rafBaselineReload:${stamp}`;
      if(!sessionStorage.getItem(key)){
        sessionStorage.setItem(key,'1');
        const u=new URL(location.href);
        u.searchParams.set('ev','6.5.2');
        u.searchParams.set('_sync',String(stamp));
        location.replace(u.toString());
        await new Promise(()=>{});
      }
    }
  }finally{syncing=false}
}
const pubSnap=await get(ref(db,`${root}/publishedAt`));
const publishedAt=Number(pubSnap.val()||0);
const draftSnap=await get(ref(db,`${root}/editorDraft`));
const draft=draftSnap.val()||{};
const baseAt=Number(draft?.builder?.basePublishedAt||0);
if(publishedAt&&baseAt!==publishedAt){
  await syncToPublished(publishedAt,{reload:true});
}
lastSeen=publishedAt;
onValue(ref(db,`${root}/publishedAt`),async snap=>{
  const stamp=Number(snap.val()||0);
  if(!stamp){lastSeen=stamp;return}
  if(lastSeen===null){lastSeen=stamp;return}
  if(stamp!==lastSeen){
    lastSeen=stamp;
    await syncToPublished(stamp,{reload:true});
  }
});
