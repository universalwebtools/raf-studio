// RAF.studio — public widget runtime v7.7.1
import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';
import {normalizeWidgets770,mountWidgets770} from './widgets-core-v770.js?v=7.7.1';

const Q=new URLSearchParams(location.search);
if(!Q.has('editor')&&!Q.has('tplPreview')){
 const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app);
 let widgets=[],timers=[];
 function paint(){if(document.querySelector('#rafMain'))mountWidgets770(widgets)}
 function schedule(){timers.forEach(clearTimeout);timers=[];requestAnimationFrame(paint);for(const ms of [180,650,1500])timers.push(setTimeout(paint,ms))}
	 onValue(ref(db,`${WEBSITE_ROOT}/public/builder/widgetsV77`),s=>{widgets=normalizeWidgets770(s.val());schedule()});
	 window.addEventListener('raf:public-ready',schedule);
	 window.addEventListener('raf:template752-rendered',schedule);
}
