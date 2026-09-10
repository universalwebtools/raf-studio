// RAF.studio — meaningful Ctrl+Z guard v8.7.4
// Skips empty/no-op core history frames so every Ctrl+Z produces a real change.
(function(){
 const MAX_SKIP=24;
 function install(){
  const core=window.rafCore760||window.rafCore72;
  if(!core||core.__meaningfulUndo874)return false;

  const rawUndo=typeof core.undo==='function'?core.undo.bind(core):null;
  const rawRedo=typeof core.redo==='function'?core.redo.bind(core):null;
  if(!rawUndo||!rawRedo)return false;

  function signature(){
   try{
    const rows=(core.list?.()||[]).map(row=>{
     const c=row?.cfg||{};
     return [row?.id||'',c.x,c.y,c.width,c.height,c.scale,c.rotate,c.z,c.hidden,c.deleted,c.locked,c.group,c.text,c.href,c.src,c.fontFamily,c.fontSize,c.fontWeight,c.fontStyle,c.lineHeight,c.letterSpacing,c.color,c.textAlign,c.textTransform,c.textDecoration,c.fontKerning];
    });
    rows.sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
    return JSON.stringify(rows);
   }catch(err){
    console.warn('RAF meaningful history signature',err);
    return String(Date.now())+Math.random();
   }
  }

  core.undo=function(){
   const before=signature();
   let attempts=0;
   while(attempts++<MAX_SKIP&&core.canUndo?.()){
    if(!rawUndo())break;
    const after=signature();
    if(after!==before)return true;
   }
   return false;
  };

  core.redo=function(){
   const before=signature();
   let attempts=0;
   while(attempts++<MAX_SKIP&&core.canRedo?.()){
    if(!rawRedo())break;
    const after=signature();
    if(after!==before)return true;
   }
   return false;
  };

  core.__meaningfulUndo874=true;
  window.rafCore72=core;
  window.dispatchEvent(new CustomEvent('raf:meaningful-undo-ready'));
  return true;
 }

 if(!install()){
  const onReady=()=>{if(install())window.removeEventListener('raf:v760-ready',onReady)};
  window.addEventListener('raf:v760-ready',onReady);
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>80)clearInterval(timer)},50);
 }
})();
