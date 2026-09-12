const params=new URLSearchParams(location.search),mode=params.get('editor'),LATEST='8.8.7',CURRENT_BUILD='8870',requested=params.get('ev')||LATEST;
const editorMode=mode==='direct'||mode==='1';

const RELEASES=Object.freeze({
 '8.8.6':{sha:'1ad246ef3ef68d08bb22d30119de6035da1f3fb0',build:'8860'},
 '8.8.5':{sha:'7e92f37e8b4036f7ef21c812e206ec0a31e05fd4',build:'8850'},
 '8.8.4':{sha:'c845dedb7beedf2405320f23ccc41d3fd4451d33',build:'8840'},
 '8.8.3':{sha:'a2deb6833c98c35a86aef83a46495b6e547aa99e',build:'8830'},
 '8.8.2':{sha:'29175dd17d1303905a8c4159be87497ebb0629da',build:'8820'},
 '8.8.1':{sha:'26436f8b6d4ff1137d81780a4516abbf7a8fc3bb',build:'8810'},
 '8.8.0':{sha:'39bd00c682d8b5efb664c3775229dd283a353215',build:'8800'},
 '8.7.7':{sha:'41ac540c5e64e4df2349badaa192be84b422594b',build:'8770'},
 '8.7.6':{sha:'e8cba90c85f3651019a408de3a6cd22fcc390c30',build:'8760'},
 '8.7.2':{sha:'2d4bd1cf311f384f1b25c478c9b89069d6b4e88b',build:'8720'},
 '8.7.1':{sha:'16ba8829d250f30d1dae9b02912a088e4870449c',build:'8710'},
 '8.7.0':{sha:'00dd318368278344a04a8d67d3481a94ea0b08cf',build:'8700'},
 '8.6.2':{sha:'5255cd7f5b31348dcb6b70be7bcd97cf88f1c9d2',build:'8620'},
 '8.6.1':{sha:'45c18b1382e281ce61a21eb1b1352b1e5cba66bb',build:'8610'},
 '8.6.0':{sha:'e3fd4b7db21e7b7ac7f6319f1ea9e664e920eeb4',build:'8600'},
 '8.5.2':{sha:'3eb97f8ac1c8b1644a86a098fe45aed19251edad',build:'8520'},
 '8.5.1':{sha:'00f46d50fd122dbf40eabcb47689db53288f7dad',build:'8510'},
 '8.5.0':{sha:'35f4fae07da0e5983ba3c8a66cbbb80abdb9e816',build:'8500'},
 '8.4.0':{sha:'7139dff74a4284ed4ca27322bf3da9760f4eab6c',build:'840'},
 '8.3.0':{sha:'099b10b130f82f9876352a39efc58d28cbffa941',build:'830'},
 '8.2.2':{sha:'9906707afd048261bcbddf62a2beb8466e20b1fc',build:'822'},
 '8.2.1':{sha:'a52a650ed7f43a3d1b588d8b03265cb7f16081b0',build:'821'},
 '8.2.0':{sha:'cc700917baa98763e736c34c1f34e8e3e05c0ab4',build:'820'},
 '8.1.0':{sha:'93fc444e7c9785a75144fb3f1b3da235c9c0aaf7',build:'810'},
 '8.0.0':{sha:'d17a72032ab228a1449244e54f024644394d6341',build:'800'},
 '7.7.2':{sha:'73fdc0c45e082aff3d83054a24434499e0b240e1',build:'772'},
 '7.7.1':{sha:'c6cd00053dd3dca2fcb8c7a536f6a0be3d6cb2a2',build:'771'},
 '7.6.0':{sha:'039c569e701fb6ae0e5a89023e243cf4e677d478',build:'760'},
 '7.5.6':{sha:'174914e334fc9e9ee7b8a02b9eae032f236ed594',build:'756'},
 '7.5.5':{sha:'1d2db5be14bd4fed11b46e3844d5e5f830c03fa',build:'755'},
 '7.5.4':{sha:'2f743500e5335f410c81efbfd58cc8df5fe6860b',build:'754'},
 '7.5.3':{sha:'30f8b06689ad5c39f0a2cab242857840b6be9fd8',build:'753'},
 '7.5.2':{sha:'440c0745c491de01d9794d25cedacab2fc6b9110',build:'752'},
 '7.5.1':{sha:'20c2c5427f1d6501703fbc4b07c184b3dcb09ea8',build:'751'},
 '7.5':{sha:'060d3de49732cc4da7586dbd241d117c4d8987b4',build:'750'},
 '7.4.1':{sha:'9ac5ec2086ad7f503f7022a94e5125d22211a73f',build:'741'},
 '7.4':{sha:'29c0b329c0a0845f0ea79d34cd076b995ecfa10d',build:'740'},
 '7.3':{sha:'c936cbdc9bf2697042d2bec75e511bbe2e048850',build:'730'},
 '7.2':{sha:'9fb7f9d6fba8f884be303fbeb4c53a2823b82aea',build:'722'},
 '7.0':{sha:'365eb4f16d17469e7cae9bed6ef302f846523e0f',build:'700'}
});

