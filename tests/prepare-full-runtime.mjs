// Build an isolated copy of the REAL index.html and its entire module stack.
// Usage: node tests/prepare-full-runtime.mjs /absolute/preview/dist [private-snapshot.json]
// Never commit generated qa-project.json or a private project snapshot.
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildTemplate} from '../template-collection-v893.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dest=resolve(process.argv[2]);await mkdir(dest,{recursive:true});
const t=buildTemplate('rojczyk-white');
const main={site:t.site,homeContent:t.homeContent,homeMedia:t.homeMedia,visualStyles:t.visualStyles,builder:t.builder};
main.builder.freeLayoutV7={desktop:{
 'media:heroMedia':{x:0,y:0,scale:1,z:-1,crop:{x:34.61,y:31.38,zoom:1,fit:'cover'}},
 'e752:rojczyk-white:0:0':{width:471.6,height:600,scale:.89,x:49,y:3,imageFrame:'free',crop:{x:40.67,y:100,zoom:1.05,fit:'cover'}},
 'e752:rojczyk-white:2:0':{width:164.81,height:109.6,scale:2.88,x:205.3079,y:.0152,imageFrame:'free',crop:{x:50,y:50,zoom:1,fit:'cover'}}
}};
let data={...structuredClone(main),editorDraft:structuredClone(main),proV6:t.pro,proV6Draft:t.pro};
if(process.argv[3]){
 const snapshot=JSON.parse(await readFile(resolve(process.argv[3]),'utf8'));
 data=Object.fromEntries(['site','homeContent','homeMedia','visualStyles','builder','editorDraft','proV6','proV6Draft','publishedAt'].filter(k=>k in snapshot).map(k=>[k,snapshot[k]]));
}
await writeFile(resolve(dest,'qa-project.json'),JSON.stringify({website:{public:data}}));
let backend=await readFile(resolve(root,'tests/fixtures/firebase-parity.js'),'utf8');
backend=backend.replace('let data={};','let data=await (await fetch("/qa-project.json")).json();');
backend=backend.replace("export function getDownloadURL(){throw Error('No uploads in the parity fixture')}","export async function getDownloadURL(p){return p?.url||p}");
backend=backend.replace("export function uploadBytesResumable(){throw Error('No uploads in the parity fixture')}","export function uploadBytesResumable(p,file){const task={snapshot:{ref:{url:URL.createObjectURL(file)}},on(type,progress,error,done){queueMicrotask(()=>{progress({bytesTransferred:file.size,totalBytes:file.size});done()})}};return task}");
backend+=`\nexport async function update(p,values){for(const [k,v] of Object.entries(values))await set(p+'/'+k,v)}
const user={uid:'local-qa',email:'qa@example.invalid',getIdToken:async()=>''};
export const getAuth=()=>({currentUser:user}),setPersistence=async()=>{},browserLocalPersistence={},browserSessionPersistence={},onAuthStateChanged=(a,fn)=>{queueMicrotask(()=>fn(user));return()=>{}},signInWithEmailAndPassword=async()=>({user}),signOut=async()=>{};
`;
await writeFile(resolve(dest,'qa-firebase.js'),backend);
const imports=Object.fromEntries(['app','database','storage','auth'].map(x=>['https://www.gstatic.com/firebasejs/12.2.1/firebase-'+x+'.js','/qa-firebase.js']));
let html=await readFile(resolve(root,'index.html'),'utf8');
html=html.replace('<head>','<head><script type="importmap">'+JSON.stringify({imports})+'</script>');
html=html.replace('</body>',`<script type="module">
import {get,set} from '/qa-firebase.js';
addEventListener('message',async e=>{
 if(e.origin!==location.origin)return;
 if(e.data?.qa==='export')parent.postMessage({qa:'published',data:(await get('website/public')).val()},location.origin);
 if(e.data?.qa==='apply')await set('website/public',e.data.data);
 if(e.data?.qa==='remount')dispatchEvent(new CustomEvent('raf:template752-repair'));
 if(e.data?.qa==='scroll')document.querySelector(e.data.selector)?.scrollIntoView({block:'center'});
});
</script></body>`);
await writeFile(resolve(dest,'qa-runtime.html'),html);
await cp(resolve(root,'tests/full-runtime-parity.html'),resolve(dest,'qa-parity.html'));
console.log('Isolated full-runtime QA prepared. Open /qa-parity.html; all writes stay in memory.');
