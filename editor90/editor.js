/* RAF.studio Editor 9.0 — isolated draft, no production writes. */
(()=>{"use strict";
const KEY="rafStudioEditor90Draft.v1", SNAP="rafStudioEditor90Snapshots.v1";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const copy=o=>JSON.parse(JSON.stringify(o));
const id=()=>("s"+Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-3));
const esc=v=>String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const safe=v=>{const s=String(v||"").trim();if(/^https?:\/\//i.test(s)||/^\/assets\//.test(s)||/^data:image\/(webp|jpeg|png|gif);base64,/i.test(s))return esc(s);return "";};
const widgets=[
 ["hero","Pełnoekranowy HERO","◈"],["text","Tekst / o nas","T"],["gallery","Galeria zdjęć","▦"],
 ["features","Usługi / kafelki","▤"],["video","Film / showreel","▶"],["cta","Przycisk CTA","↗"],
 ["reviews","Opinie","❞"],["pricing","Cennik","₿"],["faq","FAQ","☷"],
 ["contact","Kontakt","✉"],["logos","Partnerzy","◎"],["spacer","Odstęp / linia","↕"],["footer","Stopka","▣"]
];
const names=Object.fromEntries(widgets.map(w=>[w[0],w[1]]));
const mediaSamples=["/assets/photo-wedding.png","/assets/photo-session.png","/assets/photo-product.png","/assets/photo-event.png"];
const defaults={
 hero:{kicker:"FOTOGRAFIA • FILM • DRON",title:"OBRAZ, KTÓRY ZOSTAJE.",body:"Autentyczne historie, przemyślane kadry i filmowy charakter.",buttonText:"ZOBACZ PORTFOLIO",link:"#portfolio",image:"/assets/photo-wedding.png"},
 text:{kicker:"POZNAJMY SIĘ",title:"Historie opowiedziane obrazem.",body:"Fotografia, filmy i realizacje z powietrza. Każdy projekt ma własny charakter, emocje i wyjątkowy detal."},
 gallery:{kicker:"WYBRANE REALIZACJE",title:"Portfolio",body:"Obrazy, do których chce się wracać.",images:mediaSamples.slice(),columns:3},
 features:{kicker:"CO ROBIĘ",title:"Fotografia i film",body:"Tworzę materiały dopasowane do Twojego projektu.",items:[["Fotografia","Sesje, reportaże i fotografia reklamowa."],["Film","Reklamy, rolki i dynamiczne realizacje."],["Dron","Kadry i filmy z nowej perspektywy."]]},
 video:{kicker:"SHOWREEL",title:"Zobacz moje realizacje",body:"Wklej adres filmu YouTube, Vimeo lub MP4.",video:""},
 cta:{kicker:"STWÓRZMY COŚ RAZEM",title:"Porozmawiajmy o Twoim projekcie",body:"Opowiedz mi o pomyśle — wspólnie ustalimy szczegóły.",buttonText:"SKONTAKTUJ SIĘ",link:"mailto:kontakt@raf-studio.pl"},
 reviews:{kicker:"OPINIE",title:"Co mówią klienci",items:[["Klient RAF.studio","Wspaniały kontakt i świetny efekt końcowy."],["Partner","Profesjonalne podejście i jakość realizacji."]]},
 pricing:{kicker:"OFERTA",title:"Pakiety współpracy",items:[["Basic","Wycena indywidualna"],["Pro","Wycena indywidualna"],["Premium","Wycena indywidualna"]]},
 faq:{kicker:"PYTANIA I ODPOWIEDZI",title:"FAQ",items:[["Jak wygląda współpraca?","Najpierw ustalamy pomysł, termin i szczegóły realizacji."],["Gdzie pracujesz?","Realizuję projekty w całej Polsce."]]},
 contact:{kicker:"KONTAKT",title:"Zrealizujmy Twój pomysł.",body:"Skontaktuj się ze mną i opowiedz o swoim projekcie.",email:"kontakt@raf-studio.pl",phone:"",instagram:"https://instagram.com/"},
 logos:{kicker:"ZAUFALI MI",title:"Współpraca",items:[["MARKA 01",""],["MARKA 02",""],["MARKA 03",""]]},
 spacer:{title:"Odstęp",body:""},
 footer:{title:"RAF.studio",body:"Fotografia • Film • Dron",email:"kontakt@raf-studio.pl"}
};
function section(type){
 const props=copy(defaults[type]||defaults.text);
 return {id:id(),type,name:names[type]||"Sekcja",props,
 responsive:{desktop:{padding:type==="hero"?92:70,minHeight:type==="hero"?580:0,columns:props.columns||3,align:"left",background:type==="hero"?"#14171b":type==="footer"?"#0b0c0d":"#16191c",textColor:"#f5f5f3",fontScale:100},tablet:{},mobile:{}},
 hidden:{desktop:false,tablet:false,mobile:false}};
}
function page(name,slug,types){return {id:id(),name,slug,sections:types.map(section)};}
function initialProject(){
 const home=page("Strona główna","/",["hero","gallery","features","cta","contact","footer"]);
 const photo=page("Fotografia","/fotografia",["hero","gallery","text","contact","footer"]);
 photo.sections[0].props.title="FOTOGRAFIA.";photo.sections[0].props.image="/assets/photo-session.png";
 const film=page("Film","/film",["hero","video","features","contact","footer"]);
 film.sections[0].props.title="FILM.";film.sections[0].props.image="/assets/film-ad.png";
 return {schema:"raf-editor-90",version:"9.0.0-beta.1",name:"RAF.studio",theme:{accent:"#d7b58a",background:"#121417",text:"#f5f5f3",font:"Inter"},pages:[home,photo,film],media:[],updatedAt:Date.now()};
}
function normalize(v){if(!v||v.schema!=="raf-editor-90"||!Array.isArray(v.pages)||!v.pages.length)throw Error("Plik nie jest projektem edytora 9.0.");
 v.pages.forEach(p=>{if(!Array.isArray(p.sections))p.sections=[];p.sections.forEach(s=>{s.props||={};s.responsive||={};s.responsive.desktop||={};s.responsive.tablet||={};s.responsive.mobile||={};s.hidden||={desktop:false,tablet:false,mobile:false};});});v.media=Array.isArray(v.media)?v.media:[];v.theme||=initialProject().theme;return v;}
let project;try{project=normalize(JSON.parse(localStorage.getItem(KEY)||"null"));}catch{project=initialProject();}
const ui={pageId:project.pages[0].id,device:"desktop",tab:"layers",selected:[],zoom:100,undo:[],redo:[],toastTimer:null};
const activePage=()=>project.pages.find(p=>p.id===ui.pageId)||project.pages[0];
const selectedSections=()=>activePage().sections.filter(s=>ui.selected.includes(s.id));
const selected=()=>selectedSections()[0]||null;
function status(text){$("#saveStatus").textContent=text;}
function persist(){project.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(project));status("✓ Zapis lokalny");}catch(err){status("⚠ Brak miejsca na zapis");toast("Nie udało się zapisać szkicu: "+err.message);}}
function checkpoint(){ui.undo.push(JSON.stringify(project));if(ui.undo.length>75)ui.undo.shift();ui.redo=[];refreshUndo();}
function transact(fn){checkpoint();fn();persist();renderAll();}
function undo(){if(!ui.undo.length)return;ui.redo.push(JSON.stringify(project));project=normalize(JSON.parse(ui.undo.pop()));repairPage();persist();renderAll();}
function redo(){if(!ui.redo.length)return;ui.undo.push(JSON.stringify(project));project=normalize(JSON.parse(ui.redo.pop()));repairPage();persist();renderAll();}
function refreshUndo(){$("#undo").disabled=!ui.undo.length;$("#redo").disabled=!ui.redo.length;}
function repairPage(){if(!project.pages.some(p=>p.id===ui.pageId))ui.pageId=project.pages[0].id;ui.selected=ui.selected.filter(x=>activePage().sections.some(s=>s.id===x));}
function toast(text){const t=$("#toast");t.textContent=text;t.hidden=false;clearTimeout(ui.toastTimer);ui.toastTimer=setTimeout(()=>t.hidden=true,3600);}
function config(s){const a=s.responsive||{},d=a.desktop||{},t=a.tablet||{},m=a.mobile||{};return Object.assign({},d,ui.device!=="desktop"?t:{},ui.device==="mobile"?m:{});}
function effectiveHidden(s){return !!(s.hidden&&s.hidden[ui.device]);}
function inline(prop,text,tag,cls){return "<"+tag+" class=\"inline "+(cls||"")+"\" data-edit=\""+esc(prop)+"\" tabindex=\"0\" title=\"Kliknij dwukrotnie, aby edytować\">"+esc(text)+"</"+tag+">";}
function head(s){const p=s.props;return "<div class=\"section-head\">"+inline("kicker",p.kicker||"","div","tagline")+inline("title",p.title||"","h2","")+ (p.body?inline("body",p.body,"p","body-copy"):"")+"</div>";}
function youtube(raw){try{const u=new URL(raw);const host=u.hostname.replace(/^www\./,"");if(host==="youtu.be")return "https://www.youtube-nocookie.com/embed/"+encodeURIComponent(u.pathname.slice(1).split("/")[0]);if(host==="youtube.com"||host==="m.youtube.com"){const v=u.searchParams.get("v");if(v)return "https://www.youtube-nocookie.com/embed/"+encodeURIComponent(v);const m=u.pathname.match(/^\/(embed|shorts)\/([a-zA-Z0-9_-]+)/);if(m)return "https://www.youtube-nocookie.com/embed/"+encodeURIComponent(m[2]);}if(host==="vimeo.com"||host==="player.vimeo.com"){const m=u.pathname.match(/(\d+)/);if(m)return "https://player.vimeo.com/video/"+m[1];}}catch{}return "";}
function link(raw){const v=String(raw||"").trim();return (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(v)&&!/^\/\//.test(v))?esc(v):"#";}
function button(p){return p.buttonText?"<a class=\"site-btn\" tabindex=\"-1\" href=\""+link(p.link)+"\" onclick=\"return false\">"+esc(p.buttonText)+" ↗</a>":"";}
function mediaVideo(raw){if(!raw)return "<div class=\"video-empty\">▶ &nbsp; Wybierz film w panelu po prawej</div>";const embed=youtube(raw);if(embed)return "<iframe src=\""+esc(embed)+"\" title=\"Podgląd filmu\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\" allowfullscreen></iframe>";const url=safe(raw);if(url&&/\.(mp4|webm)(\?|#|$)/i.test(raw))return "<video src=\""+url+"\" controls muted playsinline preload=\"none\"></video>";return "<div class=\"video-empty\">Podaj adres YouTube, Vimeo lub pliku MP4 / WebM.</div>";}
function sectionHtml(s,preview=false){
 const p=s.props||{},c=config(s),min=Math.max(0,Number(c.minHeight)||0),pad=Math.max(0,Math.min(220,Number(c.padding)||0));
 const align=["left","center","right"].includes(c.align)?c.align:"left";
 const color=/^#[a-f0-9]{3,8}$/i.test(c.textColor||"")?c.textColor:project.theme.text;
 const bg=/^#[a-f0-9]{3,8}$/i.test(c.background||"")?c.background:project.theme.background;
 const cols=Math.max(1,Math.min(5,ui.device==="mobile"?(s.responsive.mobile.columns||1):ui.device==="tablet"?(s.responsive.tablet.columns||2):Number(c.columns)||3));
 const scale=Math.max(60,Math.min(175,Number(c.fontScale)||100));
 const sty="background:"+esc(bg)+";color:"+esc(color)+";padding:"+pad+"px 6%;min-height:"+min+"px;text-align:"+align+";font-size:"+scale+"%;";
 let body="",items=Array.isArray(p.items)?p.items:[],imgs=Array.isArray(p.images)?p.images:[];
 if(s.type==="hero"){
 const image=safe(p.image);const heroBg=image?"background-image:linear-gradient(90deg,#08090bd9,#0b0d0d66),url('"+image+"');background-size:cover;background-position:center;":"";
 body="<div class=\"inner hero-inner\" style=\""+heroBg.replace(/"/g,"&quot;")+"\">"+inline("kicker",p.kicker,"div","tagline")+inline("title",p.title,"h1","hero-title")+inline("body",p.body,"p","hero-desc")+button(p)+"</div>";
 }else if(s.type==="text"){body="<div class=\"inner\">"+head(s)+"</div>";}
 else if(s.type==="gallery"){body="<div class=\"inner\">"+head(s)+"<div class=\"photo-grid\" style=\"grid-template-columns:repeat("+cols+",minmax(0,1fr))\">"+imgs.map((x,i)=>"<div class=\"photo-item\"><img loading=\"lazy\" src=\""+safe(x)+"\" alt=\"Zdjęcie portfolio "+(i+1)+"\"><label>"+esc((p.labels||[])[i]||"")+"</label></div>").join("")+"</div></div>";}
 else if(s.type==="features"||s.type==="reviews"||s.type==="pricing"){let clazz=s.type==="features"?"feature-grid":s.type==="reviews"?"review-grid":"prices-grid";let cc=s.type==="features"?"feature-card":s.type==="reviews"?"review-card":"price-card";body="<div class=\"inner\">"+head(s)+"<div class=\""+clazz+"\" style=\"grid-template-columns:repeat("+cols+",minmax(0,1fr))\">"+items.map(x=>"<div class=\""+cc+"\"><h3>"+esc(x[0])+"</h3>"+(s.type==="pricing"?"<strong>"+esc(x[1])+"</strong>":"<p>"+esc(x[1])+"</p>")+"</div>").join("")+"</div></div>";}
 else if(s.type==="video"){body="<div class=\"inner\">"+head(s)+"<div class=\"video-shell\">"+mediaVideo(p.video)+"</div></div>";}
 else if(s.type==="cta"){body="<div class=\"inner\">"+head(s)+button(p)+"</div>";}
 else if(s.type==="faq"){body="<div class=\"inner\">"+head(s)+items.map(x=>"<div class=\"faq-item\"><strong>"+esc(x[0])+"</strong><p>"+esc(x[1])+"</p></div>").join("")+"</div>";}
 else if(s.type==="contact"){body="<div class=\"inner contact-grid\"><div>"+head(s)+"</div><div><h3>Kontakt</h3><a href=\"mailto:"+esc(p.email)+"\">"+esc(p.email)+"</a>"+(p.phone?"<a href=\"tel:"+esc(p.phone)+"\">"+esc(p.phone)+"</a>":"")+(p.instagram?"<a href=\""+link(p.instagram)+"\" onclick=\"return false\">Instagram ↗</a>":"")+"</div></div>";}
 else if(s.type==="logos"){body="<div class=\"inner\">"+head(s)+"<div class=\"logos-grid\" style=\"grid-template-columns:repeat("+cols+",minmax(0,1fr))\">"+items.map(x=>"<div>"+esc(x[0])+"</div>").join("")+"</div></div>";}
 else if(s.type==="spacer"){body="<div class=\"inner\" style=\"height:8px;border-top:1px solid #ffffff25\"></div>";}
 else if(s.type==="footer"){body="<div class=\"inner site-footer\">"+inline("title",p.title,"h2","")+inline("body",p.body,"p","")+("<small>"+esc(p.email||"")+"</small>")+"</div>";}
 else{body="<div class=\"inner\">"+head(s)+"</div>";}
 const cls="site-section"+(ui.selected.includes(s.id)&&!preview?" "+(ui.selected.length>1?"multi-selected":"selected"):"")+(effectiveHidden(s)?" hidden-device":"");
 const tools=preview?"":"<div class=\"section-tools\"><button data-action=\"up\" title=\"W górę\">↑</button><button data-action=\"down\" title=\"W dół\">↓</button><button data-action=\"clone\" title=\"Duplikuj\">⧉</button><button data-action=\"remove\" title=\"Usuń\">✕</button></div>";
 return "<section class=\""+cls+"\" data-id=\""+esc(s.id)+"\" style=\""+sty+"--theme-accent:"+esc(project.theme.accent)+"\">"+(effectiveHidden(s)&&!preview?"<div class=\"hidden-ribbon\">Ukryte na tym urządzeniu</div>":"")+tools+body+"</section>";
}
