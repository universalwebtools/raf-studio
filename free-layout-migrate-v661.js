// RAF.studio v6.6.1 — one-time repair of v6.6 nested parent+child offsets
import { getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase,ref,get,set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
const db=getDatabase(getApp()),PATH='website/public/editorDraft/builder/freeLayout';
const nz=c=>!!c&&(Math.abs(Number(c.x)||0)>0.01||Math.abs(Number(c.y)||0)>0.01);
(async()=>{try{if(sessionStorage.getItem('raf661Migrated')==='1')return;const s=await get(ref(db,PATH)),layout=s.val()||{};let changed=false;for(const d of ['desktop','tablet','mobile']){const m=layout[d];if(!m)continue;const pairs=[['hero:actions',['re:heroPhotoBtn','re:heroFilmBtn','re:heroClientBtn']],['contact:actions',['re:contactEmail','re:contactPhone','re:contactInstagram','re:contactGallery']]];for(const [parent,kids] of pairs){if(!nz(m[parent]))continue;const movedKids=kids.filter(k=>nz(m[k]));if(movedKids.length>=2){m[parent].x=0;m[parent].y=0;changed=true}}}if(changed)await set(ref(db,PATH),layout);sessionStorage.setItem('raf661Migrated','1');}catch(e){console.warn('RAF 6.6.1 migration',e)}})();
