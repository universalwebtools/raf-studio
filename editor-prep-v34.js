// RAF.studio — przygotowanie DOM dla edytora v3.4
const LOGO='https://galeria.raf-studio.pl/logo-white.png';

// Stary draft może mieć zapisany tekst dla elementu "brand".
// W edytorze używamy osobnego klucza, żeby nie nadpisywał prawdziwego logo.
const brand=document.querySelector('.brand[data-raf-element]');
if(brand){
  brand.dataset.rafElement='brandLogo';
  brand.innerHTML=`<img src="${LOGO}" alt="RAF.studio">`;
}

// Keep real anchors: the unified core handles Ctrl/Cmd+click selection.
