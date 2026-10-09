# RAF.studio Editor 9.0 — isolated beta

**Location:** `/editor90/` — opened by **Nowy edytor by ChatGPT · 9.0** in `/admin/`.

## Separation and safety

- The original editor routes, versions 7.x–8.9.3, website pages and associated JS/CSS files are unchanged.
- No code in `editor90/` calls Firebase Database writes, Firebase Storage uploads or the production publishing mechanism.
- Editor 9.0 drafts use their own localStorage key `rafStudioEditor90Draft.v1`, and restore points use `rafStudioEditor90Snapshots.v1`.
- The 9.0 editor uses the existing Firebase Authentication to display the login screen. The actual security of existing Firebase data is enforced by Firebase database/storage rules; this editor has no production-write capability.
- There is a **read-only** limited content import from `website/public`. It copies only basic hero text, contact details, photos and a film URL into a new draft. It is **not** a full fidelity conversion of the complex 8.x layout.
- The publish button is deliberately disabled. To test, edit the local draft, use preview and download a JSON backup. No other data is modified.

## First usable release

- Desktop/tablet/mobile preview; separate overrides of section padding, backgrounds, typography scale, columns, height and visibility.
- 13 section widgets: hero, text, gallery, features, video, CTA, reviews, pricing, FAQ, contact, logos, spacer and footer.
- Editable text directly in the canvas on double-click.
- Selection (Shift/Alt-click), multi-section duplicate/reorder/delete, draggable layer list.
- Page list, add pages, rename pages, editable inspector, global palette.
- Four genuinely different starter layouts (cinematic, wedding, minimal, creative).
- Undo/redo, local autosave, 3 manual restore points, JSON export/import.
- Local image library with compression to WebP and URL-based photos/videos. The localStorage size depends on the browser; for large libraries use URL sources or await Firebase Storage integration.
- Firebase admin login gate and read-only import of basic v8 CMS data.

## Known limitations / follow-up milestones

This is the **foundation beta**, not feature parity with the full existing editor. Advanced free-form object transformations, group bounding-box resizing, rich nested containers, multi-page published routes, Firebase draft syncing, media Storage uploads, public publishing, and comprehensive automatic migration of layouts from 8.9.3 are **not implemented yet**.

The existing 7.x–8.x editor is still the production editor and remains fully available. The 9.0 data model is deliberately new so these features can be added iteratively without patching or overwriting the old JS modules.

## Test checklist

1. Log in to `/admin/`; click **Nowy edytor by ChatGPT**.
2. Click an element in layers, edit its heading by double-clicking and edit its properties.
3. Add a widget, reorder it and use undo/redo.
4. Check mobile/tablet overrides and preview.
5. Switch pages, try templates, export JSON, and restore from it.
6. Reload the editor and verify the separate local draft remains.
7. Confirm the public RAF.studio website and the existing 8.9.3 editor have not changed.
