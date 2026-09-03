import './site-v800.js?v=8.0.0';
const params=new URLSearchParams(location.search),mode=params.get('editor'),LATEST='8.0.0',requested=params.get('ev')||LATEST;
const editorMode=mode==='direct'||mode==='1';
let editorReleased=false;
function releaseEditor(){if(editorReleased)return;editorReleased=true;document.documentElement.classList.add('raf-editor-ready');window.dispatchEvent(new CustomEvent('raf:editor-ready'))}
if(editorMode)setTimeout(releaseEditor,4800);
async function waitEditorSettled(){const started=performance.now();let last=performance.now(),obs;try{obs=new MutationObserver(()=>{last=performance.now()});obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','src','href']})}catch{}while(performance.now()-started<3800){const toolbar=document.querySelector('#rafTop3,.peTop'),quiet=performance.now()-last>420;if(toolbar&&quiet&&document.readyState!=='loading')break;await new Promise(r=>setTimeout(r,70))}try{obs?.disconnect()}catch{}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await new Promise(r=>setTimeout(r,120));releaseEditor()}
if(editorMode&&requested!==LATEST){const u=new URL(location.href);u.searchParams.set('ev',LATEST);u.searchParams.set('_editorBuild','800');location.replace(u.toString())}
else if(editorMode){
 const path=location.pathname.toLowerCase(),portfolio=path.endsWith('/fotografia.html')||path.endsWith('/film.html')||path.endsWith('/fotografia/')||path.endsWith('/film/');
 (async()=>{try{
  await import('./auth-gate.js?v=3.2.1');
  await import('./image-webp-v60.js?v=6.5.3');
  if(!portfolio){await import('./editor-recovery-v64.js?v=6.5.3');await import('./editor-baseline-sync-v652.js?v=7.7.2')}
  if(portfolio){await import('./portfolio-editor.js?v=6.2.0');await import('./portfolio-page-v4.js?v=4.0.0');await import('./portfolio-chrome-v47.js?v=7.7.2')}
  else{
   await import('./editor-media-prefetch-v43.js?v=4.3.0');
   await import('./editor-prep-v34.js?v=3.4.0');
   await import('./direct-editor-v3.js?v=8.0.0');
   await import('./editor-ui-v4.js?v=8.0.0');
   await import('./editor-custom-v42.js?v=4.2.0');
   await import('./typography-controller-v65.js?v=6.5.3');
   await import('./editor-media-section-v65.js?v=6.5.3');
   await import('./motion-preview-fix-v44.js?v=4.4.0');
   await import('./editor-motion-fix-v45.js?v=4.5.0');
   await import('./editor-sections-v55.js?v=5.5.0');
   await import('./editor-pro-v61.js?v=6.5.3');
   await import('./custom-sections-editor-v62.js?v=6.5.3');
   await import('./custom-section-delete-v653.js?v=6.5.3');
   await import('./editor-v70-migrate.js?v=7.0.1');
   await import('./template-blueprints-v75.js?v=8.0.0');
   await import('./blueprint-guard-v75.js?v=8.0.0');
   await import('./editor-parity-v752.js?v=8.0.0');
   await import('./editor-core-v760.js?v=8.0.0');
   await import('./editor-v70-layout-guard.js?v=7.7.2');
   await import('./editor-templates-v752.js?v=8.0.0');
   await import('./editor-history-v72.js?v=7.7.2');
   await import('./editor-chrome-v73.js?v=8.0.0');
   await import('./editor-workspace-v760.js?v=7.7.2');
   await import('./editor-widgets-v770.js?v=8.0.0');
   await import('./editor-version-history-v760.js?v=7.7.2');
   await import('./direct-publish-v760.js?v=7.7.2');
  }
  await waitEditorSettled();
 }catch(err){console.error('RAF visual editor bootstrap error',err);releaseEditor();const box=document.createElement('div');box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:20px;font:16px system-ui;border:1px solid #333;border-radius:16px';box.textContent='Błąd uruchamiania edytora: '+err.message;document.body.appendChild(box)}})();
}
