const params=new URLSearchParams(location.search),mode=params.get('editor'),LATEST='6.5.1',requested=params.get('ev')||LATEST;
if((mode==='direct'||mode==='1')&&requested!==LATEST){
 const u=new URL(location.href);u.searchParams.set('ev',LATEST);u.searchParams.set('_editorBuild','651');location.replace(u.toString());
}else if(mode==='direct'||mode==='1'){
 const path=location.pathname.toLowerCase(),portfolio=path.endsWith('/fotografia.html')||path.endsWith('/film.html');
 (async()=>{try{
   await import('./auth-gate.js?v=3.2.1');
   if(['6.0','6.1','6.2','6.2.1','6.3','6.3.1','6.4','6.5','6.5.1'].includes(requested))await import('./image-webp-v60.js?v=6.5.1');
   if(['6.4','6.5','6.5.1'].includes(requested)&&!portfolio)await import('./editor-recovery-v64.js?v=6.5.1');
   if(portfolio){
     await import('./portfolio-editor.js?v=6.2.0');
     await import('./portfolio-page-v4.js?v=4.0.0');
     await import('./portfolio-chrome-v47.js?v=6.5.1');
   }else{
     await import('./editor-media-prefetch-v43.js?v=4.3.0');
     await import('./editor-prep-v34.js?v=3.4.0');
     await import('./direct-editor-v3.js?v=3.0.1');
     await import('./direct-drag-v34.js?v=3.5.0');
     await import('./direct-publish-v32.js?v=6.5.1');
     await import('./editor-ui-v4.js?v=4.0.0');
     await import('./editor-custom-v42.js?v=4.2.0');
     await import('./typography-controller-v65.js?v=6.5.1');
     await import('./editor-media-section-v65.js?v=6.5.1');
     await import('./motion-preview-fix-v44.js?v=4.4.0');
     await import('./editor-motion-fix-v45.js?v=4.5.0');
     await import('./editor-sections-v55.js?v=5.5.0');
     await import('./editor-pro-v61.js?v=6.5.1');
     await import('./custom-sections-editor-v62.js?v=6.5.1');
     await import('./editor-history-preview-v64.js?v=6.5.1');
     await import('./editor-chrome-v61.js?v=6.5.1');
   }
 }catch(err){console.error('RAF visual editor bootstrap error',err);const box=document.createElement('div');box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:20px;font:16px system-ui;border:1px solid #333;border-radius:16px';box.textContent='Błąd uruchamiania edytora: '+err.message;document.body.appendChild(box)}})();
}