const buildFor=version=>version===LATEST?CURRENT_BUILD:(RELEASES[version]?.build||CURRENT_BUILD);
function goEditorVersion(version,replace=false){const target=version===LATEST||RELEASES[version]?version:LATEST,u=new URL(location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',target);u.searchParams.set('_editorBuild',buildFor(target));if(target===LATEST)u.searchParams.delete('archive');else u.searchParams.set('archive','1');location[replace?'replace':'assign'](u.toString())}
window.rafEditorBuildFor=buildFor;window.rafGoEditorVersion=goEditorVersion;window.rafEditorReleases=Object.freeze([LATEST,...Object.keys(RELEASES)]);

let editorReleased=false;
function releaseEditor(){if(editorReleased)return;editorReleased=true;document.documentElement.classList.add('raf-editor-ready');window.dispatchEvent(new CustomEvent('raf:editor-ready'))}
if(editorMode)setTimeout(releaseEditor,4800);
async function waitEditorSettled(){const started=performance.now();let last=performance.now(),obs;try{obs=new MutationObserver(()=>{last=performance.now()});obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','src','href']})}catch{}while(performance.now()-started<3800){const toolbar=document.querySelector('#rafTop3,.peTop'),quiet=performance.now()-last>420;if(toolbar&&quiet&&document.readyState!=='loading')break;await new Promise(r=>setTimeout(r,70))}try{obs?.disconnect()}catch{}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await new Promise(r=>setTimeout(r,120));releaseEditor()}

function wireArchivedNavigation(){let tries=0,lastSelect=null;const timer=setInterval(()=>{tries++;const select=document.querySelector('#editorVersion770 select,[id^="editorVersion"] select'),page=document.querySelector('#pageSelect4'),status=document.querySelector('#rafStatus3');if(select&&select!==lastSelect){lastSelect=select;select.value=requested;select.title='Uruchomiona archiwalna wersja edytora '+requested;select.onchange=()=>goEditorVersion(select.value)}if(page&&!page.dataset.rafArchiveNav){page.dataset.rafArchiveNav='1';page.onchange=e=>{const u=new URL(e.target.value,location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',requested);u.searchParams.set('_editorBuild',buildFor(requested));u.searchParams.set('archive','1');location.href=u.toString()}}if(status&&!/Zmiany|Opublik|Błąd|Cofanie|Ponawianie|Synchron|Usuw|Szablon/i.test(status.textContent)){status.textContent='◷ Archiwalny edytor '+requested+' — wybierz '+LATEST+', aby wrócić'}if(tries>300)clearInterval(timer)},100)}
function archiveFailure(error){releaseEditor();console.error('RAF archived editor bootstrap error',error);const box=document.createElement('div');box.id='rafArchiveError';box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:24px;font:15px/1.5 system-ui;border:1px solid #333;border-radius:16px;box-shadow:0 20px 80px #000';box.innerHTML='<h2 style="margin:0 0 10px">Nie udało się uruchomić wersji '+requested+'</h2><p style="color:#bbb">Archiwalne pliki tej wersji nie zostały pobrane. Projekt nie został zmieniony.</p><button id="rafArchiveRetry" style="padding:10px 14px;margin-right:8px">Spróbuj ponownie</button><button id="rafArchiveLatest" style="padding:10px 14px">Wróć do '+LATEST+'</button>';document.body.appendChild(box);box.querySelector('#rafArchiveRetry').onclick=()=>location.reload();box.querySelector('#rafArchiveLatest').onclick=()=>goEditorVersion(LATEST)}
async function bootArchived(){const release=RELEASES[requested];if(!release){goEditorVersion(LATEST,true);return}document.documentElement.dataset.rafEditorArchive=requested;wireArchivedNavigation();try{await import('https://cdn.jsdelivr.net/gh/universalwebtools/raf-studio@'+release.sha+'/editor-entry.js?rafArchive='+encodeURIComponent(requested))}catch(error){archiveFailure(error)}}

async function bootCurrent(){
 const path=location.pathname.toLowerCase(),portfolio=path.endsWith('/fotografia.html')||path.endsWith('/film.html')||path.endsWith('/fotografia/')||path.endsWith('/film/');
 try{
  await import('./auth-gate.js?v=3.2.1');await import('./image-webp-v60.js?v=6.5.3');
  if(!portfolio){await import('./editor-recovery-v64.js?v=6.5.3');await import('./editor-baseline-sync-v652.js?v=7.7.2')}
  if(portfolio){await import('./portfolio-editor.js?v=6.2.0');await import('./portfolio-page-v4.js?v=4.0.0');await import('./portfolio-chrome-v47.js?v=7.7.2')}
  else{
   await import('./editor-media-prefetch-v43.js?v=4.3.0');await import('./editor-prep-v34.js?v=3.4.0');await import('./direct-editor-v3.js?v=8.7.0');await import('./editor-ui-v4.js?v=8.7.0');await import('./editor-custom-v42.js?v=4.2.0');await import('./typography-controller-v65.js?v=6.5.3');await import('./editor-media-section-v65.js?v=8.7.0');await import('./motion-preview-fix-v44.js?v=4.4.0');await import('./editor-motion-fix-v45.js?v=4.5.0');await import('./editor-sections-v55.js?v=5.5.0');await import('./editor-pro-v61.js?v=8.8.4');await import('./custom-sections-editor-v62.js?v=6.5.3');await import('./custom-section-delete-v653.js?v=6.5.3');await import('./editor-v70-migrate.js?v=7.0.1');await import('./template-blueprints-v75.js?v=8.7.1');await import('./blueprint-guard-v75.js?v=8.7.1');await import('./editor-parity-v752.js?v=8.8.7');
   await import('./editor-core-v760.js?v=8.7.2');await import('./editor-meaningful-undo-v874.js?v=8.7.4');await import('./editor-safe-controls-v876.js?v=8.7.6');await import('./accordion-runtime-v877.js?v=8.8.3');await import('./editor-accordion-v877.js?v=8.8.3');await import('./editor-groups-v880.js?v=8.8.3');
   await import('./editor-v70-layout-guard.js?v=7.7.2');await import('./editor-templates-v752.js?v=8.7.1');await import('./editor-history-v72.js?v=8.7.3');await import('./editor-hero-direct-crop-v887.js?v=8.8.7');await import('./editor-chrome-v73.js?v=8.8.7');await import('./editor-workspace-v760.js?v=8.7.2');await import('./editor-pages-v860.js?v=8.7.0');await import('./editor-widgets-v770.js?v=8.8.4');await import('./editor-version-history-v760.js?v=8.7.0');await import('./direct-publish-v760.js?v=8.7.2')
  }
  await waitEditorSettled()
 }catch(err){console.error('RAF visual editor bootstrap error',err);releaseEditor();const box=document.createElement('div');box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:20px;font:16px system-ui;border:1px solid #333;border-radius:16px';box.textContent='Błąd uruchamiania edytora: '+err.message;document.body.appendChild(box)}
}
const explicitArchive=params.get('archive')==='1';
if(editorMode&&requested!==LATEST&&!explicitArchive){const u=new URL(location.href);u.searchParams.set('ev',LATEST);u.searchParams.set('_editorBuild',CURRENT_BUILD);u.searchParams.delete('archive');history.replaceState(null,'',u.toString())}
(async()=>{if(editorMode&&requested!==LATEST&&explicitArchive){await bootArchived();return}await import('./video-performance-v884.js?v=8.8.4');await import('./site-v800.js?v=8.7.2');if(!editorMode)await import('./accordion-runtime-v877.js?v=8.8.3');if(editorMode)await bootCurrent()})();
