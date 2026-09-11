// RAF.studio — editor/public parity + widget media bridge v8.8.4
import {TEMPLATES752} from './template-engine-v752.js?v=8.7.1';
import {render61} from './public-pro-v61.js?v=8.7.0';
const EDITOR=new URLSearchParams(location.search).has('editor');
if(EDITOR){
  const VERSION='8.8.4';
  const style=document.createElement('style');
  style.id='rafParity752Css';
  style.textContent=`body.raf-e3{overflow-y:auto!important;overflow-x:hidden!important}body.raf-e3 #rafTemplate752{height:auto!important;max-height:none!important;overflow:visible!important}.weVideoUpload883{width:100%;margin:7px 0 4px!important;background:#147fbd!important;border-color:#55c7ff!important;color:#fff!important;font-weight:900!important}.weVideoHelp883{display:block;color:#78cfff;font-size:9px;line-height:1.35;margin:0 0 8px}`;
  if(!document.getElementById(style.id))document.head.appendChild(style);
  let repairing=false,lastRepair=0,widgetOpening=false,augmentTimer=null,proTimer=null,checkTimer=null;

  function stampVisibleVersion(){
    document.documentElement.dataset.rafEditorCurrent=VERSION;
    document.querySelectorAll('.v760title small').forEach(el=>{if(/^EDYCJA ELEMENTU/i.test(el.textContent||''))el.textContent='EDYCJA ELEMENTU • '+VERSION});
    document.querySelectorAll('#v72panel small,#rafPanel3 small').forEach(el=>{if(/V8\.[0-9.]+ CORE/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/V8\.[0-9.]+ CORE/i,'V'+VERSION+' CORE')});
    const st=document.getElementById('rafStatus3');if(st&&/Edytor 8\.[0-9.]+/i.test(st.textContent||'')&&!/Zmiany|Opublik|Błąd|Cofanie|Ponawianie|Synchron|Usuw|Szablon/i.test(st.textContent||''))st.textContent='✓ Edytor '+VERSION+' • VIDEO ECO + PARITY + SMART GROUPS';
  }
  function reapplyPublicRuntime(){
    clearTimeout(proTimer);
    proTimer=setTimeout(()=>{
      try{
        // render61 already calls heroVideo(). Calling heroVideo again here used to
        // destroy/recreate the decoder several times for one editor action.
        render61();
        window.rafCore760?.refresh?.();
        window.rafVideoPerformance884?.refresh?.();
        stampVisibleVersion();
      }catch(e){console.warn('RAF parity runtime',e)}
    },160);
  }
  function selectedWidget(){
    const core=window.rafCore760||window.rafCore72,a=core?.selected?.()||[];
    if(a.length!==1)return null;const el=a[0],root=el?.closest?.('[data-raf-widget-id]')||(el?.dataset?.rafWidgetId?el:null);
    if(!root?.dataset?.rafWidgetId)return null;
    return {id:root.dataset.rafWidgetId,el:root,selected:el};
  }
  function widgetData(id){return window.rafWidgets770?.list?.().find?.(x=>x.id===id)||null}
  function augmentWidgetPanel(){
    clearTimeout(augmentTimer);augmentTimer=setTimeout(()=>{
      stampVisibleVersion();const sw=selectedWidget(),panel=document.querySelector('#rafPanel3 .wePanel');if(!sw||!panel)return;
      const w=widgetData(sw.id),url=document.getElementById('weUrl');if(!w||!url||!['video','fullscreen-video-bg','showreel'].includes(w.type))return;
      if(document.getElementById('weVideoUpload883'))return;
      const b=document.createElement('button');b.id='weVideoUpload883';b.className='weUpload weVideoUpload883';b.type='button';b.textContent='🎬 Wgraj film MP4 / WebM';
      const help=document.createElement('small');help.className='weVideoHelp883';help.textContent='Możesz wkleić link powyżej albo wgrać własny plik wideo bezpośrednio z komputera.';
      const label=url.closest('label')||url.parentElement;if(label){label.insertAdjacentElement('afterend',help);help.insertAdjacentElement('beforebegin',b)}else panel.prepend(b,help);
      b.onclick=()=>{
        const input=document.createElement('input');input.type='file';input.accept='video/mp4,video/webm,.mp4,.webm';input.onchange=async()=>{
          const file=input.files?.[0];if(!file)return;const upload=window.rafHeroVideo810?.upload;if(!upload){alert('Moduł przesyłania filmu nie jest jeszcze gotowy. Odśwież edytor i spróbuj ponownie.');return}
          const old=b.textContent;b.disabled=true;
          try{
            const out=await upload(file,p=>{b.textContent=`Wgrywanie filmu… ${p}%`});
            url.value=out;url.dispatchEvent(new Event('input',{bubbles:true}));url.dispatchEvent(new Event('change',{bubbles:true}));
            b.textContent='✓ Film wgrany';const st=document.getElementById('rafStatus3');if(st)st.textContent='✓ Film widżetu zapisany';setTimeout(()=>{b.textContent=old;b.disabled=false},1100)
          }catch(e){b.textContent=old;b.disabled=false;alert('Nie udało się wgrać filmu: '+(e?.message||e))}
        };input.click()
      }
    },0)
  }
  function restoreWidgetPanel(){
    stampVisibleVersion();const sw=selectedWidget();if(!sw||widgetOpening)return;const panel=document.querySelector('#rafPanel3');
    if(panel?.querySelector('.wePanel')){augmentWidgetPanel();return}
    if(!window.rafWidgets770?.select)return;
    widgetOpening=true;setTimeout(()=>{try{window.rafWidgets770.select(sw.id,false)}finally{widgetOpening=false;augmentWidgetPanel()}},0)
  }
  function check(){
    clearTimeout(checkTimer);checkTimer=null;stampVisibleVersion();const id=document.body.dataset.e752||'',root=document.getElementById('rafTemplate752');
    if(id&&root){
      const expected=TEMPLATES752[id]?.seq?.length||0,actual=root.querySelectorAll(':scope > [data-e752-sec]').length,ok=expected>0&&actual===expected;
      document.body.dataset.rafParity752=ok?'ok':`${actual}/${expected}`;
      if(!ok&&!repairing&&Date.now()-lastRepair>=900){repairing=true;lastRepair=Date.now();window.dispatchEvent(new CustomEvent('raf:template752-repair',{detail:{id,actual,expected}}));setTimeout(()=>{repairing=false},180)}
    }
    restoreWidgetPanel();augmentWidgetPanel()
  }
  function scheduleCheck(){clearTimeout(checkTimer);checkTimer=setTimeout(check,45)}
  window.addEventListener('raf:template752-rendered',()=>{scheduleCheck();reapplyPublicRuntime()});
  window.addEventListener('raf:v760-selection',()=>{setTimeout(restoreWidgetPanel,0);setTimeout(augmentWidgetPanel,40)});
  window.addEventListener('raf:history-pro',reapplyPublicRuntime);
  window.addEventListener('raf:universal-elements-ready',reapplyPublicRuntime);
  const observer=new MutationObserver(scheduleCheck);
  // Watching every class mutation made the editor run parity checks during many
  // harmless hover/selection animations. Child changes + template id are enough.
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-e752']});
  setTimeout(()=>{check();reapplyPublicRuntime()},300);setTimeout(check,950);setInterval(check,1800);
  window.rafParity884={check,reapply:reapplyPublicRuntime,widgetPanel:restoreWidgetPanel,stamp:stampVisibleVersion};
}
