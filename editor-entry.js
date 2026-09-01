const params=new URLSearchParams(location.search);
const mode=params.get('editor');
if(mode==='direct'||mode==='1'){
  const path=location.pathname.toLowerCase();
  const portfolio=path.endsWith('/fotografia.html')||path.endsWith('/film.html');

  (async()=>{
    try{
      await import('./auth-gate.js?v=3.2.1');

      if(portfolio){
        await import('./portfolio-editor.js?v=1.0.1');
        await import('./portfolio-page-v4.js?v=4.0.0');
      }else{
        await import('./editor-prep-v34.js?v=3.4.0');
        await import('./direct-editor-v3.js?v=3.0.1');
        await import('./direct-drag-v34.js?v=3.5.0');
        await import('./direct-publish-v32.js?v=3.4.0');
        await import('./editor-ui-v4.js?v=4.0.0');
      }
    }catch(err){
      console.error('RAF visual editor bootstrap error',err);
      const box=document.createElement('div');
      box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:20px;font:16px system-ui;border:1px solid #333;border-radius:16px';
      box.textContent='Błąd uruchamiania edytora: '+err.message;
      document.body.appendChild(box);
    }
  })();
}
