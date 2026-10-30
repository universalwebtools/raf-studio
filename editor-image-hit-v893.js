// A negative image layer can be visible through its transparent container while
// pointer events hit that container. Resolve only that case; text/buttons win.
export function heroImageAtPoint(target,x,y){
 const hero=target?.closest?.('[data-raf-section="Hero"],header.hero');
 if(!hero)return null;
 for(const img of hero.querySelectorAll('img[data-home-media="heroMedia"]')){
  if(target!==img&&!target.contains(img))continue;
  const rect=img.getBoundingClientRect(),style=getComputedStyle(img);
  if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)continue;
  if(rect.width>0&&rect.height>0&&x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom)return img;
 }
 return null;
}
