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

function renderCanvas(){
 const p=activePage(),canvas=$("#siteCanvas");
 canvas.className="site-canvas "+ui.device;canvas.style.zoom=(ui.zoom/100);
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
function applyTemplate(k){if(!confirm("Wczytać nowy szablon do szkicu 9.0? Stary szkic będzie dostępny przez Cofnij."))return;transact(()=>{const name=project.name;project=initialProject();project.name=name;const themes={cinematic:["#d7b58a","#111317","#f5f5f3"],wedding:["#9c745a","#ede6dd","#251c19"],minimal:["#222222","#f8f8f5","#151515"],creative:["#ecb83c","#181b31","#ffffff"]};const z=themes[k]||themes.cinematic;project.theme={accent:z[0],background:z[1],text:z[2],font:k==="wedding"||k==="minimal"?"Georgia":"Inter"};for(const page of project.pages)for(const s of page.sections){s.responsive.desktop.background=z[1];s.responsive.desktop.textColor=z[2];}ui.pageId=project.pages[0].id;ui.selected=[];});closeDialog();toast("Wczytano szablon: "+k);}
