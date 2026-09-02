// RAF.studio — public boot gate + REAL TEMPLATES v7.4
import './template-runtime-v74.js?v=7.4.0';
const Q=new URLSearchParams(location.search);
if(!Q.has('editor')){
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
