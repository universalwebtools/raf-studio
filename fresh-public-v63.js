// RAF.studio v6.4 — immediately refresh public page after a verified publish
import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';
const q=new URLSearchParams(location.search);
if(!q.has('editor')){
  const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app);
  let first=true,initial='';
  try{
    const stamp=localStorage.getItem('rafPublishedAt');
    const seen=sessionStorage.getItem('rafSeenPublish');
    if(stamp&&seen!==stamp&&q.get('fresh')!==stamp){sessionStorage.setItem('rafSeenPublish',stamp);const u=new URL(location.href);u.searchParams.set('fresh',stamp);location.replace(u.toString())}
  }catch{}
  onValue(ref(db,`${WEBSITE_ROOT}/public/publishedAt`),s=>{
    const stamp=String(s.val()||'');if(!stamp)return;
    if(first){first=false;initial=stamp;return}
    if(stamp===initial||q.get('fresh')===stamp)return;
    try{localStorage.setItem('rafPublishedAt',stamp);sessionStorage.setItem('rafSeenPublish',stamp)}catch{}
    const u=new URL(location.href);u.searchParams.set('fresh',stamp);location.replace(u.toString());
  });
}
