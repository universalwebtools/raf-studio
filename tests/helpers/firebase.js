// Test-only SDK boundary. Production Firebase is never contacted by these tests.
export async function mockFirebase(page, seed = {}) {
  await page.addInitScript(seed => {
    const key = 'raf-test-database';
    let data = JSON.parse(sessionStorage.getItem(key) || 'null') || seed;
    const listeners = new Set();
    const copy = value => structuredClone(value ?? null);
    const read = path => path.split('/').filter(Boolean).reduce((v,k) => v?.[k], data) ?? null;
    const snap = path => ({val: () => copy(read(path)), exists: () => read(path) !== null});
    const write = (path, value) => {
      const keys=path.split('/').filter(Boolean), last=keys.pop();let node=data;
      for(const k of keys)node=node[k]??={};
      if(value == null)delete node[last];else node[last]=copy(value);
    };
    const notify = () => { sessionStorage.setItem(key,JSON.stringify(data)); for(const l of listeners){const value=JSON.stringify(read(l.path));if(value!==l.last){l.last=value;l.fn(snap(l.path))}} };
    window.__testDB = {
      sync(){data=JSON.parse(sessionStorage.getItem(key));for(const l of listeners){const value=JSON.stringify(read(l.path));if(value!==l.last){l.last=value;l.fn(snap(l.path))}}},
      writes: [], failNext: false, read: path => copy(read(path)),
      async set(path,value){if(this.failNext){this.failNext=false;throw new Error('Test write failure');}write(path,value);this.writes.push(path);notify();if(window.parent!==window)window.parent.__testDB?.sync();for(const f of document.querySelectorAll('iframe')){try{f.contentWindow.__testDB?.sync()}catch{}}},
      async update(path,values){if(this.failNext){this.failNext=false;throw new Error('Test write failure');}for(const [k,v] of Object.entries(values))write([path,k].filter(Boolean).join('/'),v);this.writes.push(path);notify();if(window.parent!==window)window.parent.__testDB?.sync();for(const f of document.querySelectorAll('iframe')){try{f.contentWindow.__testDB?.sync()}catch{}}},
      on(path,fn){const l={path,fn,last:JSON.stringify(read(path))};listeners.add(l);queueMicrotask(()=>fn(snap(path)));return()=>listeners.delete(l);},
      snap
    };
  }, seed);
  const modules = {
    'app': `export const getApp=()=>({}),getApps=()=>[{}],initializeApp=()=>({});`,
    'database': `const db=window.__testDB; export const getDatabase=()=>db,ref=(_,path='')=>path,get=async path=>db.snap(path),set=(path,value)=>db.set(path,value),update=(path,values)=>db.update(path,values),remove=path=>db.set(path,null),onValue=(path,fn)=>db.on(path,fn);`,
    'auth': `const user={uid:'local-test-user',email:'test@example.invalid',getIdToken:async()=> 'local-test-token'};const auth={currentUser:user};export const getAuth=()=>auth,setPersistence=async()=>{},browserLocalPersistence={},browserSessionPersistence={},onAuthStateChanged=(_,fn)=>{queueMicrotask(()=>fn(user));return()=>{}},signInWithEmailAndPassword=async()=>({user}),signOut=async()=>{};`,
    'storage': `const key='raf-test-storage';let rows=JSON.parse(sessionStorage.getItem(key)||'{}');export const getStorage=()=>({}),ref=(_,path)=>({fullPath:path,name:path.split('/').pop()}),listAll=async()=>({items:Object.keys(rows).map(path=>ref(null,path)),prefixes:[]}),getDownloadURL=async r=>rows[r.fullPath]?.url||'',getMetadata=async r=>rows[r.fullPath]||{},deleteObject=async()=>{},uploadBytesResumable=(r,file)=>{const task={snapshot:{ref:r},on:(_,progress,error,done)=>{queueMicrotask(()=>{rows[r.fullPath]={size:file.size,contentType:file.type,url:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="blue"/></svg>')};sessionStorage.setItem(key,JSON.stringify(rows));progress({bytesTransferred:file.size,totalBytes:file.size});done()})}};return task};`
  };
  await page.route('https://www.gstatic.com/firebasejs/**', route => {
    const name=route.request().url().match(/firebase-(\w+)\.js/)?.[1];
    if(!modules[name])throw new Error('Unexpected Firebase import: '+route.request().url());
    return route.fulfill({contentType:'text/javascript',body:modules[name]});
  });
  await page.route(/https?:\/\/(?!127\.0\.0\.1|localhost|www\.gstatic\.com\/firebasejs\/).*/, route=>route.abort());
}

export const seed = () => {
  const main={site:{heroT:'Test RAF',heroD:'Opis',email:'test@example.invalid'},homeContent:{sample:'Tekst próbny'},builder:{freeLayoutV7:{desktop:{},tablet:{},mobile:{}}}};
  return {website:{public:{...structuredClone(main),editorDraft:main,editorExtrasDraft:{},proV6Draft:{},customPagesDraft:{}}}};
};

export async function openFixture(page, {device='desktop',editor=true}={}) {
  await mockFirebase(page,seed());
  await page.goto('/tests/fixtures/canvas.html?device='+device+(editor?'&editor=direct':''));
  if(editor)await page.waitForFunction(()=>!!window.rafCore900);
  else await page.waitForFunction(()=>!!window.rafRenderer900);
  // The initial stable ID migration is part of boot, not a user edit.
  await page.waitForTimeout(900);
}
