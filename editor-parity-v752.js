// RAF.studio — editor/public parity watchdog v7.5.5
import {TEMPLATES752} from './template-engine-v752.js?v=7.5.5';
const EDITOR=new URLSearchParams(location.search).has('editor');
if(EDITOR){
  const style=document.createElement('style');
  style.id='rafParity752Css';
  style.textContent=`body.raf-e3{overflow-y:auto!important;overflow-x:hidden!important}body.raf-e3 #rafTemplate752{height:auto!important;max-height:none!important;overflow:visible!important}`;
  if(!document.getElementById(style.id))document.head.appendChild(style);
  let repairing=false,lastRepair=0;
  function check(){
    const id=document.body.dataset.e752||'';
    const root=document.getElementById('rafTemplate752');
    if(!id||!root)return;
    const expected=TEMPLATES752[id]?.seq?.length||0;
    const actual=root.querySelectorAll(':scope > [data-e752-sec]').length;
    const ok=expected>0&&actual===expected;
    document.body.dataset.rafParity752=ok?'ok':`${actual}/${expected}`;
    if(ok||repairing||Date.now()-lastRepair<900)return;
    repairing=true;lastRepair=Date.now();
    window.dispatchEvent(new CustomEvent('raf:template752-repair',{detail:{id,actual,expected}}));
    setTimeout(()=>{repairing=false},180);
  }
  window.addEventListener('raf:template752-rendered',()=>requestAnimationFrame(check));
  const observer=new MutationObserver(()=>requestAnimationFrame(check));
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-e752']});
  setTimeout(check,350);setTimeout(check,1000);setInterval(check,1800);
}
