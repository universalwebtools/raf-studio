import { getApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase,ref,onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
const db=getDatabase(getApp());
const $=(s,r=document)=>r.querySelector(s);
let sections=[];
function style(el,c={}){if(!el)return;el.style.translate=`${Number(c.x)||0}px ${Number(c.y)||0}px`;el.style.scale=String(Number(c.scale)||1);if(c.width)el.style.width=`${Number(c.width)}px`;if(c.fontSize)el.style.fontSize=`${Number(c.fontSize)}px`;if(c.fontWeight)el.style.fontWeight=String(c.fontWeight);if(c.color)el.style.color=c.color;if(c.align)el.style.textAlign=c.align;if(c.opacity!=null)el.style.opacity=String(Number(c.opacity)/100)}
function apply(){for(const s of sections){const sec=$(`.raf-custom-section[data-raf-section="${CSS.escape(String(s.id))}"]`);if(!sec)continue;const fs=s.fieldStyles||{};style($('h2',sec),fs.title);style($('.sectionHead p',sec)||$('p',sec),fs.text);style($('a.btn',sec),fs.button);const c=s.sectionStyle||{};if(c.paddingTop!=null)sec.style.paddingTop=`${c.paddingTop}px`;if(c.paddingBottom!=null)sec.style.paddingBottom=`${c.paddingBottom}px`;sec.style.minHeight=c.minHeight?`${c.minHeight}px`:'';if(c.background)sec.style.background=c.background;sec.style.display=s.hidden?'none':''}}
if(!new URLSearchParams(location.search).has('editor'))onValue(ref(db,'website/public/builder/customSections'),snap=>{const v=snap.val();sections=Array.isArray(v)?v:Object.values(v||{});setTimeout(apply,30)});
new MutationObserver(()=>{if(sections.length)apply()}).observe(document.body,{subtree:true,childList:true});
