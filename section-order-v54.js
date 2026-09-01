// RAF.studio — keep Moja oferta directly after O mnie, even when legacy builder reorders sections
const main=document.querySelector('#rafMain');
function place(){const about=document.querySelector('[data-raf-section="About"]'),offer=document.querySelector('#rafOffer54');if(!about||!offer)return;if(about.nextElementSibling!==offer)about.insertAdjacentElement('afterend',offer)}
place();if(main){let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;queueMicrotask(()=>{place();busy=false})}).observe(main,{childList:true})}
