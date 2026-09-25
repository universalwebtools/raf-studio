// RAF.studio 9.0 bootstrap — one version manifest, one core
const params=new URLSearchParams(location.search),mode=params.get('editor'),manifest=window.RAF_EDITOR_VERSION||{latest:'9.0.0',build:'9000',archives:{}};
const LATEST=manifest.latest,CURRENT_BUILD=manifest.build,RELEASES=manifest.archives||{},requested=params.get('ev')||LATEST;
const editorMode=mode==='direct'||mode==='1',ASSET=manifest.asset||LATEST;
const load=(path,tag=ASSET)=>import(path+'?v='+encodeURIComponent(tag));
const buildFor=version=>version===LATEST?CURRENT_BUILD:(RELEASES[version]?.build||CURRENT_BUILD);
function goEditorVersion(version,replace=false){const target=version===LATEST||RELEASES[version]?version:LATEST,u=new URL(location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',target);u.searchParams.set('_editorBuild',buildFor(target));if(target===LATEST)u.searchParams.delete('archive');else u.searchParams.set('archive','1');location[replace?'replace':'assign'](u.toString())}
window.rafEditorBuildFor=buildFor;window.rafGoEditorVersion=goEditorVersion;window.rafEditorReleases=Object.freeze([LATEST,...Object.keys(RELEASES)]);

let editorReleased=false;
function releaseEditor(){if(editorReleased)return;editorReleased=true;document.documentElement.classList.add('raf-editor-ready');window.dispatchEvent(new CustomEvent('raf:editor-ready'))}
if(editorMode)setTimeout(releaseEditor,5500);
async function waitEditorSettled(){const started=performance.now();let last=performance.now(),obs;try{obs=new MutationObserver(()=>{last=performance.now()});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','src','href']})}catch{}while(performance.now()-started<4200){const toolbar=document.querySelector('#rafTop3'),core=window.rafCore900,quiet=performance.now()-last>350;if(toolbar&&core&&quiet&&document.readyState!=='loading')break;await new Promise(r=>setTimeout(r,70))}try{obs?.disconnect()}catch{}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));releaseEditor()}

function wireArchivedNavigation(){let tries=0,lastSelect=null;const timer=setInterval(()=>{tries++;const select=document.querySelector('#editorVersion770 select,[id^="editorVersion"] select'),page=document.querySelector('#pageSelect4'),status=document.querySelector('#rafStatus3');if(select&&select!==lastSelect){lastSelect=select;select.value=requested;select.onchange=()=>goEditorVersion(select.value)}if(page&&!page.dataset.rafArchiveNav){page.dataset.rafArchiveNav='1';page.onchange=e=>{const u=new URL(e.target.value,location.href);u.searchParams.set('editor','direct');u.searchParams.set('ev',requested);u.searchParams.set('_editorBuild',buildFor(requested));u.searchParams.set('archive','1');location.href=u.toString()}}if(status&&!/Zmiany|Opublik|Błąd|Cofanie|Ponawianie|Synchron|Usuw|Szablon/i.test(status.textContent||''))status.textContent='◷ Archiwalny edytor '+requested+' — wybierz '+LATEST+', aby wrócić';if(tries>160)clearInterval(timer)},120)}
function archiveFailure(error){releaseEditor();console.error('RAF archived editor bootstrap error',error);const box=document.createElement('div');box.id='rafArchiveError';box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:24px;font:15px/1.5 system-ui;border:1px solid #333;border-radius:16px';box.innerHTML='<h2>Nie udało się uruchomić wersji '+requested+'</h2><button id="rafArchiveLatest">Wróć do '+LATEST+'</button>';document.body.appendChild(box);box.querySelector('#rafArchiveLatest').onclick=()=>goEditorVersion(LATEST)}
async function bootArchived(){const release=RELEASES[requested];if(!release){goEditorVersion(LATEST,true);return}document.documentElement.dataset.rafEditorArchive=requested;wireArchivedNavigation();try{await import('https://cdn.jsdelivr.net/gh/universalwebtools/raf-studio@'+release.sha+'/editor-entry.js?rafArchive='+encodeURIComponent(requested))}catch(error){archiveFailure(error)}}

async function bootCurrent(){
 const path=location.pathname.toLowerCase(),portfolio=path.endsWith('/fotografia.html')||path.endsWith('/film.html')||path.endsWith('/fotografia/')||path.endsWith('/film/');
 await import('./auth-gate.js?v=3.2.1');await import('./image-webp-v60.js?v=6.5.3');
 if(portfolio){await import('./portfolio-editor.js?v=6.2.0');await import('./portfolio-page-v4.js?v=4.0.0');await import('./portfolio-chrome-v47.js?v=7.7.2');await waitEditorSettled();return}
 await load('./editor-shell-v900.js');
 await load('./renderer-v900.js');
 await load('./editor-history-v900.js');
 await load('./editor-core-v900.js');

 // Feature editors stay compatible, but Core 9 owns canvas selection/transforms/history.
 await import('./editor-recovery-v64.js?v=6.5.3');await import('./editor-baseline-sync-v652.js?v=7.7.2');
 await import('./editor-media-prefetch-v43.js?v=4.3.0');await import('./editor-prep-v34.js?v=3.4.0');
 await import('./typography-controller-v65.js?v=6.5.3');await import('./editor-media-section-v65.js?v=8.7.0');
 await import('./motion-preview-fix-v44.js?v=4.4.0');await import('./editor-motion-fix-v45.js?v=4.5.0');
 await import('./editor-sections-v55.js?v=5.5.0');await import('./editor-pro-v61.js?v=8.8.8');
 await import('./custom-sections-editor-v62.js?v=6.5.3');await import('./custom-section-delete-v653.js?v=6.5.3');
 await import('./editor-v70-migrate.js?v=7.0.1');await import('./template-blueprints-v75.js?v=8.7.1');await import('./blueprint-guard-v75.js?v=8.7.1');
 await import('./accordion-runtime-v877.js?v=8.8.3');await import('./editor-accordion-v877.js?v=8.8.3');await load('./editor-groups-v880.js');
 await import('./editor-v70-layout-guard.js?v=7.7.2');await import('./editor-templates-v752.js?v=8.7.1');
 await load('./editor-hero-media-v888.js');await load('./editor-hero-resize-v890.js');
 await load('./editor-chrome-v888.js');await load('./editor-dock-v889.js');
 await load('./editor-workspace-v760.js');await import('./editor-pages-v860.js?v=8.7.0');
 await import('./editor-widgets-v770.js?v=8.8.4');await import('./editor-version-history-v760.js?v=8.7.0');
 await load('./direct-publish-v760.js');
 await waitEditorSettled();
}
const explicitArchive=params.get('archive')==='1';
if(editorMode&&requested!==LATEST&&!explicitArchive){const u=new URL(location.href);u.searchParams.set('ev',LATEST);u.searchParams.set('_editorBuild',CURRENT_BUILD);u.searchParams.delete('archive');history.replaceState(null,'',u.toString())}
(async()=>{try{
 await load('./hero-video-layout-v888.js');await load('./video-performance-v888.js');await load('./site-v800.js');await load('./renderer-v900.js');
 if(editorMode&&requested!==LATEST&&explicitArchive){await bootArchived();return}
 if(!editorMode){await import('./accordion-runtime-v877.js?v=8.8.3');return}
 await bootCurrent()
}catch(err){console.error('RAF 9.0 bootstrap error',err);releaseEditor();const box=document.createElement('div');box.style.cssText='position:fixed;inset:20px;z-index:999999;background:#111;color:#fff;padding:20px;font:16px system-ui;border:1px solid #333;border-radius:16px';box.textContent='Błąd uruchamiania edytora 9.0: '+err.message;document.body.appendChild(box)}})();
