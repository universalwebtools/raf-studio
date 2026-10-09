/* Editor 9.0 authentication and read-only legacy bridge. No Firebase writes. */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "../firebase-config.js";

const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const gate=document.getElementById("auth90");
const form=document.getElementById("auth90Form");
const error=document.getElementById("auth90Error");
const submit=document.getElementById("auth90Submit");
const email=document.getElementById("auth90Email");
const password=document.getElementById("auth90Password");
try{await setPersistence(auth,browserLocalPersistence);}catch(err){console.warn("Persistence:",err);}
const stored=localStorage.getItem("rafStudioAdminEmail");if(stored)email.value=stored;
form.addEventListener("submit",async event=>{
  event.preventDefault();error.textContent="";submit.disabled=true;submit.textContent="Logowanie…";
  try{
    await signInWithEmailAndPassword(auth,email.value.trim(),password.value);
    localStorage.setItem("rafStudioAdminEmail",email.value.trim());password.value="";
  }catch(err){
    error.textContent=err.code==="auth/invalid-credential"?"Nieprawidłowy e-mail lub hasło.":"Logowanie nieudane: "+err.message;
  }finally{submit.disabled=false;submit.textContent="Zaloguj do edytora";}
});
onAuthStateChanged(auth,user=>{
  gate.hidden=!!user;
  if(!user)email.focus();
});
window.editor90ReadLegacy=async function(){
  if(!auth.currentUser)throw Error("Zaloguj się do Firebase.");
  const database=getDatabase(app);
  const snapshot=await get(ref(database,WEBSITE_ROOT+"/public"));
  if(!snapshot.exists())throw Error("Nie znaleziono podstawowych danych witryny.");
  return snapshot.val();
};
