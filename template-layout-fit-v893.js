// Preserve a saved large-screen composition where it fits. On smaller screens,
// use White Story's responsive flow instead of clipping its navigation and copy.
export function fitTemplateLayout(layout,id,device,{family,hero,width}){
 const desktop=layout.desktop?.[id]||{},local=device==='desktop'?{}:layout[device]?.[id]||{};
 const config=device==='desktop'?{...desktop}:{...desktop,...local};
 if(!Object.keys(config).length)return config;
 const canvas=layout.desktop?.['section:Hero']||{};
 const canvasWidth=Number(canvas.width)*Math.max(.05,Number(canvas.scale)||1);
 const ownCanvas=device!=='desktop'&&Number(layout[device]?.['section:Hero']?.width)>0;
 if(family!=='roj'||!hero||ownCanvas||!Number.isFinite(canvasWidth)||canvasWidth<=width+1)return config;
 // Explicit settings for the smaller device still win; only inherited desktop
 // geometry is reset. Null sizes clear previously applied inline dimensions.
 return {...config,x:local.x??0,y:local.y??0,width:local.width??null,height:local.height??null,scale:local.scale??1,rotate:local.rotate??0};
}
