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
 return {schema:"raf-editor-90",version:"9.0.0-beta.1",name:"RAF.studio",theme:{accent:"#d7b58a",background:"#121417",text:"#f5f5f3",font:"Inter",layout:"cinematic"},pages:[home,photo,film],media:[],updatedAt:Date.now()};
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
 const sty="background:"+esc(bg)+";color:"+esc(color)+";padding:"+pad+"px 6%;min-height:"+min+"px;text-align:"+align+";font-size:"+scale+"%;--font-scale:"+(scale/100)+";";
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

function renderCanvas(){
 const p=activePage(),canvas=$("#siteCanvas");
 canvas.className="site-canvas "+ui.device+" theme-"+(project.theme.layout||"cinematic");canvas.style.zoom=(ui.zoom/100);canvas.style.fontFamily=project.theme.font+",sans-serif";
 canvas.style.background=project.theme.background;
 canvas.innerHTML=p.sections.map(s=>sectionHtml(s)).join("")||"<div style=\"padding:70px;text-align:center\">Dodaj pierwszą sekcję w panelu po lewej.</div>";
 $("#currentPageName").textContent=p.name;$("#selectionName").textContent=ui.selected.length===1?selected().name:ui.selected.length>1?ui.selected.length+" zaznaczone":"Brak zaznaczenia";
 $("#deviceSize").textContent={desktop:"Elastyczny / 1440 px",tablet:"768 px",mobile:"390 px"}[ui.device];
 $("#itemCounter").textContent=p.sections.length+" sekcji · "+project.pages.length+" stron";
}
function highlightSelection(){
 $$(".site-section",$("#siteCanvas")).forEach(el=>{const match=ui.selected.includes(el.dataset.id);el.classList.toggle("selected",match&&ui.selected.length===1);el.classList.toggle("multi-selected",match&&ui.selected.length>1);});
 $("#selectionName").textContent=ui.selected.length===1?(selected()?.name||"Sekcja"):ui.selected.length>1?ui.selected.length+" zaznaczone":"Brak zaznaczenia";
}
function choose(id,add){if(add){ui.selected=ui.selected.includes(id)?ui.selected.filter(x=>x!==id):[...ui.selected,id];}else ui.selected=[id];highlightSelection();renderSidebar();renderInspector();}
function field(label,key,type="text",value,scope="prop",extra=""){
 const isCheck=type==="checkbox",raw=value==null?"":value,attr="data-"+scope+"=\""+esc(key)+"\"";
 const input=type==="textarea"?"<textarea "+attr+" "+extra+">"+esc(raw)+"</textarea>":type==="select"?"<select "+attr+">"+extra+"</select>":"<input "+attr+" type=\""+esc(type)+"\" "+(isCheck?(raw?"checked":""):"value=\""+esc(raw)+"\"")+" "+extra+">";
 return isCheck?"<label class=\"check-control\">"+input+" "+esc(label)+"</label>":"<div class=\"control\"><label>"+esc(label)+"</label>"+input+"</div>";
}
function selectField(label,key,options,value,scope="style"){
 const opts=options.map(o=>"<option value=\""+esc(o[0])+"\" "+(String(o[0])===String(value)?"selected":"")+">"+esc(o[1])+"</option>").join("");
 return field(label,key,"select",value,scope,opts);
}
function renderInspector(){
 const body=$("#inspectorBody"),s=selected(),multi=selectedSections(),name=$("#inspectorTitle");
 if(multi.length>1){
 name.textContent=multi.length+" zaznaczone sekcje";
 body.innerHTML="<p class=\"hint\">Zaznaczaj kolejne elementy, trzymając Shift lub Alt.</p><div class=\"panel-actions\"><button class=\"small-btn\" data-inspector-action=\"group-up\">↑ Wyżej</button><button class=\"small-btn\" data-inspector-action=\"group-down\">↓ Niżej</button><button class=\"small-btn\" data-inspector-action=\"group-clone\">⧉ Duplikuj</button><button class=\"small-btn danger\" data-inspector-action=\"group-delete\">Usuń zaznaczone</button></div><p class=\"subtle\">Grupowe przesuwanie i duplikowanie sekcji. Skalowanie elementów wewnątrz grupy pojawi się w kolejnej iteracji.</p>";
 return;
 }
 if(!s){name.textContent="Wybierz sekcję";body.innerHTML="<p class=\"hint\">Kliknij sekcję w podglądzie lub panelu warstw. Dwuklik na tekście edytuje go bezpośrednio.</p><div class=\"banner\">Publikacja na żywej stronie jest zablokowana. Wszystkie zmiany działają wyłącznie w szkicu 9.0.</div><button class=\"small-btn primary\" data-inspector-action=\"add\">＋ Dodaj sekcję</button>";return;}
 name.textContent=s.name;const p=s.props,c=config(s);
 let h="<div class=\"panel-actions\"><button class=\"small-btn\" data-inspector-action=\"up\">↑</button><button class=\"small-btn\" data-inspector-action=\"down\">↓</button><button class=\"small-btn\" data-inspector-action=\"clone\">⧉ Duplikuj</button><button class=\"small-btn danger\" data-inspector-action=\"remove\">Usuń</button></div>";
 h+="<div class=\"section-label\">Sekcja</div>"+field("Nazwa warstwy","name","text",s.name,"meta");
 h+="<div class=\"section-label\">Zawartość</div>";
 for(const key of ["kicker","title","body","buttonText","link","image","video","email","phone","instagram"]){
 if(!(key in p))continue;
 const lbl={kicker:"Nadtytuł",title:"Nagłówek",body:"Treść",buttonText:"Tekst przycisku",link:"Link przycisku",image:"Obraz / URL",video:"Adres filmu",email:"Adres e-mail",phone:"Telefon",instagram:"Instagram"}[key];
 h+=field(lbl,key,key==="body"?"textarea":"text",p[key]);
 }
 if("images" in p)h+=field("Zdjęcia galerii (jeden URL w wierszu)","images","textarea",(p.images||[]).join("\n"))+"<button class=\"small-btn\" data-inspector-action=\"choose-media\">＋ Zdjęcia z biblioteki</button>";
 if("items" in p)h+=field("Elementy (nazwa | opis w każdym wierszu)","items","textarea",(p.items||[]).map(x=>x.join(" | ")).join("\n"));
 h+="<div class=\"section-label\">Wygląd · "+({desktop:"Komputer",tablet:"Tablet",mobile:"Telefon"}[ui.device])+"</div>";
 h+=field("Odstęp wewnętrzny (px)","padding","number",c.padding??70,"style","min=\"0\" max=\"220\"");
 h+=field("Minimalna wysokość (px)","minHeight","number",c.minHeight??0,"style","min=\"0\" max=\"1400\"");
 h+=selectField("Liczba kolumn","columns",[[1,"1"],[2,"2"],[3,"3"],[4,"4"],[5,"5"]],c.columns||3);
 h+=selectField("Wyrównanie","align",[["left","Do lewej"],["center","Wyśrodkuj"],["right","Do prawej"]],c.align||"left");
 h+=field("Kolor tła","background","color",c.background||"#16191c","style");
 h+=field("Kolor tekstu","textColor","color",c.textColor||"#ffffff","style");
 h+=field("Skala typografii (%)","fontScale","number",c.fontScale||100,"style","min=\"60\" max=\"175\"");
 h+=field("Ukryj tylko na tym urządzeniu","hidden","checkbox",effectiveHidden(s),"meta");
 if(ui.device!=="desktop")h+="<button class=\"small-btn\" data-inspector-action=\"reset-device\">Wyczyść zmiany dla tego urządzenia</button>";
 h+="<p class=\"subtle\">Ustawienia urządzenia nie zmieniają wyglądu desktopu. Sekcje możesz przesuwać strzałkami na podglądzie.</p>";
 body.innerHTML=h;
}
function renderSidebar(){
 const title=$("#sidebarTitle"),aux=$("#sidebarAux"),box=$("#sidebarContent"),s=selected();
 $$(".panel-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===ui.tab));
 if(ui.tab==="layers"){
 title.textContent="Warstwy strony";aux.textContent=activePage().sections.length+" sekcji";
 box.innerHTML="<div class=\"subtle\" style=\"padding:4px 8px 13px\">Kliknij, aby zaznaczyć. Shift/Alt + klik zaznacza kilka. Przeciągnij, aby zmienić kolejność.</div>"+activePage().sections.map((v,i)=>"<button class=\"layer "+(ui.selected.includes(v.id)?"active":"")+"\" data-select=\""+esc(v.id)+"\" draggable=\"true\" data-drag=\""+esc(v.id)+"\"><span class=\"handle\">☰</span><span class=\"lname\">"+esc(v.name)+"</span><small>"+(effectiveHidden(v)?"◌":"")+"</small><span class=\"move-arrows\">"+(i+1)+"</span></button>").join("")+"<div style=\"padding:14px 6px\"><button class=\"outline-btn\" data-side-action=\"add\" style=\"width:100%\">＋ Dodaj sekcję</button></div>";
 }else if(ui.tab==="add"){
 title.textContent="Dodaj widżet";aux.textContent=widgets.length+" typów";
 box.innerHTML="<p class=\"subtle\" style=\"margin:3px 5px 16px\">Nowy element pojawi się od razu z przykładową treścią, pod zaznaczoną sekcją.</p><div class=\"widget-grid\">"+widgets.map(w=>"<button class=\"widget-card\" data-widget=\""+w[0]+"\"><span class=\"widget-icon\">"+w[2]+"</span><strong>"+esc(w[1])+"</strong></button>").join("")+"</div>";
 }else if(ui.tab==="pages"){
 title.textContent="Podstrony";aux.textContent=project.pages.length+" stron";
 box.innerHTML="<div class=\"panel-actions\" style=\"padding:0 5px\"><button class=\"small-btn primary\" data-side-action=\"new-page\">＋ Nowa podstrona</button></div>"+project.pages.map(p=>"<div class=\"page-row "+(p.id===ui.pageId?"active":"")+"\"><button data-page=\""+esc(p.id)+"\"><b>"+esc(p.name)+"</b><div class=\"subtle\">"+esc(p.slug)+"</div></button>"+(p.id===ui.pageId?"<button data-side-action=\"rename-page\" title=\"Zmień nazwę\">✎</button>":"")+"</div>").join("")+"<div class=\"section-label\">Projekt i wersje</div><div class=\"panel-actions\"><button class=\"small-btn\" data-side-action=\"templates\">Szablony</button><button class=\"small-btn\" data-side-action=\"snapshot\">Zapisz punkt przywracania</button><button class=\"small-btn\" data-side-action=\"restore\">Przywróć punkt</button><button class=\"small-btn\" data-side-action=\"export\">Eksport JSON</button><button class=\"small-btn\" data-side-action=\"import\">Import JSON</button><button class=\"small-btn\" data-side-action=\"legacy\">Import podstawowej treści 8.x (tylko odczyt)</button></div><p class=\"subtle\">Szkic 9.0 ma własny format danych, niezależny od edytorów 7.x–8.9.3.</p>";
 }else if(ui.tab==="media"){
 title.textContent="Biblioteka mediów";aux.textContent=project.media.length+" zdjęć";
 box.innerHTML="<div class=\"banner\">Zdjęcia w tej wersji kompresowane są lokalnie i zapisywane w przeglądarce. Nie trafiają do Firebase ani na publiczną stronę. Dla większej liczby plików użyj adresów URL.</div><div class=\"panel-actions\"><button class=\"small-btn primary\" data-side-action=\"upload\">＋ Dodaj zdjęcia</button></div>"+project.media.map(m=>"<div class=\"media-row\"><img class=\"media-thumbnail\" src=\""+safe(m.url)+"\" alt=\"\"><button data-media=\""+esc(m.id)+"\" title=\"Wstaw do zaznaczonej sekcji\">"+esc(m.name)+"</button><button data-media-remove=\""+esc(m.id)+"\" title=\"Usuń z biblioteki\">✕</button></div>").join("")+(project.media.length?"":"<p class=\"subtle\">Brak zapisanych zdjęć. Możesz dodawać JPG, PNG lub WebP.</p>");
 }else if(ui.tab==="design"){
 title.textContent="Style globalne";aux.textContent="Cały projekt";
 const t=project.theme;
 box.innerHTML="<p class=\"subtle\">Paleta i font stosowane w obu trybach podglądu. Kolory sekcji mogą mieć własne nadpisania.</p>"+field("Kolor akcentowy","accent","color",t.accent,"theme")+field("Tło projektu","background","color",t.background,"theme")+field("Domyślny kolor tekstu","text","color",t.text,"theme")+selectField("Krój pisma","font",[["Inter","Inter / systemowy"],["Georgia","Georgia / editorial"],["Arial","Arial"],["Verdana","Verdana"]],t.font,"theme")+"<div class=\"section-label\">Palety kolorów</div><div class=\"panel-actions\"><button class=\"small-btn\" data-palette=\"dark\">Cinematic</button><button class=\"small-btn\" data-palette=\"cream\">Wedding</button><button class=\"small-btn\" data-palette=\"minimal\">Minimal</button></div>";
 }
}
function renderAll(){
 repairPage();if(document.activeElement!==$("#projectName"))$("#projectName").value=project.name;
 $$(".device").forEach(b=>b.classList.toggle("active",b.dataset.device===ui.device));
 $("#zoom").value=String(ui.zoom);
 renderCanvas();renderSidebar();renderInspector();refreshUndo();
}
function move(ids,offset){
 const arr=activePage().sections,indices=arr.map((x,i)=>ids.includes(x.id)?i:-1).filter(x=>x>=0);
 if(!indices.length)return;
 if(offset<0){for(const i of indices)if(i>0&&!ids.includes(arr[i-1].id))[arr[i-1],arr[i]]=[arr[i],arr[i-1]];}
 else{for(const i of indices.reverse())if(i<arr.length-1&&!ids.includes(arr[i+1].id))[arr[i],arr[i+1]]=[arr[i+1],arr[i]];}
}
function removeSelected(){const chosen=ui.selected.slice();if(!chosen.length)return;if(!confirm("Usunąć zaznaczone sekcje wyłącznie ze szkicu 9.0?"))return;transact(()=>{activePage().sections=activePage().sections.filter(s=>!chosen.includes(s.id));ui.selected=[];});}
function cloneSelected(){const ids=ui.selected.slice(),arr=activePage().sections;if(!ids.length)return;transact(()=>{const newIds=[];for(const sid of ids){const n=arr.findIndex(x=>x.id===sid);if(n<0)continue;const item=copy(arr[n]);item.id=id();item.name+=" — kopia";arr.splice(n+1,0,item);newIds.push(item.id);}ui.selected=newIds;});}
function doAction(action){if(action==="add"){ui.tab="add";renderSidebar();return;}if(action==="up"||action==="group-up")return transact(()=>move(ui.selected,-1));if(action==="down"||action==="group-down")return transact(()=>move(ui.selected,1));if(action==="clone"||action==="group-clone")return cloneSelected();if(action==="remove"||action==="group-delete")return removeSelected();if(action==="choose-media"){ui.tab="media";renderSidebar();return;}if(action==="reset-device"&&selected()){transact(()=>{selected().responsive[ui.device]={};selected().hidden[ui.device]=false;});}}
function insertWidget(type){if(!defaults[type])return;transact(()=>{const arr=activePage().sections,after=selected()?arr.findIndex(s=>s.id===selected().id)+1:arr.length,sec=section(type);arr.splice(after,0,sec);ui.selected=[sec.id];});toast("Dodano: "+names[type]);}
function openDialog(title,markup){$("#dialogTitle").textContent=title;$("#dialogContent").innerHTML=markup;$("#dialogOverlay").hidden=false;}
function closeDialog(){$("#dialogOverlay").hidden=true;}
function exportJSON(){const text=JSON.stringify(project,null,2),url=URL.createObjectURL(new Blob([text],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download="RAF-studio-Editor-9.0-szkic.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Pobrano kopię JSON szkicu 9.0.");}
function makeSnapshot(){try{const snap=JSON.parse(localStorage.getItem(SNAP)||"[]");snap.unshift({date:new Date().toLocaleString("pl-PL"),data:project});localStorage.setItem(SNAP,JSON.stringify(snap.slice(0,3)));toast("Zapisano punkt przywracania.");}catch(e){toast("Nie udało się zapisać punktu: "+e.message);}}
function restoreDialog(){const snaps=JSON.parse(localStorage.getItem(SNAP)||"[]");openDialog("Punkty przywracania",snaps.length?snaps.map((x,i)=>"<div class=\"page-row\"><span>"+esc(x.date)+"</span><button class=\"small-btn\" data-restore=\""+i+"\">Przywróć</button></div>").join(""):"<p class=\"hint\">Nie ma jeszcze zapisanych punktów.</p>");}
function templateDialog(){openDialog("Wybierz styl nowej strony","<p class=\"hint\">Szablon zastąpi bieżący szkic (nie stronę opublikowaną). Zmianę można cofnąć przez Ctrl+Z.</p><div class=\"widget-grid\"><button class=\"widget-card\" data-template=\"cinematic\"><span class=\"widget-icon\">◼</span><strong>Cinematic / czerń</strong></button><button class=\"widget-card\" data-template=\"wedding\"><span class=\"widget-icon\">◇</span><strong>Wedding / krem</strong></button><button class=\"widget-card\" data-template=\"minimal\"><span class=\"widget-icon\">▫</span><strong>Editorial / minimalizm</strong></button><button class=\"widget-card\" data-template=\"creative\"><span class=\"widget-icon\">✦</span><strong>Creative / żywe kolory</strong></button></div>");}
function applyTemplate(k){
 if(!confirm("Wczytać nowy szablon do szkicu 9.0? Stary szkic można przywrócić przez Ctrl+Z."))return;
 const schemes={
 cinematic:{colors:["#d7b58a","#111317","#f5f5f3"],font:"Inter",sections:["hero","gallery","features","video","cta","contact","footer"]},
 wedding:{colors:["#97755a","#f1e9df","#2b201a"],font:"Georgia",sections:["hero","text","gallery","reviews","pricing","contact","footer"]},
 minimal:{colors:["#1a1a1a","#fafaf8","#171717"],font:"Arial",sections:["hero","text","gallery","contact","footer"]},
 creative:{colors:["#f7c35a","#27244f","#faf2ff"],font:"Verdana",sections:["hero","features","video","gallery","logos","cta","faq","contact","footer"]}
 };
 const cfg=schemes[k]||schemes.cinematic;
 transact(()=>{
  const name=project.name;project=initialProject();project.name=name;
  const z=cfg.colors;project.theme={accent:z[0],background:z[1],text:z[2],font:cfg.font,layout:k};
  const home=project.pages[0];home.sections=cfg.sections.map(section);
  if(k==="wedding"){home.sections[0].props.title="EMOCJE W KADRZE.";home.sections[0].props.kicker="FOTOGRAFIA ŚLUBNA · REPORTAŻ";home.sections[0].props.image="/assets/photo-wedding.png";}
  if(k==="minimal"){home.sections[0].props.title="MNIEJ ZNACZY WIĘCEJ.";home.sections[0].props.image="";home.sections[0].props.body="Autorskie fotografie. Wyrazisty obraz. Prosta forma.";home.sections[0].responsive.desktop.minHeight=440;home.sections.find(x=>x.type==="gallery").responsive.desktop.columns=2;}
  if(k==="creative"){home.sections[0].props.title="ODWAŻNE HISTORIE.";home.sections[0].props.image="/assets/film-ad.png";home.sections[0].responsive.desktop.align="center";}
  for(const page of project.pages)for(const s of page.sections){
   s.responsive.desktop.background=z[1];s.responsive.desktop.textColor=z[2];
   if(s.type==="hero"&&k!=="minimal")s.responsive.desktop.textColor="#ffffff";
   if(k==="minimal")s.responsive.desktop.padding=54;
   if(k==="wedding")s.responsive.desktop.padding=88;
   if(k==="creative"&&s.type==="features")s.responsive.desktop.background="#423774";
  }
  ui.pageId=project.pages[0].id;ui.selected=[];
 });closeDialog();toast("Wczytano nowy układ szablonu: "+k);
}

function changePage(pid){const p=project.pages.find(x=>x.id===pid);if(!p)return;ui.pageId=pid;ui.selected=[];renderAll();}
function newPage(){const name=prompt("Nazwa nowej podstrony:","Nowa strona");if(!name||!name.trim())return;transact(()=>{const slug="/"+name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");const p=page(name.trim().slice(0,90),slug,["hero","text","contact","footer"]);project.pages.push(p);ui.pageId=p.id;ui.selected=[];});}
function renamePage(){const p=activePage(),n=prompt("Zmień nazwę podstrony:",p.name);if(!n||!n.trim())return;transact(()=>p.name=n.trim().slice(0,90));}
function preview(){
 const canvas=document.createElement("div");canvas.className="site-canvas "+ui.device+" theme-"+(project.theme.layout||"cinematic");canvas.style.background=project.theme.background;canvas.style.fontFamily=project.theme.font+",sans-serif";canvas.innerHTML=activePage().sections.map(s=>sectionHtml(s,true)).join("");
 const mount=$("#previewStage");mount.innerHTML="";mount.append(canvas);$("#previewOverlay").hidden=false;
}
function importLegacy(){
 if(!confirm("Zaimportować podstawowe teksty i galerie z 8.x do osobnego szkicu 9.0? Obecny szkic 9.0 zostanie zastąpiony (Ctrl+Z pozwoli cofnąć). Nie będzie żadnego zapisu do starego CMS."))return;
 if(typeof window.editor90ReadLegacy!=="function"){toast("Trwa inicjalizacja odczytu Firebase. Spróbuj za chwilę.");return;}
 status("Odczyt starego CMS…");
 window.editor90ReadLegacy().then(raw=>{
   if(!raw||typeof raw!=="object")throw Error("Brak danych w website/public.");
   transact(()=>{
     const fresh=initialProject(),p=fresh.pages[0],site=raw.site||{};
     p.sections[0].props.kicker=String(site.heroK||p.sections[0].props.kicker);
     p.sections[0].props.title=String(site.heroT||p.sections[0].props.title);
     p.sections[0].props.body=String(site.heroD||p.sections[0].props.body);
     p.sections[4].props.email=String(site.email||p.sections[4].props.email);
     p.sections[4].props.phone=String(site.phone||"");
     p.sections[4].props.instagram=String(site.instagram||p.sections[4].props.instagram);
     if(Array.isArray(raw.photos)&&raw.photos.length)p.sections[1].props.images=raw.photos.filter(x=>x&&x.visible!==false&&x.image).map(x=>String(x.image));
     if(Array.isArray(raw.films)&&raw.films.length){const film=fresh.pages.find(x=>x.slug==="/film");const vid=film.sections.find(x=>x.type==="video");vid.props.video=String(raw.films.find(x=>x&&x.video)?.video||"");}
     project=fresh;ui.pageId=project.pages[0].id;ui.selected=[];
   });toast("Zaimportowano podstawowe dane. Złożone układy 8.9.3 wymagają osobnej migracji.");
 }).catch(e=>{status("Błąd importu");toast("Nie można odczytać danych: "+e.message);});
}
function sidebarAction(name){
 if(name==="add"){ui.tab="add";renderSidebar();}
 if(name==="new-page")newPage();
 if(name==="rename-page")renamePage();
 if(name==="upload")$("#imageFile").click();
 if(name==="export")exportJSON();
 if(name==="import")$("#jsonFile").click();
 if(name==="snapshot")makeSnapshot();
 if(name==="restore")restoreDialog();
 if(name==="templates")templateDialog();
 if(name==="legacy")importLegacy();
}
function mediaChoose(mid){
 const item=project.media.find(x=>x.id===mid),s=selected();
 if(!item)return;
 if(!s){toast("Zaznacz HERO lub galerię, aby dodać zdjęcie.");return;}
 transact(()=>{if(s.type==="gallery"){s.props.images.push(item.url);}else if("image" in s.props){s.props.image=item.url;}else{toast("Ta sekcja nie ma pola zdjęcia. Użyj HERO lub Galerii.");}});
}
async function imageToWebp(file){
 if(!/^image\/(jpeg|png|webp|gif)$/i.test(file.type))throw Error("Obsługiwane są JPG, PNG, WebP i GIF.");
 if(file.size>15*1024*1024)throw Error("Zdjęcie większe niż 15 MB.");
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error("Nie można wczytać zdjęcia."));im.src=url;});
  const canvas=document.createElement("canvas"),scale=Math.min(1,1400/img.width,1100/img.height);
  canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
  const context=canvas.getContext("2d");if(!context)throw Error("Brak Canvas 2D.");
  context.drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL("image/webp",.76);
 }finally{URL.revokeObjectURL(url);}
}
async function uploadImages(files){
 for(const file of files.slice(0,10)){try{const url=await imageToWebp(file);transact(()=>project.media.unshift({id:id(),name:file.name,url}));toast("Dodano zdjęcie: "+file.name);}catch(err){toast("Nie dodano "+file.name+": "+err.message);}}
}
function restore(index){try{const v=JSON.parse(localStorage.getItem(SNAP)||"[]")[index];if(!v)return;if(!confirm("Przywrócić wybraną wersję szkicu 9.0?"))return;transact(()=>{project=normalize(copy(v.data));ui.pageId=project.pages[0].id;ui.selected=[];});closeDialog();toast("Punkt przywracania wczytany.");}catch(e){toast(e.message);}}
function rootEvents(){
 $("#siteCanvas").addEventListener("click",e=>{
  const act=e.target.closest("[data-action]");if(act){e.preventDefault();e.stopPropagation();const parent=act.closest(".site-section");choose(parent.dataset.id,false);doAction(act.dataset.action);return;}
  const section=e.target.closest(".site-section");if(section)choose(section.dataset.id,e.shiftKey||e.altKey);
  else{ui.selected=[];highlightSelection();renderSidebar();renderInspector();}
 });
 $("#siteCanvas").addEventListener("dblclick",e=>{
  const el=e.target.closest("[data-edit]");if(!el)return;const sect=el.closest(".site-section"),s=activePage().sections.find(x=>x.id===sect?.dataset.id);if(!s)return;
  if(!ui.selected.includes(s.id))choose(s.id,false);
  el.setAttribute("contenteditable","plaintext-only");el.focus();
  const key=el.dataset.edit;checkpoint();
  const onInput=()=>{s.props[key]=el.textContent||"";persist();};
  const onBlur=()=>{el.removeAttribute("contenteditable");el.removeEventListener("input",onInput);el.removeEventListener("blur",onBlur);renderAll();};
  el.addEventListener("input",onInput);el.addEventListener("blur",onBlur);
 });
 $("#sidebarContent").addEventListener("click",e=>{
  const widget=e.target.closest("[data-widget]");if(widget){insertWidget(widget.dataset.widget);return;}
  const layer=e.target.closest("[data-select]");if(layer){choose(layer.dataset.select,e.shiftKey||e.altKey);return;}
  const p=e.target.closest("[data-page]");if(p){changePage(p.dataset.page);return;}
  const action=e.target.closest("[data-side-action]");if(action){sidebarAction(action.dataset.sideAction);return;}
  const medium=e.target.closest("[data-media]");if(medium){mediaChoose(medium.dataset.media);return;}
  const rm=e.target.closest("[data-media-remove]");if(rm){if(!confirm("Usunąć to zdjęcie z biblioteki szkicu?"))return;transact(()=>{project.media=project.media.filter(x=>x.id!==rm.dataset.mediaRemove);});return;}
  const palette=e.target.closest("[data-palette]");if(palette){const paletteThemes={dark:["#d7b58a","#121417","#f5f5f3"],cream:["#9c745a","#ede6dd","#251c19"],minimal:["#222222","#f8f8f5","#171717"]},v=paletteThemes[palette.dataset.palette];if(v)transact(()=>{project.theme.accent=v[0];project.theme.background=v[1];project.theme.text=v[2];});}
 });
 let dragging="";
 $("#sidebarContent").addEventListener("dragstart",e=>{const el=e.target.closest("[data-drag]");if(!el)return;dragging=el.dataset.drag;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",dragging);});
 $("#sidebarContent").addEventListener("dragover",e=>{if(e.target.closest("[data-drag]"))e.preventDefault();});
 $("#sidebarContent").addEventListener("drop",e=>{const target=e.target.closest("[data-drag]");if(!target||!dragging)return;e.preventDefault();const source=dragging;dragging="";if(source===target.dataset.drag)return;transact(()=>{const arr=activePage().sections,from=arr.findIndex(x=>x.id===source),to=arr.findIndex(x=>x.id===target.dataset.drag);if(from<0||to<0)return;arr.splice(to,0,arr.splice(from,1)[0]);});});
 $("#inspectorBody").addEventListener("click",e=>{const action=e.target.closest("[data-inspector-action]");if(action)doAction(action.dataset.inspectorAction);});
 $("#inspectorBody").addEventListener("change",e=>{
  const t=e.target,s=selected();if(!s)return;
  if(t.dataset.prop){const key=t.dataset.prop;transact(()=>{let v=t.value;if(key==="images")v=v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(key==="items")v=v.split(/\r?\n/).map(x=>x.split("|").map(y=>y.trim()).slice(0,2)).filter(x=>x[0]).map(x=>[x[0],x[1]||""]);s.props[key]=v;});}
  else if(t.dataset.style){const key=t.dataset.style;transact(()=>{s.responsive[ui.device][key]=["padding","minHeight","columns","fontScale"].includes(key)?Number(t.value):t.value;});}
  else if(t.dataset.meta){const key=t.dataset.meta;transact(()=>{if(key==="hidden")s.hidden[ui.device]=t.checked;else if(key==="name")s.name=t.value.slice(0,90);});}
 });
 $("#sidebarContent").addEventListener("change",e=>{
  const t=e.target;if(t.dataset.theme)transact(()=>{project.theme[t.dataset.theme]=t.value;});
 });
 $("#projectName").addEventListener("change",e=>{const n=e.target.value.trim();if(n)transact(()=>project.name=n.slice(0,100));});
 $$(".device").forEach(b=>b.addEventListener("click",()=>{ui.device=b.dataset.device;renderAll();}));
 $("#zoom").addEventListener("change",e=>{ui.zoom=Number(e.target.value);renderCanvas();});
 $("#undo").addEventListener("click",undo);$("#redo").addEventListener("click",redo);
 $("#openPreview").addEventListener("click",preview);$("#closePreview").addEventListener("click",()=>$("#previewOverlay").hidden=true);
 $("#exportTop").addEventListener("click",exportJSON);$("#closeDialog").addEventListener("click",closeDialog);
 $("#addBottom").addEventListener("click",()=>{ui.tab="add";renderSidebar();});
 $("#dialogContent").addEventListener("click",e=>{const el=e.target.closest("[data-template]");if(el)applyTemplate(el.dataset.template);const restoreButton=e.target.closest("[data-restore]");if(restoreButton)restore(Number(restoreButton.dataset.restore));});
 $("#jsonFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=normalize(JSON.parse(await file.text()));if(!confirm("Wczytać projekt 9.0 z pliku JSON do szkicu?"))return;transact(()=>{project=parsed;ui.pageId=project.pages[0].id;ui.selected=[];});toast("Zaimportowano projekt 9.0.");}catch(err){toast("Nieprawidłowy plik: "+err.message);}finally{e.target.value="";}});
 $("#imageFile").addEventListener("change",async e=>{const files=Array.from(e.target.files);e.target.value="";await uploadImages(files);});
 document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeDialog();$("#previewOverlay").hidden=true;return;}
  const editing=e.target.matches("input,textarea,select,[contenteditable]");if(editing)return;
  const ctrl=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
  if(ctrl&&k==="z"){e.preventDefault();e.shiftKey?redo():undo();}
  else if(ctrl&&k==="y"){e.preventDefault();redo();}
  else if(ctrl&&k==="s"){e.preventDefault();persist();toast("Zapisano szkic lokalnie.");}
  else if(ctrl&&k==="d"){e.preventDefault();cloneSelected();}
  else if(ctrl&&k==="a"){e.preventDefault();ui.selected=activePage().sections.map(x=>x.id);highlightSelection();renderSidebar();renderInspector();}
  else if((e.key==="Delete"||e.key==="Backspace")&&ui.selected.length)removeSelected();
  else if(e.altKey&&e.key==="ArrowUp"&&ui.selected.length){e.preventDefault();transact(()=>move(ui.selected,-1));}
  else if(e.altKey&&e.key==="ArrowDown"&&ui.selected.length){e.preventDefault();transact(()=>move(ui.selected,1));}
 });
}
rootEvents();renderAll();persist();
})();
