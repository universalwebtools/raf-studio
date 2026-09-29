// Active catalog: eight templates. Legacy rendering is only for saved projects.
import {getApps,getApp,initializeApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getDatabase,ref,onValue} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js';
import {firebaseConfig,WEBSITE_ROOT} from './firebase-config.js';
import {TEMPLATES752,TEMPLATE_IDS752,mountTemplate,TEMPLATE_BUILD} from './template-collection-v893.js?v=893-eight-1';
export {TEMPLATES752,TEMPLATE_IDS752};
const q=new URLSearchParams(location.search),editor=q.has('editor'),preview=q.get('tplPreview'),db=getDatabase(getApps().length?getApp():initializeApp(firebaseConfig));
let selected='',generation=0,saved={},legacy;
function style(){if(document.getElementById('t6-style'))return;const l=document.createElement('link');l.id='t6-style';l.rel='stylesheet';l.href='/template-collection-v893.css?v='+TEMPLATE_BUILD;document.head.append(l)}
function applySaved(){
 if(!document.body.dataset.t6||editor||preview)return;const root=document.getElementById('rafTemplate752');if(!root)return;
 root.querySelectorAll('[data-home-text]').forEach(el=>{const v=saved.homeContent?.[el.dataset.homeText];if(v!=null)el.textContent=String(v)});
 root.querySelectorAll('[data-site-text]').forEach(el=>{const v=saved.site?.[el.dataset.siteText];if(v!=null)el.textContent=String(v)});
 const device=innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop';
 root.querySelectorAll('[data-home-media]').forEach(el=>{const c=saved.homeMedia?.[el.dataset.homeMedia];if(!c)return;if(c.url)el.src=c.url;const d={...(c.desktop||{}),...(device==='desktop'?{}:c[device]||{})};el.style.objectPosition=`${d.x??50}% ${d.y??50}%`;el.style.transform=`scale(${d.zoom??1})`;el.style.opacity=String((d.opacity??100)/100)});
}
async function choose(value,force=false){
 const id=preview||value?.id||value||'cinema';if(id===selected&&!force)return;selected=id;const run=++generation;
 if(TEMPLATES752[id]){style();let root=document.getElementById('rafTemplate752');if(!root){root=document.createElement('main');const old=document.getElementById('rafMain');if(old)old.after(root);else document.body.append(root)}mountTemplate(root,id,{editor});applySaved()}
 else{delete document.body.dataset.t6;legacy||=import('./template-legacy-v893.js?v=893-eight-1');const m=await legacy;if(run===generation){m.renderLegacy752(id);const root=document.getElementById('rafTemplate752');if(root)root.dataset.templateSections=root.querySelectorAll(':scope > [data-e752-sec]').length}}
}
if(preview)choose(preview);else{
 const base=WEBSITE_ROOT+'/public';onValue(ref(db,base+(editor?'/editorDraft':'')+'/builder/templateV752'),s=>{if(s.exists())choose(s.val());else onValue(ref(db,base+(editor?'/editorDraft':'')+'/builder/templateV75'),x=>choose(x.val()?.id||x.val()||'cinema'),{onlyOnce:true})});
 if(!editor)for(const k of ['site','homeContent','homeMedia'])onValue(ref(db,base+'/'+k),s=>{saved[k]=s.val()||{};applySaved()});
}
addEventListener('resize',applySaved);addEventListener('raf:template752-repair',()=>choose(selected,true));
