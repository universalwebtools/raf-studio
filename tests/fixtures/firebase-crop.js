// Isolated browser regression backend: never connects to Firebase or uploads.
let data=JSON.parse(sessionStorage.getItem('raf-crop-regression')||'{}');
const listeners=[];
const read=path=>path.split('/').filter(Boolean).reduce((v,k)=>v?.[k],data);
const snapshot=path=>({exists:()=>read(path)!=null,val:()=>structuredClone(read(path)??null)});
export const initializeApp=()=>({});export const getApps=()=>[{}];export const getApp=()=>({});
export const getDatabase=()=>({});export const getStorage=()=>({});export const ref=(_,path)=>path;
export const get=async path=>snapshot(path);
export async function set(path,value){const keys=path.split('/'),last=keys.pop();let node=data;for(const k of keys)node=node[k]||=( {} );node[last]=structuredClone(value);sessionStorage.setItem('raf-crop-regression',JSON.stringify(data));for(const [p,fn] of listeners)fn(snapshot(p))}
export function onValue(path,fn){listeners.push([path,fn]);fn(snapshot(path));return()=>{}}
export function seed(value){data=structuredClone(value)}
export const saved=()=>structuredClone(data);
export function uploadBytesResumable(){throw Error('Uploads are disabled in regression tests')}
export function getDownloadURL(){throw Error('Uploads are disabled in regression tests')}
