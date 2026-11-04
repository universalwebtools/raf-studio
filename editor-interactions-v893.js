// Shared policy: site controls activate normally; Ctrl/Cmd+click edits them.
const UI = '#rafTop3,#rafPanel3,#rafNav3,#rafModal3,#rafProModal61,#tpl752,#v4SectionModal,#widgetsModal770,#pages860,#v72box,#v760layers,#v760menu,#v760history,#v760publishCheck,#rafHeaderEdit900,#authUserBar,#prev72back,#rafModern894,#rafHeroToolbar890,.rafHeroResizeHandle890,.rw-lightbox,#rwLightbox770,#rwVideoLightbox820,#lightbox,#videoModal,[data-raf-dock-ignore],.peTop,.pePanel,.peMedia,.v760toast';
export const isEditorUi = target => !!target?.closest?.(UI);
export function canvasAction(target) {
  if (isEditorUi(target) || target?.closest?.('[contenteditable="true"]')) return null;
  return target?.closest?.('a[href],button,summary,input,textarea,select,label,video[controls],audio[controls],[role="button"],[data-showreel],[data-lightbox="1"]') || null;
}
export const editGesture = event => !!(event.ctrlKey || event.metaKey);

// Keep saved link values untouched: editor parameters belong only to navigation.
export function editorDestination(href, currentHref) {
  const current = new URL(currentHref), target = new URL(href, current);
  if (target.origin !== current.origin || !/^\/(?:index\.html|fotografia(?:\.html|\/)?|film(?:\.html|\/)?)?$/.test(target.pathname)) return null;
  for (const key of ['editor', 'ev', '_editorBuild', 'device', 'embedded', 'modern', 'archive']) {
    if (current.searchParams.has(key)) target.searchParams.set(key, current.searchParams.get(key));
  }
  return target.href;
}

const navigationSaves = new Set();
export function registerNavigationSave(flush) { navigationSaves.add(flush); }
let installed = false, navigating = false;
export function installEditorNavigation() {
  if (installed) return;
  installed = true;
  document.addEventListener('click', async event => {
    if (event.defaultPrevented || event.button !== 0 || editGesture(event) || event.shiftKey || event.altKey) return;
    const link = canvasAction(event.target);
    if (!link?.matches('a[href]') || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#')) return;
    const target = editorDestination(link.href, location.href);
    if (!target) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    try {
      document.activeElement?.blur?.();
      // Finish queued edits before leaving the document; do not publish them.
      for (const flush of navigationSaves) await flush();
      location.assign(target);
    } catch (error) {
      console.error('RAF editor navigation save', error);
      const status = document.querySelector('#rafStatus3,#peStatus');
      if (status) status.textContent = 'Nie udało się zapisać zmian. Spróbuj ponownie otworzyć link.';
    } finally { navigating = false; }
  });
}
