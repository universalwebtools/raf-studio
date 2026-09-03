// RAF.studio — editor/public parity watchdog v7.5.2
const EDITOR=new URLSearchParams(location.search).has('editor');
if(EDITOR){
  const style=document.createElement('style');
  style.id='rafParity752Css';
  style.textContent=`body.raf-e3{overflow-y:auto!important;overflow-x:hidden!important}body.raf-e3 #rafMain{height:auto!important;max-height:none!important;overflow:visible!important}body.raf-e3 .tpl751{visibility:visible!important}`;
  if(!document.getElementById(style.id))document.head.appendChild(style);
  let busy=false,tries=0,lastGood=0;
  async function repair(){
    const id=document.body.dataset.tpl75||'';
    if(!id)return;
    const main=document.querySelector('#rafMain');
    if(!main)return;
    const count=main.querySelectorAll('.tpl751').length;
    if(count>=10){lastGood=Date.now();return;}
    if(busy||tries>=4)return;
    busy=true;tries++;
    try{
      main.querySelectorAll('.tpl751').forEach(x=>x.remove());
      await import(`./blueprint-longform-v751.js?parity=752-${Date.now()}-${tries}`);
      await new Promise(r=>setTimeout(r,180));
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new CustomEvent('raf:parity-repaired',{detail:{id,tries}}));
    }catch(e){console.error('RAF parity repair',e)}finally{busy=false}
  }
  const observer=new MutationObserver(()=>setTimeout(repair,40));
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-tpl75']});
  setTimeout(repair,500);setTimeout(repair,1400);setTimeout(repair,3000);
  const timer=setInterval(()=>{repair();if(Date.now()-lastGood>0&&Date.now()-lastGood>25000&&tries>=4){clearInterval(timer);observer.disconnect()}},1200);
}
