const frame = document.querySelector('#siteFrame');
const deviceFrame = document.querySelector('#deviceFrame');
const canvas = document.querySelector('.veCanvas');
const left = document.querySelector('.veLeft');
const inspector = document.querySelector('.veInspector');

function currentDevice(){
  return document.querySelector('[data-device].active')?.dataset.device || 'desktop';
}

function targetViewport(){
  const d=currentDevice();
  if(d==='mobile') return {w:390,h:844};
  if(d==='tablet') return {w:820,h:1180};
  return {w:window.innerWidth,h:window.innerHeight};
}

function desktopTrue1to1(){
  const d=currentDevice();
  if(!frame||!deviceFrame||!canvas)return;
  if(d!=='desktop')return false;

  const w=window.innerWidth;
  const h=window.innerHeight;
  const topH=document.querySelector('.veTop')?.getBoundingClientRect().height||0;

  // Desktop 1:1: iframe ma dokładnie taki sam viewport jak zwykła strona.
  // Nie skalujemy go CSS-em. Panele są tylko nakładkami edytora i nie wpływają
  // na szerokość/layout strony renderowanej wewnątrz iframe.
  canvas.style.position='fixed';
  canvas.style.left='0';
  canvas.style.right='0';
  canvas.style.top=`${topH}px`;
  canvas.style.bottom='0';
  canvas.style.padding='0';
  canvas.style.display='block';
  canvas.style.overflow='hidden';
  canvas.style.zIndex='1';

  deviceFrame.style.position='absolute';
  deviceFrame.style.left='0';
  deviceFrame.style.top='0';
  deviceFrame.style.width=`${w}px`;
  deviceFrame.style.height=`${h}px`;
  deviceFrame.style.maxWidth='none';
  deviceFrame.style.overflow='hidden';
  deviceFrame.style.borderRadius='0';
  deviceFrame.style.boxShadow='none';

  frame.style.width=`${w}px`;
  frame.style.height=`${h}px`;
  frame.style.transform='none';
  frame.style.transformOrigin='top left';
  frame.style.display='block';

  // Panele pływają NAD podglądem i nie ściskają viewportu iframe.
  if(left){left.style.position='fixed';left.style.left='0';left.style.top=`${topH}px`;left.style.bottom='0';left.style.width='190px';left.style.zIndex='30';}
  if(inspector){inspector.style.position='fixed';inspector.style.right='0';inspector.style.top=`${topH}px`;inspector.style.bottom='0';inspector.style.width='320px';inspector.style.zIndex='30';}
  document.querySelector('.veTop')?.style.setProperty('z-index','40');

  deviceFrame.dataset.previewScale='1';
  deviceFrame.dataset.previewWidth=String(w);
  deviceFrame.dataset.previewHeight=String(h);
  document.body.classList.add('desktopTrue1to1');
  return true;
}

function fitPreview(){
  if(desktopTrue1to1())return;
  if(!frame||!deviceFrame||!canvas)return;
  document.body.classList.remove('desktopTrue1to1');

  // Przywróć normalny canvas dla tablet/telefon.
  canvas.style.position='';canvas.style.left='';canvas.style.right='';canvas.style.top='';canvas.style.bottom='';
  canvas.style.padding='20px';canvas.style.display='flex';canvas.style.overflow='auto';canvas.style.zIndex='';
  if(left){left.style.position='';left.style.left='';left.style.top='';left.style.bottom='';left.style.width='';left.style.zIndex='';}
  if(inspector){inspector.style.position='';inspector.style.right='';inspector.style.top='';inspector.style.bottom='';inspector.style.width='';inspector.style.zIndex='';}

  const {w,h}=targetViewport();
  const rect=canvas.getBoundingClientRect();
  const cs=getComputedStyle(canvas);
  const padX=(parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0);
  const padY=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0);
  const availW=Math.max(240,rect.width-padX);
  const availH=Math.max(240,rect.height-padY);
  const scale=Math.min(1,availW/w,availH/h);

  frame.style.width=`${w}px`;
  frame.style.height=`${h}px`;
  frame.style.transformOrigin='top left';
  frame.style.transform=`scale(${scale})`;
  frame.style.display='block';

  deviceFrame.style.position='';deviceFrame.style.left='';deviceFrame.style.top='';
  deviceFrame.style.width=`${Math.round(w*scale)}px`;
  deviceFrame.style.height=`${Math.round(h*scale)}px`;
  deviceFrame.style.maxWidth='none';
  deviceFrame.style.flex='0 0 auto';
  deviceFrame.style.overflow='hidden';
  deviceFrame.style.borderRadius='8px';
  deviceFrame.style.boxShadow='0 15px 60px #0009';
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
