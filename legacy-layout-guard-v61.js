// RAF.studio v6.3.1 — legacy transform guard retired; keep only navigation safety
const box=document.querySelector('.navlinks');
function good(){return !!box&&box.querySelectorAll(':scope > a').length>=5}
function repair(){if(!box||good())return;box.innerHTML='<a data-raf-element="navPhoto" href="fotografia.html">Fotografia</a><a data-raf-element="navFilm" href="film.html">Film</a><a data-raf-element="navAbout" href="#omnie">O mnie</a><a data-raf-element="navContact" href="#kontakt">Kontakt</a><a class="keep pill" data-raf-element="navClient" data-gallery href="https://galeria.raf-studio.pl/">Strefa klienta</a><a class="keep pill" data-raf-element="navAdmin" href="admin.html">⚙ Admin</a>'}
if(box){repair();new MutationObserver(repair).observe(box,{childList:true,subtree:true,characterData:true})}
