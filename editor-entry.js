const params=new URLSearchParams(location.search);
if(params.get('editor')==='direct'){
  const path=location.pathname.toLowerCase();
  const portfolio=path.endsWith('/fotografia.html')||path.endsWith('/film.html');
  Promise.all([
    import('./auth-gate.js?v=3.2.0'),
    portfolio?import('./portfolio-editor.js?v=1.0.0'):import('./direct-editor-v3.js?v=3.0.0')
  ]).then(()=>{
    if(!portfolio){
      const nav=document.createElement('div');
      nav.id='rafPageSwitch';
      nav.style.cssText='position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:1000030;background:#111e;border:1px solid #ffffff25;border-radius:12px;padding:6px;display:flex;gap:5px;backdrop-filter:blur(18px);font:11px system-ui';
      nav.innerHTML='<button data-p="index" style="background:#fff;color:#111">Strona główna</button><button data-p="foto">Fotografia</button><button data-p="film">Film</button>';
      nav.querySelectorAll('button').forEach(b=>{b.style.cssText+=';border:1px solid #ffffff22;border-radius:8px;padding:7px 10px;cursor:pointer';b.onclick=()=>{location.href=b.dataset.p==='foto'?'fotografia.html?editor=direct':b.dataset.p==='film'?'film.html?editor=direct':'index.html?editor=direct'}});
      document.body.appendChild(nav);
    }
  }).catch(err=>{
    console.error('RAF visual editor bootstrap error',err);
    const box=document.createElement('div');
    box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:20px;font:16px system-ui;border:1px solid #333;border-radius:16px';
    box.textContent='Błąd uruchamiania edytora: '+err.message;
    document.body.appendChild(box);
  });
}
