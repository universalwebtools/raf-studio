// RAF.studio — public boot gate + REAL TEMPLATES v8.1
import './template-runtime-v74.js?v=8.2.2';
const Q=new URLSearchParams(location.search);
if(!Q.has('editor')&&!Q.has('tplPreview')){
  let released=false;
  const release=()=>{
    if(released)return;
    released=true;
    document.documentElement.classList.remove('raf-public-boot');
    document.documentElement.classList.add('raf-public-ready');
    window.dispatchEvent(new CustomEvent('raf:public-ready'));
  };
  window.rafReleasePublicBoot=release;
  setTimeout(release,3200);
}
