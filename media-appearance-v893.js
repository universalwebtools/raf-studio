// The same saved media values must paint the same pixels in both runtimes.
const number=(value,fallback)=>value!=null&&Number.isFinite(Number(value))?Number(value):fallback;
export function mediaConfig(media={},device='desktop'){
 const desktop=media.desktop||{},own=media[device]||{};
 const inherit=device!=='desktop'&&own.inherit!==false&&media['inherit'+device[0].toUpperCase()+device.slice(1)]!==false;
 return {x:50,y:50,zoom:1,fit:'cover',brightness:100,contrast:100,opacity:100,radius:0,...(device==='desktop'||inherit?desktop:{}),...(device==='desktop'?{}:own)};
}
export function applyMediaAppearance(img,c={},visible=true){
 if(img.dataset.rafFrameManaged!=='1'){
  img.style.objectFit=c.fit||'cover';img.style.objectPosition=number(c.x,50)+'% '+number(c.y,50)+'%';
  img.style.transformOrigin=img.style.objectPosition;img.style.transform='scale('+Math.max(.05,number(c.zoom,1))+')';
 }
 img.style.filter='brightness('+number(c.brightness,100)+'%) contrast('+number(c.contrast,100)+'%)';
 img.style.borderRadius=Math.max(0,number(c.radius,0))+'px';
 if(visible)img.style.opacity=String(Math.max(0,Math.min(100,number(c.opacity,100)))/100);
}
