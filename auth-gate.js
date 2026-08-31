import { getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 100 && !getApps().length; i++) await sleep(50);
if (!getApps().length) throw new Error('Firebase nie zostało zainicjalizowane.');

const auth = getAuth(getApp());
await setPersistence(auth, browserLocalPersistence);

const style = document.createElement('style');
style.textContent = `
.authGate{position:fixed;inset:0;z-index:9999;background:radial-gradient(circle at 50% 20%,#242426 0,#0d0d0e 46%,#050505 100%);display:grid;place-items:center;padding:20px}
.authGate[hidden]{display:none}
.authCard{width:min(430px,100%);background:#101011;border:1px solid #ffffff18;border-radius:24px;padding:34px;box-shadow:0 30px 100px #0008;color:#f5f5f2}
.authBrand{font-size:29px;font-weight:800;margin-bottom:25px}.authBrand span{font-weight:400;color:#8f8f95}.authEyebrow{font-size:11px;letter-spacing:.25em;color:#999;text-transform:uppercase;margin-bottom:7px}.authCard h1{font-size:32px;margin:0 0 8px}.authCard p{color:#9b9b9f;line-height:1.5;margin:0 0 22px}.authCard label{display:block;font-size:12px;color:#aaa;margin:13px 0 6px}.authCard input{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #343438;border-radius:12px;background:#09090a;color:#fff;font:inherit}.authPass{position:relative}.authPass input{padding-right:72px}.authShow{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#bbb;cursor:pointer;padding:8px}.authSubmit{width:100%;margin-top:18px;padding:13px;border:0;border-radius:999px;background:#f4f4f1;color:#09090a;font-weight:800;cursor:pointer}.authError{margin-top:12px;color:#ff8b8b!important;font-size:13px}.authUserBar{position:fixed;right:14px;bottom:14px;z-index:450;display:flex;gap:8px;align-items:center;background:#111;border:1px solid #ffffff18;border-radius:999px;padding:7px 8px 7px 12px;color:#aaa;font-size:12px}.authUserBar button{border:1px solid #ffffff1c;background:#ffffff0b;color:#ddd;border-radius:999px;padding:7px 10px;cursor:pointer}@media(max-width:700px){.authCard{padding:25px}.authUserBar span{display:none}}
`;
document.head.appendChild(style);

document.body.insertAdjacentHTML('beforeend', `
<div class="authGate" id="authGate">
  <form class="authCard" id="authForm">
    <div class="authBrand">RAF<span>.studio</span></div>
    <div class="authEyebrow">CENTRUM STEROWANIA</div>
    <h1>Logowanie administratora</h1>
    <p>Zaloguj się kontem utworzonym w Firebase. Ta przeglądarka zapamięta sesję.</p>
    <label for="authEmail">E-mail</label>
    <input id="authEmail" type="email" autocomplete="username" required>
    <label for="authPassword">Hasło</label>
    <div class="authPass"><input id="authPassword" type="password" autocomplete="current-password" required><button class="authShow" id="authShow" type="button">Pokaż</button></div>
    <button class="authSubmit" id="authSubmit" type="submit">Zaloguj</button>
    <p class="authError" id="authError" hidden></p>
  </form>
</div>
<div class="authUserBar" id="authUserBar" hidden><span id="authUser"></span><button id="authLogout" type="button">Wyloguj</button></div>`);

const gate=document.querySelector('#authGate');
const form=document.querySelector('#authForm');
const email=document.querySelector('#authEmail');
const pass=document.querySelector('#authPassword');
const error=document.querySelector('#authError');
const submit=document.querySelector('#authSubmit');
const userBar=document.querySelector('#authUserBar');
const userLabel=document.querySelector('#authUser');

const rememberedEmail=localStorage.getItem('rafStudioAdminEmail');
if(rememberedEmail) email.value=rememberedEmail;

document.querySelector('#authShow').onclick=()=>{
  const show=pass.type==='password';
  pass.type=show?'text':'password';
  document.querySelector('#authShow').textContent=show?'Ukryj':'Pokaż';
};

form.onsubmit=async e=>{
  e.preventDefault(); error.hidden=true; submit.disabled=true; submit.textContent='Logowanie…';
  try{
    await signInWithEmailAndPassword(auth,email.value.trim(),pass.value);
    localStorage.setItem('rafStudioAdminEmail',email.value.trim());
    pass.value='';
  }catch(err){
    error.textContent=err.code==='auth/invalid-credential'?'Nieprawidłowy e-mail lub hasło.':`Błąd logowania: ${err.message}`;
    error.hidden=false;
  }finally{submit.disabled=false;submit.textContent='Zaloguj'}
};

document.querySelector('#authLogout').onclick=()=>signOut(auth);

onAuthStateChanged(auth,user=>{
  if(user){
    gate.hidden=true; userBar.hidden=false; userLabel.textContent=user.email||'Administrator';
    const saveState=document.querySelector('#saveState');
    if(saveState && !saveState.textContent.includes('Firebase')) saveState.textContent='Administrator zalogowany ✓';
  }else{
    gate.hidden=false; userBar.hidden=true;
    setTimeout(()=>email.focus(),50);
  }
});
