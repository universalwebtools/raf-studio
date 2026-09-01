// RAF.studio — show freshly published version immediately in the same browser
const q=new URLSearchParams(location.search);
if(!q.has('editor')){
  try{
    const stamp=localStorage.getItem('rafPublishedAt');
    const seen=sessionStorage.getItem('rafSeenPublish');
    if(stamp&&seen!==stamp){
      if(q.get('fresh')===stamp){sessionStorage.setItem('rafSeenPublish',stamp)}
      else{
        sessionStorage.setItem('rafSeenPublish',stamp);
        const u=new URL(location.href);
        u.searchParams.set('fresh',stamp);
        location.replace(u.toString());
      }
    }
  }catch{}
}
