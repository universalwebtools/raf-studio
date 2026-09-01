// RAF.studio v6.1 — one-time cleanup of old transforms, without touching content/media
import { getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase,ref,get,set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
const db=getDatabase(getApp());
const root='website/public';
const s=await get(ref(db,`${root}/editorDraft`));
if(s.exists()){
  const d=s.val()||{};
  d.builder||={};
  if(d.builder.layoutBaseline!=='6.1'){
    d.visualStyles||={}; d.visualStyles.texts||={}; d.visualStyles.sections||={};
    for(const cfg of Object.values(d.visualStyles.texts)){
      for(const dev of ['desktop','tablet','mobile']) if(cfg?.[dev]){
        cfg[dev].moveX=0; cfg[dev].moveY=0; cfg[dev].scale=1; cfg[dev].rotate=0; cfg[dev].width=null;
        cfg[dev].fontSize=null; cfg[dev].lineHeight=null; cfg[dev].letterSpacing=null;
      }
    }
    for(const cfg of Object.values(d.visualStyles.sections)){
      for(const dev of ['desktop','tablet','mobile']) if(cfg?.[dev]){
        cfg[dev].paddingTop=null; cfg[dev].paddingBottom=null; cfg[dev].minHeight=null;
      }
    }
    d.builder.layoutBaseline='6.1';
    await set(ref(db,`${root}/editorDraft`),d);
    if(!sessionStorage.getItem('raf61reset')){
      sessionStorage.setItem('raf61reset','1');
      const u=new URL(location.href); u.searchParams.set('layout61','1'); location.replace(u.toString());
      await new Promise(()=>{});
    }
  }
}
// normalize PRO defaults without deleting user's URLs/content
const p=await get(ref(db,`${root}/proV6Draft`));
const pro=p.val()||{};
if(pro.layoutBaseline!=='6.1'){
  pro.global={...(pro.global||{}),h1:92,h2:64,body:16,radius:16};
  pro.sectionOrder=Array.isArray(pro.sectionOrder)&&pro.sectionOrder.length?pro.sectionOrder:['TwoWorlds','About','Offer','Stats','Reviews','Brands','Contact'];
  pro.layoutBaseline='6.1';
  await set(ref(db,`${root}/proV6Draft`),pro);
}
