const params=new URLSearchParams(location.search);
if(params.get('editor')==='direct'){
  Promise.all([
    import('./auth-gate.js?v=3.2.0'),
    import('./direct-editor-v2.js?v=2.0.0')
  ]).catch(err=>{
    console.error('RAF Canva editor v2 bootstrap error',err);
    const box=document.createElement('div');
    box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:20px;font:16px system-ui;border:1px solid #333;border-radius:16px';
    box.textContent='Błąd uruchamiania edytora: '+err.message;
    document.body.appendChild(box);
  });
}
