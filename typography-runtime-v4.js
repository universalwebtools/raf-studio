// RAF.studio — public typography + logo runtime v4
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { firebaseConfig, WEBSITE_ROOT } from "./firebase-config.js";
const EDITOR=new URLSearchParams(location.search).has('editor');
const app=getApps().length?getApp():initializeApp(firebaseConfig),db=getDatabase(app);
const dev=()=>innerWidth<=640?'mobile':innerWidth<=980?'tablet':'desktop';
const cfg=(by={})=>{const d=dev(),desk=by.desktop||{};if(d==='desktop')return desk;const c=by[d]||{};return c.inherit===false?c:{...desk,...c}};
function textEl(k){return ['heroK','heroT','heroD'].includes(k)?document.getElementById(k):document.querySelector(`[data-home-text="${CSS.escape(k)}"]`)}
function applyText(el,c={}){if(!el)return;if(c.fontFamily)el.style.fontFamily=c.fontFamily;if(c.fontWeight)el.style.fontWeight=String(c.fontWeight);if(c.fontStyle)el.style.fontStyle=c.fontStyle;if(c.lineHeight)el.style.lineHeight=String(c.lineHeight);if(c.letterSpacing!==undefined&&c.letterSpacing!==null)el.style.letterSpacing=`${c.letterSpacing}px`;if(c.textTransform)el.style.textTransform=c.textTransform;if(c.textDecoration)el.style.textDecoration=c.textDecoration}
function apply(raw={}){for(const [k,by] of Object.entries(raw.visualStyles?.texts||{}))applyText(textEl(k),cfg(by));const b=cfg(raw.builder?.elements?.brandLogo||{});const brand=document.querySelector('.brand');if(brand){const img=brand.querySelector('img');if(img){if(b.logoUrl)img.src=b.logoUrl;if(b.logoWidth)img.style.width=`${b.logoWidth}px`}if(b.href&&'href'in brand)brand.href=b.href}}
if(!EDITOR)onValue(ref(db,`${WEBSITE_ROOT}/public`),s=>apply(s.val()||{}));
