// RAF.studio — przygotowanie DOM dla edytora v3.4
const LOGO='https://galeria.raf-studio.pl/logo-white.png';

// Stary draft może mieć zapisany tekst dla elementu "brand".
// W edytorze używamy osobnego klucza, żeby nie nadpisywał prawdziwego logo.
const brand=document.querySelector('.brand[data-raf-element]');
if(brand){
  brand.dataset.rafElement='brandLogo';
  brand.innerHTML=`<img src="${LOGO}" alt="RAF.studio">`;
}

// Edytor v3 blokuje propagację kliknięć w <a> na etapie capture,
// więc linków nie dało się zaznaczać. Tylko w trybie edycji
// zamieniamy edytowalne linki na neutralne elementy o tym samym wyglądzie.
for(const a of [...document.querySelectorAll('a[data-raf-element]')]){
  const div=document.createElement('div');
  for(const at of [...a.attributes]){
    if(at.name==='href') continue;
    div.setAttribute(at.name,at.value);
  }
  div.dataset.editorHref=a.getAttribute('href')||'';
  div.classList.add('editorLinkProxy');
  div.innerHTML=a.innerHTML;
  a.replaceWith(div);
}

const st=document.createElement('style');
st.id='rafEditorPrep34Css';
st.textContent=`
.editorLinkProxy{cursor:pointer}
.contactActions .editorLinkProxy{padding:17px;border:1px solid var(--line);border-radius:14px}
.brand.editorLinkProxy{display:inline-flex!important;align-items:center}
.brand.editorLinkProxy img{display:block;width:118px;height:38px;object-fit:contain;object-position:left center}
`;
document.head.appendChild(st);
