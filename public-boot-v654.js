// RAF.studio v6.5.4 — public boot gate: never show stale/default layout before Firebase paint
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
  // Absolute safety: never leave the page hidden forever if network/Firebase fails.
  setTimeout(release,3200);
}
