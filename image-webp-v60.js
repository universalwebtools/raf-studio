// RAF.studio — automatic responsive WEBP/AVIF optimizer v8.9.3
const MAX=2400,QUALITY=.86,RESPONSIVE=[800,1600,2400];
function eligible(f){return f&&/^image\/(jpeg|png|webp)$/i.test(f.type)}
const stem=name=>String(name||'zdjecie').replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'')||'zdjecie';
async function encode(bmp,max,type='image/webp',quality=QUALITY){
 const scale=Math.min(1,max/Math.max(bmp.width,bmp.height)),w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale)),c=document.createElement('canvas');
 c.width=w;c.height=h;c.getContext('2d',{alpha:true}).drawImage(bmp,0,0,w,h);
 let blob=await new Promise(r=>c.toBlob(r,type,quality));
 if(!blob&&type==='image/avif')blob=await new Promise(r=>c.toBlob(r,'image/webp',quality));
 return{blob,width:w,height:h,type:blob?.type||type};
}
async function optimize(f){
 if(!eligible(f))return f;
 try{const bmp=await createImageBitmap(f),ow=bmp.width,oh=bmp.height,x=await encode(bmp,MAX,'image/webp');bmp.close?.();if(!x.blob)return f;const out=new File([x.blob],stem(f.name)+'.webp',{type:x.type,lastModified:Date.now()});return out.size<f.size||Math.max(x.width,x.height)<Math.max(ow,oh)?out:f}catch(e){console.warn('RAF image optimizer:',e);return f}
}
async function responsiveSet(f){
 if(!eligible(f))return{primary:f,variants:[{file:f,width:0,format:f.type}]};
 try{
  const bmp=await createImageBitmap(f),base=stem(f.name),variants=[];
  for(const width of RESPONSIVE){
   if(width>Math.max(bmp.width,bmp.height)&&variants.length)continue;
   const webp=await encode(bmp,width,'image/webp',width>=2400?.84:.82);
   if(webp.blob)variants.push({file:new File([webp.blob],base+'-'+width+'.webp',{type:webp.type,lastModified:Date.now()}),width:webp.width,height:webp.height,format:'webp'});
   const avif=await encode(bmp,width,'image/avif',width>=2400?.72:.68);
   if(avif.blob&&avif.type==='image/avif')variants.push({file:new File([avif.blob],base+'-'+width+'.avif',{type:'image/avif',lastModified:Date.now()}),width:avif.width,height:avif.height,format:'avif'});
  }
  bmp.close?.();const webps=variants.filter(x=>x.format==='webp'),primary=(webps.at(-1)||variants.at(-1))?.file||f;
  return{primary,variants,original:{name:f.name,size:f.size,type:f.type}};
 }catch(e){console.warn('RAF responsive optimizer:',e);return{primary:await optimize(f),variants:[]}}
}
window.rafOptimizeImageFile=optimize;
window.rafCreateResponsiveImageSet=responsiveSet;
document.addEventListener('change',async e=>{const input=e.target;if(!(input instanceof HTMLInputElement)||input.type!=='file'||input.dataset.rafWebpPass==='1')return;const files=[...(input.files||[])];if(!files.some(eligible))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const dt=new DataTransfer();for(const f of files)dt.items.add(await optimize(f));input.files=dt.files;input.dataset.rafWebpPass='1';input.dispatchEvent(new Event('change',{bubbles:true}));queueMicrotask(()=>delete input.dataset.rafWebpPass)},true);
document.addEventListener('drop',async e=>{const zone=e.target.closest?.('.v55Drop,.v54Drop,.v42Drop,.veDrop,.uploadDrop');if(!zone||zone.dataset.rafWebpPass==='1')return;const files=[...(e.dataTransfer?.files||[])];if(!files.some(eligible))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const dt=new DataTransfer();for(const f of files)dt.items.add(await optimize(f));zone.dataset.rafWebpPass='1';try{zone.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}))}finally{queueMicrotask(()=>delete zone.dataset.rafWebpPass)}},true);
