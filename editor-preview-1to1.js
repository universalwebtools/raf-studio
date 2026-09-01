const frame = document.querySelector('#siteFrame');
const deviceFrame = document.querySelector('#deviceFrame');
const canvas = document.querySelector('.veCanvas');

function currentDevice(){
  return document.querySelector('[data-device].active')?.dataset.device || 'desktop';
}

function targetViewport(){
  const d=currentDevice();
  if(d==='mobile') return {w:390,h:844};
  if(d==='tablet') return {w:820,h:1180};
  // PC: dokładnie taki sam viewport jak aktualne okno przeglądarki.
  return {w:window.innerWidth,h:window.innerHeight};
}

function fitPreview(){
  if(!frame||!deviceFrame||!canvas)return;
  const {w,h}=targetViewport();
  const rect=canvas.getBoundingClientRect();
  const cs=getComputedStyle(canvas);
  const padX=(parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0);
  const padY=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0);
  const availW=Math.max(240,rect.width-padX);
  const availH=Math.max(240,rect.height-padY);
  // Nie powiększamy ponad 100%; tylko zmniejszamy, jeśli trzeba.
  const scale=Math.min(1,availW/w,availH/h);

  frame.style.width=`${w}px`;
  frame.style.height=`${h}px`;
  frame.style.transformOrigin='top left';
  frame.style.transform=`scale(${scale})`;
  frame.style.display='block';

  deviceFrame.style.width=`${Math.round(w*scale)}px`;
  deviceFrame.style.height=`${Math.round(h*scale)}px`;
  deviceFrame.style.maxWidth='none';
  deviceFrame.style.flex='0 0 auto';
  deviceFrame.style.overflow='hidden';
  deviceFrame.dataset.previewScale=String(scale);
  deviceFrame.dataset.previewWidth=String(w);
  deviceFrame.dataset.previewHeight=String(h);
}

function markMode(){
  const old=document.querySelector('#preview1to1Badge');
  if(old)old.remove();
  const badge=document.createElement('span');
  badge.id='preview1to1Badge';
  badge.textContent='Podgląd 1:1';
  badge.style.cssText='font:600 10px system-ui;color:#8f8f95;white-space:nowrap';
  const actions=document.querySelector('.veActions');
  if(actions)actions.insertBefore(badge,actions.firstChild);
}

window.addEventListener('resize',()=>requestAnimationFrame(fitPreview));
document.querySelectorAll('[data-device]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(fitPreview,180)));
frame?.addEventListener('load',()=>setTimeout(fitPreview,80));

markMode();
setTimeout(fitPreview,50);
setTimeout(fitPreview,300);
