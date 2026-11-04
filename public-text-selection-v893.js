// Discourage casual text copying on public pages without affecting forms/editor.
const query = new URLSearchParams(location.search);
if (!query.has('editor') && !query.has('rafDraftPage') && !query.has('tplPreview')) {
  const editable = target => !!target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
  document.documentElement.classList.add('raf-no-text-selection');
  const style = document.createElement('style');
  style.textContent = `
html.raf-no-text-selection body, html.raf-no-text-selection body * {
  -webkit-user-select: none !important;
  user-select: none !important;
}
html.raf-no-text-selection :is(input,textarea,select,[contenteditable]:not([contenteditable="false"])),
html.raf-no-text-selection [contenteditable]:not([contenteditable="false"]) * {
  -webkit-user-select: text !important;
  user-select: text !important;
}`;
  document.head.appendChild(style);
  for (const type of ['selectstart', 'copy']) {
    document.addEventListener(type, event => {
      if (!editable(event.target)) event.preventDefault();
    });
  }
}
