// RAF.studio — Modern Workspace (opt-in) built around the ACTUAL 8.9.3 editor.
// No new content model, no replacement save/publish handlers, no Firebase calls.
(()=>{
  "use strict";
  const q=new URLSearchParams(location.search);
  if(q.get("modern")!=="1"||q.get("editor")!=="direct"||q.get("ev")!=="8.9.3")return;
  if(document.getElementById("rafModern894"))return;
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const escape=v=>String(v??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
  const normalize=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const lsKey="rafStudioModern894UI";
  const safeLocal=()=>{try{return JSON.parse(localStorage.getItem(lsKey)||"{}")||{}}catch{return{}}};
  let state={tab:"sections",collapsed:false,inspectorCollapsed:false,focus:false,inspectorWidth:356,...safeLocal()};
  const saveUI=()=>{try{localStorage.setItem(lsKey,JSON.stringify(state))}catch{}};
  const css=document.createElement("link");css.rel="stylesheet";css.href="/editor-modern-v894.css?v=8940";document.head.append(css);
  document.body.classList.add("raf-modern894");
  const ui=document.createElement("div");
  ui.id="rafModern894";
  ui.innerHTML=`
    <div class="rm-top" role="banner">
      <div class="rm-titlebar">
        <div class="rm-brand"><div class="rm-logo">RAF<small>.studio</small></div><span class="rm-pill">8.9.3 MODERN</span></div>
        <button type="button" class="rm-command-launch" id="rmCommandLaunch894" title="Szukaj funkcji (Ctrl+K)"><span>⌕ &nbsp;Wyszukaj narzędzie, sekcję lub działanie…</span><kbd>Ctrl K</kbd></button>
        <div class="rm-spacer"></div>
        <div class="rm-tools">
          <button type="button" class="rm-button" id="rmNative894" title="Pokaż klasyczny wygląd bez wyłączania edytora">Klasyczny</button>
          <button type="button" class="rm-button" id="rmFocus894" title="Ukryj panele (Alt+Shift+F)">▣ Płótno</button>
          <button type="button" class="rm-button rm-accent" id="rmBackup894" title="Historia wersji / zapisz punkt przywracania">↶ Wersje</button>
        </div>
      </div>
      <div class="rm-dock"><span class="rm-dock-label">NARZĘDZIA 8.9.3 →</span><div id="rafModernNativeDock"></div></div>
    </div>
    <aside class="rm-side" aria-label="Nawigacja edytora">
      <div class="rm-side-title"><strong id="rmSideTitle894">NAWIGACJA</strong><button id="rmSideClose894" type="button" title="Zwiń lewy panel">✕</button></div>
      <div class="rm-tabbar" role="tablist">
        <button type="button" class="rm-tab active" data-rm-tab="sections">Sekcje</button>
        <button type="button" class="rm-tab" data-rm-tab="tools">Narzędzia</button>
        <button type="button" class="rm-tab" data-rm-tab="help">Pomoc</button>
      </div>
      <div class="rm-list" id="rmSideContent894"></div>
      <div class="rm-bottom">
        <div class="rm-inline"><button class="rm-button" type="button" data-rm-action="widgets">＋ Widżety</button><button class="rm-button" type="button" data-rm-action="templates">▦ Szablony</button></div>
        <small>Projekt 8.9.3 · wspólna wersja robocza Firebase</small>
      </div>
    </aside>
    <button type="button" id="rmSideOpen894" class="rm-reopen">☰ Narzędzia</button>
    <button type="button" id="rmInspectorToggle894" class="rm-inspector-toggle" title="Pokaż / ukryj panel właściwości">❮</button>
    <div class="rm-command-overlay" id="rmCommandOverlay894" hidden>
      <div class="rm-command" role="dialog" aria-modal="true" aria-label="Szybkie wyszukiwanie narzędzi">
        <div class="rm-searchbar"><span style="color:#8da8c3;font-size:20px">⌕</span><input id="rmCommandInput894" placeholder="Wpisz np. tekst, szablon, video, warstwy…" autocomplete="off" spellcheck="false"><button id="rmCommandClose894" type="button">Esc ✕</button></div>
        <div id="rmCommandResults894" class="rm-searchresults" role="listbox"></div>
        <div class="rm-keyhint">↑ ↓ wybór &nbsp;·&nbsp; Enter uruchom &nbsp;·&nbsp; Esc zamknij &nbsp;·&nbsp; Ctrl+K otwórz</div>
      </div>
    </div>
    <div class="rm-toast" id="rmToast894" role="status" hidden></div>
  `;
  document.body.append(ui);
  let toastTimeout=0,refreshTimer=0,commandIndex=0,commands=[];
  const toast=message=>{const box=$("#rmToast894");if(!box)return;box.textContent=message;box.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>box.hidden=true,3200)};
  const native=()=>$("#rafTop3");
  const present=(id)=>!!document.getElementById(id);
  function fire(id,message){const b=document.getElementById(id);if(!b){toast(message||"Ta funkcja jeszcze się ładuje. Spróbuj za chwilę.");return false;}b.click();return true;}
  function snapshot(){if(window.rafVersions760?.open){window.rafVersions760.open();return true;}return fire("versionsBtn760","Historia wersji nie jest jeszcze gotowa.");}
  const actions=[
    {id:"widgets",name:"Otwórz bibliotekę widżetów",hint:"Widżety · media · cenniki · galerie · CTA",icon:"▦",fire:()=>fire("widgetsBtn770")},
    {id:"templates",name:"Otwórz bibliotekę szablonów",hint:"Wybierz gotowy układ z 8.9.3",icon:"◈",fire:()=>fire("templatesBtn752")},
    {id:"layers",name:"Warstwy i kosz",hint:"Wybieranie, ukrywanie, blokowanie, przywracanie",icon:"☷",fire:()=>fire("layersBtn760")},
    {id:"pages",name:"Podstrony i linkowanie",hint:"Nowa strona · formularze · linki",icon:"▤",fire:()=>fire("pagesBtn860")},
    {id:"pro",name:"Profesjonalne ustawienia",hint:"Globalne style i zaawansowane narzędzia",icon:"✥",fire:()=>fire("proBtn61")},
    {id:"add",name:"Dodaj sekcję",hint:"Istniejące szablony sekcji",icon:"＋",fire:()=>fire("add3")},
    {id:"history",name:"Historia wersji i kopie",hint:"Punkty przywracania i backup",icon:"◷",fire:snapshot},
    {id:"undo",name:"Cofnij ostatnią zmianę",hint:"Ctrl+Z",icon:"↶",fire:()=>fire("u3")},
    {id:"redo",name:"Ponów zmianę",hint:"Ctrl+Y",icon:"↷",fire:()=>fire("r3")},
    {id:"preview",name:"Podgląd strony",hint:"Zobacz bez narzędzi edycyjnych",icon:"▣",fire:()=>fire("preview3")},
    {id:"panels",name:"Odłącz panele na drugi monitor",hint:"Pływające okna robocze",icon:"⧉",fire:()=>fire("rafDockBtn889")},
    {id:"desktop",name:"Widok komputera",hint:"Przejdź do desktopowej wersji 8.9.3",icon:"▣",fire:()=>navigateDesktop()},
    {id:"tablet",name:"Edytor tabletowy",hint:"Przełącz na istniejący moduł tablet",icon:"▯",fire:()=>navigateMobile("tablet")},
    {id:"mobile",name:"Edytor telefonu",hint:"Przełącz na istniejący moduł telefon",icon:"▯",fire:()=>navigateMobile("mobile")},
    {id:"focus",name:"Tryb pełnego płótna",hint:"Alt+Shift+F · pokaż / ukryj panele",icon:"◱",fire:()=>toggleFocus()},
    {id:"classic",name:"Wróć do klasycznej wersji 8.9.3",hint:"Ten sam projekt bez nakładki modernizacji",icon:"↩",fire:()=>goClassic()}
  ];
  function navigateDesktop(){const u=new URL(location.href);u.searchParams.delete("device");location.assign(u.toString());}
  function navigateMobile(device){const yes=confirm("Otworzyć sprawdzony edytor "+(device==="tablet"?"tabletowy":"telefoniczny")+"? Widok mobilny korzysta z istniejącego modułu 8.9.3, a nie z nowej nakładki desktopowej.");if(!yes)return;location.assign("/mobile-editor.html?device="+device);}
  function goClassic(){const u=new URL(location.href);u.searchParams.delete("modern");location.assign(u.toString());}
  function attachToolbar(){
    const bar=native(),container=$("#rafModernNativeDock");if(!bar||!container)return;
    if(bar.parentElement!==container){container.appendChild(bar);}
  }
  function config(){
    document.body.classList.toggle("rm-side-collapsed",!!state.collapsed);
    document.body.classList.toggle("rm-inspector-collapsed",!!state.inspectorCollapsed);
    document.body.classList.toggle("rm-focus",!!state.focus);
    state.inspectorWidth=Math.max(290,Math.min(640,Number(state.inspectorWidth)||356));
    document.body.style.setProperty("--rm-inspector",state.inspectorWidth+"px");
    $("#rmInspectorToggle894").textContent=state.inspectorCollapsed?"❮":"❯";
    $("#rmFocus894").classList.toggle("active",!!state.focus);
    $$(".rm-tab").forEach(b=>b.classList.toggle("active",b.dataset.rmTab===state.tab));
  }
  function toggleFocus(){state.focus=!state.focus;saveUI();config();toast(state.focus?"Pełne płótno · Alt+Shift+F, aby przywrócić panele":"Przywrócono panele edytora");}
  function canvasSections(){
    const roots=$$("header.hero,[data-raf-section]").filter(x=>{
      if(x.closest("#rafModern894,#rafPanel3,#v760layers,#rafModal3,#tpl752,#widgetsModal770,#pages860,#v760history,#rafTop3"))return false;
      if(x.closest("[data-raf-section]")&&x.closest("[data-raf-section]")!==x)return false;
      if(x.closest("template"))return false;
      return true;
    });
    const unique=[];const seen=new Set();
    for(const el of roots){const key=el.dataset.rafSection||el.getAttribute("data-home-section")|| (el.matches("header.hero")?"Hero":el.id||el.tagName);
      if(seen.has(el))continue;seen.add(el);
      const title=(el.querySelector("h1,h2,h3")?.textContent||"").replace(/\s+/g," ").trim().slice(0,44);
      unique.push({el,key:key||"Sekcja",title,kind:"section"});
    }
    for(const el of $$("[data-raf-widget-id]")){if(el.closest("#rafModern894,#rafPanel3,#widgetsModal770"))continue;const parent=el.closest("[data-raf-section]");const title=(el.querySelector("h2,h3")?.textContent||"").trim().slice(0,40);unique.push({el,key:"Widżet",title:title||el.dataset.rafWidgetId||"Widżet",kind:"widget",parent:parent?.dataset.rafSection});}
    return unique;
  }
  function jumpTo(entry){
    if(!entry?.el?.isConnected){toast("Nie znaleziono elementu. Odśwież listę.");return;}
    const el=entry.el;
    try{window.rafCore760?.selectElement?.(el);}catch{}
    el.scrollIntoView({behavior:"smooth",block:"center"});
    try{el.dispatchEvent(new MouseEvent("dblclick",{bubbles:true,cancelable:true,view:window}));}catch{}
    toast("Wybrano: "+(entry.title||entry.key));
  }
  function sideSections(){
    const list=canvasSections(),box=$("#rmSideContent894");
    box.replaceChildren();
    const addText=(text,cls)=>{const x=document.createElement("div");x.className=cls;x.textContent=text;box.append(x);};
    addText("STRUKTURA AKTUALNEJ STRONY ("+list.length+")","rm-category");
    if(!list.length)addText("Trwa ładowanie struktury. Możesz używać wszystkich przycisków starego edytora.","rm-note");
    list.forEach((x,i)=>{
      const b=document.createElement("button");b.className="rm-listbtn";b.type="button";
      b.style.paddingLeft=x.kind==="widget"?"24px":"9px";
      const num=document.createElement("span");num.className="rm-num";num.textContent=String(i+1).padStart(2,"0");
      const main=document.createElement("span");main.className="rm-title";main.textContent=x.title||x.key;
      const sub=document.createElement("span");sub.className="rm-subtitle";sub.textContent=x.kind==="widget"?"WIDŻET / "+(x.parent||"Sekcja"):x.key;
      main.append(sub);
      const arrow=document.createElement("span");arrow.className="rm-arrow";arrow.textContent="↗";
      b.append(num,main,arrow);b.onclick=()=>jumpTo(x);box.append(b);
    });
    const refresh=document.createElement("button");refresh.type="button";refresh.className="rm-listbtn";refresh.style.marginTop="12px";refresh.textContent="⟳ Odśwież listę sekcji";refresh.onclick=sideSections;box.append(refresh);
  }
  function sideTools(){
    const box=$("#rmSideContent894");box.replaceChildren();
    const add=(title,ids)=>{
      const h=document.createElement("div");h.className="rm-category";h.textContent=title;box.append(h);
      ids.forEach(id=>{const a=actions.find(x=>x.id===id);if(!a)return;
        const btn=document.createElement("button");btn.className="rm-listbtn";btn.type="button";
        btn.innerHTML="<span class=\"rm-num\">"+a.icon+"</span><span class=\"rm-title\">"+escape(a.name)+"<span class=\"rm-subtitle\">"+escape(a.hint)+"</span></span><span class=\"rm-arrow\">↗</span>";
        btn.onclick=()=>a.fire();box.append(btn);
      });
    };
    add("BUDOWANIE STRONY",["widgets","templates","layers","pages","add","pro"]);
    add("PRACA I HISTORIA",["undo","redo","preview","history","panels","focus"]);
    add("URZĄDZENIA",["desktop","tablet","mobile"]);
    add("WIDOK",["classic"]);
  }
  function sideHelp(){
    const box=$("#rmSideContent894");box.replaceChildren();
    const el=document.createElement("div");el.className="rm-note";
    el.textContent="To jest ten sam silnik 8.9.3. Modernizacja dotyczy interfejsu i nawigacji. Edycje zapisują się w tym samym szkicu Firebase co wersja klasyczna; publikacja pozostaje funkcją oryginalnego edytora.";
    box.append(el);
    const h=document.createElement("div");h.className="rm-category";h.textContent="SKRÓTY I GESTY";box.append(h);
    const shortcuts=[
      ["Ctrl+K","Szukaj narzędzi i sekcji"],["Alt+Shift+F","Pełne płótno"],["Ctrl+Z / Ctrl+Y","Cofnij / ponów"],["Tab","Pokaż / ukryj stary dock"],["Alt + przeciągnięcie","Zaznacz obiekty ramką"],["Shift + klik","Multi-select w edytorze"],["Dwuklik","Edycja lub wybór elementu"],["Uchwyty narożne","Skaluj zaznaczenie"],["Ctrl","Omiń magnes podczas ruchu"]
    ];
    for(const [key,description] of shortcuts){const r=document.createElement("div");r.className="rm-listbtn";const k=document.createElement("kbd");k.textContent=key;k.style.flex="none";const v=document.createElement("span");v.textContent=description;v.style.marginLeft="5px";r.append(k,v);box.append(r);}
    const b=document.createElement("button");b.className="rm-listbtn";b.type="button";b.textContent="◷ Otwórz historię wersji";b.onclick=snapshot;box.append(b);
  }
  function renderSide(){config();$("#rmSideTitle894").textContent={sections:"NAWIGACJA",tools:"NARZĘDZIA",help:"POMOC I SKRÓTY"}[state.tab]||"NAWIGACJA";if(state.tab==="sections")sideSections();else if(state.tab==="tools")sideTools();else sideHelp();}
  function allCommands(){const matched=canvasSections().map((x,i)=>({id:"s"+i,name:(x.kind==="widget"?"Widżet: ":"Sekcja: ")+(x.title||x.key),hint:x.key,icon:x.kind==="widget"?"▦":"▤",fire:()=>jumpTo(x)}));return [...actions,...matched];}
  function renderCommands(){
    const raw=$("#rmCommandInput894").value,query=normalize(raw);
    const rows=commands.filter(x=>!query||normalize(x.name+" "+x.hint).includes(query)).slice(0,35);
    commandIndex=Math.max(0,Math.min(commandIndex,rows.length-1));const out=$("#rmCommandResults894");out.replaceChildren();
    if(!rows.length){const p=document.createElement("div");p.className="rm-note";p.textContent="Brak wyników. Spróbuj innego słowa.";out.append(p);return;}
    rows.forEach((a,i)=>{
      const b=document.createElement("button");b.className="rm-result"+(i===commandIndex?" active":"");b.type="button";b.setAttribute("role","option");b.setAttribute("aria-selected",String(i===commandIndex));
      const title=document.createElement("span");title.textContent=a.icon+"  "+a.name;
      const sub=document.createElement("small");sub.textContent=a.hint;
      b.append(title,sub);b.onclick=()=>{closeCommands();a.fire();};b.onmouseenter=()=>{commandIndex=i;};out.append(b);
    });
  }
  function openCommands(){commands=allCommands();commandIndex=0;$("#rmCommandOverlay894").hidden=false;$("#rmCommandInput894").value="";renderCommands();$("#rmCommandInput894").focus();}
  function closeCommands(){$("#rmCommandOverlay894").hidden=true;}
  function nativeDeviceBridge(e){
    const b=e.target.closest?.("#v760devices button[data-device]");
    if(!b)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    const d=b.dataset.device;if(d==="desktop")navigateDesktop();else if(d==="tablet"||d==="mobile")navigateMobile(d);
  }
  function resizeInspector(){
    const h=document.createElement("button");
    h.id="rmInspectorResize894";h.type="button";h.title="Przeciągnij, aby zmienić szerokość panelu";
    h.setAttribute("aria-label","Zmień szerokość panelu");
    h.style.cssText="position:fixed;top:55%;right:calc(var(--rm-inspector) + 4px);z-index:1000071;width:13px;height:55px;border:1px solid #57708b;border-radius:8px;background:#1c2b39;color:#d6eaff;cursor:ew-resize;pointer-events:auto";
    h.textContent="⋮";ui.append(h);let drag=false;
    h.addEventListener("pointerdown",e=>{if(state.inspectorCollapsed)return;drag=true;h.setPointerCapture(e.pointerId);e.preventDefault();});
    h.addEventListener("pointermove",e=>{if(!drag)return;state.inspectorWidth=Math.max(290,Math.min(640,innerWidth-e.clientX-10));config();});
    h.addEventListener("pointerup",()=>{if(drag){drag=false;saveUI();}});
    h.addEventListener("pointercancel",()=>{drag=false;});
    const update=()=>{h.hidden=!!(state.inspectorCollapsed||state.focus)};
    // Resize handle visibility follows inspector state.
    addEventListener("resize",update);
    new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:["class"]});
    update();
  }
  $("#rmCommandLaunch894").onclick=openCommands;
  $("#rmCommandClose894").onclick=closeCommands;
  $("#rmCommandOverlay894").onclick=e=>{if(e.target.id==="rmCommandOverlay894")closeCommands();};
  $("#rmCommandInput894").oninput=()=>{commandIndex=0;renderCommands();};
  $("#rmCommandInput894").onkeydown=e=>{
    if(e.key==="Escape"){e.preventDefault();closeCommands();}
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();const count=$$("#rmCommandResults894 .rm-result").length;commandIndex=count?((commandIndex+(e.key==="ArrowDown"?1:-1)+count)%count):0;renderCommands();}
    if(e.key==="Enter"){e.preventDefault();$$("#rmCommandResults894 .rm-result")[commandIndex]?.click();}
  };
  $$(".rm-tab").forEach(b=>b.onclick=()=>{state.tab=b.dataset.rmTab;saveUI();renderSide();});
  $("#rmSideClose894").onclick=()=>{state.collapsed=true;saveUI();config();};
  $("#rmSideOpen894").onclick=()=>{state.collapsed=false;state.focus=false;saveUI();config();};
  $("#rmInspectorToggle894").onclick=()=>{state.inspectorCollapsed=!state.inspectorCollapsed;saveUI();config();};
  $("#rmFocus894").onclick=toggleFocus;$("#rmNative894").onclick=goClassic;$("#rmBackup894").onclick=snapshot;
  $$("[data-rm-action]").forEach(b=>b.onclick=()=>{const a=actions.find(x=>x.id===b.dataset.rmAction);a?.fire();});
  document.addEventListener("click",nativeDeviceBridge,true);
  document.addEventListener("keydown",e=>{
    const editing=e.target?.closest?.("input,textarea,select,[contenteditable=true],[contenteditable=''],[role=textbox]");
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();e.stopPropagation();openCommands();return;}
    if(e.key==="Escape"&&!$("#rmCommandOverlay894").hidden){e.preventDefault();closeCommands();return;}
    if(e.altKey&&e.shiftKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==="f"&&!editing){e.preventDefault();toggleFocus();}
  },true);
  // A mouse/keyboard user gesture updates only the sidebar index; never adjusts site content.
  const schedule=()=>{if(state.tab!=="sections")return;clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{if(!$("#rmCommandOverlay894").hidden)return;sideSections();},600);};
  const target=$("#rafMain")||document.body;
  const obs=new MutationObserver(records=>{if(records.some(r=>r.type==="childList"))schedule();});
  obs.observe(target,{childList:true,subtree:true});
  addEventListener("raf:template752-rendered",schedule);addEventListener("raf:v760-change",schedule);
  document.addEventListener("click",e=>{if(!e.target.closest("#rafModern894,#rafTop3,#rafPanel3"))schedule();},false);
  setInterval(()=>{if(!document.getElementById("rafModern894"))return;attachToolbar();},2400);
  attachToolbar();renderSide();resizeInspector();config();
  toast("8.9.3 Modern uruchomiony — cały dotychczasowy silnik edycji pozostaje aktywny.");
  window.rafModern894={openCommands,renderSide,toggleFocus,goClassic};
})();
