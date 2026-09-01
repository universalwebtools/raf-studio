// RAF.studio — lightweight navigation guard v6.3.1
const nav=document.querySelector('.nav');
const box=nav?.querySelector('.navlinks');
function valid(){return !!box&&box.querySelectorAll(':scope > a').length>=5}
function rebuild(){if(!box)return;box.innerHTML='<a data-raf-element="navPhoto" href="fotografia.html">Fotografia</a><a data-raf-element="navFilm" href="film.html">Film</a><a data-raf-element="navAbout" href="#omnie">O mnie</a><a data-raf-element="navContact" href="#kontakt">Kontakt</a><a class="keep pill" data-raf-element="navClient" data-gallery href="https://galeria.raf-studio.pl/">Strefa klienta</a><a class="keep pill" data-raf-element="navAdmin" href="admin.html">⚙ Admin</a>'}
if(box){if(!valid())rebuild();new MutationObserver(()=>{if(!valid())rebuild()}).observe(box,{childList:true,subtree:true,characterData:true})}
