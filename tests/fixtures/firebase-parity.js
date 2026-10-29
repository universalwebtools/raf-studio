// Isolated browser backend. All writes stay in this frame; no Firebase connection.
let data={};const listeners=[];
const read=p=>p.split('/').filter(Boolean).reduce((v,k)=>v?.[k],data);
const snapshot=p=>({exists:()=>read(p)!=null,val:()=>structuredClone(read(p)??null)});
export const initializeApp=()=>({}),getApp=()=>({}),getApps=()=>[{}],getDatabase=()=>({}),getStorage=()=>({}),ref=(_,p)=>p;
export const get=async p=>snapshot(p);
export function seed(value){data=structuredClone(value)}
export function onValue(p,fn){listeners.push([p,fn]);queueMicrotask(()=>fn(snapshot(p)));return()=>{}}
export async function set(p,value){const keys=p.split('/'),last=keys.pop();let node=data;for(const k of keys)node=node[k]||={};node[last]=structuredClone(value);for(const [path,fn] of listeners)if(path===p||path.startsWith(p+'/')||p.startsWith(path+'/'))fn(snapshot(path))}
export const remove=p=>set(p,null),listAll=async()=>({items:[]});
export function getDownloadURL(){throw Error('No uploads in the parity fixture')}
export function getMetadata(){throw Error('No uploads in the parity fixture')}
export function uploadBytesResumable(){throw Error('No uploads in the parity fixture')}
