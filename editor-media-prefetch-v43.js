// Keep media appearance current after asynchronous template mounting as well as
// initial boot. A one-time prefetch only styled the now-hidden legacy hero.
import {getApps,getApp,initializeApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,get,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';
import {mediaConfig,applyMediaAppearance} from './media-appearance-v893.js?v=893-parity-1';
const db=getDatabase(getApps().length?getApp():initializeApp(firebaseConfig));
const base=WEBSITE_ROOT+'/public',dev=()=>new URLSearchParams(location.search).get('device')||(innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop');
let published={},draft={},frame=0;
function render(){
 frame=0;const media={...published,...draft};
 for(const img of document.querySelectorAll('img[data-home-media]')){
  const saved=media[img.dataset.homeMedia];if(!saved)continue;
  const source=window.rafCore760?.cfgFor(img)?.src||saved.url;
  if(source&&img.getAttribute('src')!==source)img.src=source;
  applyMediaAppearance(img,mediaConfig(saved,dev()));
 }
}
function schedule(){if(!frame)frame=requestAnimationFrame(render)}
try{
 const [p,d]=await Promise.all([get(ref(db,base+'/homeMedia')),get(ref(db,base+'/editorDraft/homeMedia'))]);
 published=p.val()||{};draft=d.val()||{};render();
 onValue(ref(db,base+'/editorDraft/homeMedia'),s=>{draft=s.val()||{};schedule()});
}catch(error){console.warn('RAF editor media appearance',error)}
addEventListener('raf:template752-rendered',schedule);
addEventListener('raf:v760-ready',schedule);
addEventListener('raf:history-main',schedule);
addEventListener('resize',schedule,{passive:true});
