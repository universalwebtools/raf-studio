// Keep the IDs used by existing saved projects. These bindings must be created
// before either layout runtime sees the template, including on public pages.
export function bindTemplateElements(root,templateId,{editor=false}={}){
 if(!root)return;
 root.querySelectorAll('[data-e752-sec]').forEach((section,i)=>{
  if(editor)section.dataset.rafFree='1';
  section.querySelectorAll('h1,h2,h3,p,blockquote,a,button,img,article,form,input,select,textarea,strong,b,span,details,summary').forEach((el,k)=>{
   if(editor)el.dataset.rafFree='1';
   if(!el.dataset.rafV7Id)el.dataset.rafV7Id=`e752:${templateId||'tpl'}:${i}:${k}`;
  });
 });
}
