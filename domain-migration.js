const NEW_GALLERY='https://galeria.raf-studio.pl/';
const OLD_PART='universalwebtools.github.io/raf.studio.galeria';

function migrateGalleryField(){
  const input=document.querySelector('#gallery');
  if(input && (!input.value || input.value.includes(OLD_PART))){
    input.value=NEW_GALLERY;
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  const client=document.querySelector('#openGalleryClient');
  const admin=document.querySelector('#openGalleryAdmin');
  const frame=document.querySelector('#galleryFrame');
  if(client) client.href=NEW_GALLERY;
  if(admin) admin.href=NEW_GALLERY+'admin.html';
  if(frame && !frame.src.startsWith(NEW_GALLERY)) frame.src=NEW_GALLERY+'admin.html';
}

migrateGalleryField();
const timer=setInterval(migrateGalleryField,700);
setTimeout(()=>clearInterval(timer),12000);
