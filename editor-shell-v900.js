// RAF.studio 9.0 — minimal editor shell; canvas mechanics live in Core 9
const $=(s,r=document)=>r.querySelector(s);
function css(){if($('#rafShell900Css'))return;const s=document.createElement('style');s.id='rafShell900Css';s.textContent=`
#rafTop3{position:fixed;top:8px;left:50%;translate:-50% 0;z-index:1000020;background:#101114ee;border:1px solid #ffffff25;border-radius:14px;padding:6px 8px;display:flex;gap:6px;align-items:center;backdrop-filter:blur(18px);font:12px system-ui;color:#fff;max-width:calc(100vw - 20px)}
#rafTop3 button,#rafPanel3 button{border:1px solid #ffffff22;background:#ffffff0b;color:#fff;border-radius:8px;padding:7px 9px;cursor:pointer}#rafTop3 .pub{background:#fff;color:#111;font-weight:900}
#rafTop3{box-sizing:border-box;flex-wrap:wrap;justify-content:center;width:max-content}#rafTop3>label{min-width:0;max-width:100%}#rafTop3 select{min-width:0;max-width:280px}#rafStatus3{max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#rafPanel3{position:fixed;right:8px;top:62px;bottom:8px;width:330px;z-index:1000018;background:#111e;border:1px solid #ffffff25;border-radius:15px;padding:13px;overflow:auto;backdrop-filter:blur(20px);font:12px system-ui;color:#fff}
#rafPanel3 label{display:block;color:#aaa;font-size:10px;margin:10px 0 4px}#rafPanel3 input,#rafPanel3 select,#rafPanel3 textarea{width:100%;box-sizing:border-box;background:#080809;color:#fff;border:1px solid #343438;border-radius:8px;padding:8px;font:inherit}
#rafModal3{position:fixed;inset:60px 30px 30px;z-index:1000025;background:#111;border:1px solid #ffffff25;border-radius:16px;padding:14px;display:none;overflow:auto;color:#fff;font:12px system-ui}#rafModal3.open{display:block}
body.raf-preview64 #rafTop3,body.raf-preview64 #rafPanel3{display:none!important}
@media(max-width:900px){#rafPanel3{left:8px;right:8px;top:auto;bottom:8px;width:auto;height:300px}#rafTop3{left:6px;right:6px;translate:0 0;flex-wrap:wrap;justify-content:center}}
`;document.head.appendChild(s)}
export function ensureEditorShell900(){
 css();document.body.classList.add('raf-e3','raf-core9');
 let top=$('#rafTop3');if(!top){top=document.createElement('div');top.id='rafTop3';top.innerHTML='<button id="u3" title="Cofnij">↶</button><button id="r3" title="Ponów">↷</button><button id="add3">+ Sekcja</button><span id="rafStatus3">✓ Edytor 9.0 gotowy</span><button id="preview3">Podgląd</button><button id="exit3">Wyjdź</button><button id="pub3" class="pub">OPUBLIKUJ</button>';document.body.appendChild(top)}
 if(!$('#rafPanel3')){const p=document.createElement('aside');p.id='rafPanel3';p.innerHTML='<div style="font:800 9px system-ui;color:#7bcfff;letter-spacing:.1em">WŁAŚCIWOŚCI</div><h3>Kliknij element</h3>';document.body.appendChild(p)}
 if(!$('#rafModal3')){const m=document.createElement('div');m.id='rafModal3';document.body.appendChild(m)}
 $('#exit3')?.addEventListener('click',()=>location.href='/',{once:true});
 window.dispatchEvent(new CustomEvent('raf:shell900-ready'));
 return{top:$('#rafTop3'),panel:$('#rafPanel3'),modal:$('#rafModal3')};
}
ensureEditorShell900();
