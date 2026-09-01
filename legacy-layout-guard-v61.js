// RAF.studio v6.1 — protect public page from old broken transforms until first v6.1 publish
import { getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase,ref,onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
if(!new URLSearchParams(location.search).has('editor')){
 const db=getDatabase(getApp());
 onValue(ref(db,'website/public/proV6'),s=>{const v=s.val()||{};document.body.classList.toggle('raf-pre61',v.layoutBaseline!=='6.1')});
}
