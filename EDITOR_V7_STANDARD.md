# RAF.studio Editor v7 — Professional Builder Standard

This document is the source of truth for every future editor update.

The goal is not to copy proprietary code or UI from Wix, WebWave, Hostinger or WordPress. The goal is to adopt the interaction standards users expect from professional visual website builders.

## 1. Universal rule: everything visible is an editable object

Every visible object on canvas must be selectable unless explicitly locked by the editor itself.

Supported object types include:
- text
- heading
- button
- link
- icon
- image
- video
- iframe/embed
- card
- box/rectangle
- form
- form field
- menu
- logo
- gallery
- slider/carousel
- review
- brand logo
- counter/statistic
- section
- container
- group
- custom section element

Every object should expose the capabilities that make sense for its type without requiring a custom one-off implementation.

## 2. Selection behavior

### Single selection
- click object = select object
- selection box must follow the real rendered bounds
- selected object opens its inspector automatically
- double click text = inline text editing
- Escape = exit inline editing / clear selection

### Multi-select
- Shift + click = add/remove object from selection
- drag marquee on empty canvas = select all leaf objects inside/intersecting the rectangle
- never select a parent and its child at the same time unless explicitly requested
- Ctrl/Cmd + A when canvas focused = select all editable objects in current section

### Nested objects
- first click selects deepest useful child
- repeated click / Alt+click cycles upward through parent containers
- groups act as one object by default
- Enter / double click group = enter group and edit children

## 3. Moving

Every movable object must follow the pointer 1:1.

Rules:
- no hidden 8 px snapping unless enabled
- no parent+child double movement
- preserve starting state when drag starts
- pointer move modifies live state
- pointer up commits exactly once
- arrow keys = 1 px
- Shift + arrows = 10 px
- optional snap guides may assist but must never cause visible jumping

## 4. Resize / rotate / transform

Every visual object that can be resized must expose handles.

Standard handles:
- corners = proportional resize
- sides = width/height resize
- rotate handle = rotate
- Shift = constrained/proportional behavior where appropriate
- Alt = resize from center where supported

Inspector values:
- X
- Y
- width
- height
- min/max width
- min/max height
- scale
- rotate
- opacity
- z-index

## 5. Groups

- Ctrl/Cmd + G = group selection
- Ctrl/Cmd + Shift + G = ungroup
- group can contain text + buttons + images + boxes + embeds together
- group moves as one object
- internal relative distances must never change while moving group
- group can be resized when safe
- entering a group allows child editing
- deleting group asks whether to delete children or ungroup when ambiguity exists

## 6. Containers / stacks / layout

Support three container modes:
- Free / absolute canvas
- Stack / flex
- Grid

Container properties:
- direction
- gap
- padding
- align
- justify
- wrap
- columns / rows
- min/max dimensions
- overflow

Objects may be docked/pinned to container edges when using responsive layouts.

## 7. Layers panel

Every editable object must exist in a layer tree.

Layer actions:
- rename
- select
- reorder
- drag into/out of groups and containers
- show/hide
- lock/unlock
- duplicate
- delete
- bring forward/backward
- bring to front/send to back

Layer tree reflects real DOM/editor hierarchy.

## 8. Context menu

Right click selected object:
- Cut
- Copy
- Paste
- Duplicate
- Delete
- Group/Ungroup
- Lock/Unlock
- Hide/Show
- Bring to front
- Bring forward
- Send backward
- Send to back
- Copy style
- Paste style
- Reset transform

## 9. Clipboard

Standard shortcuts:
- Ctrl/Cmd + C copy
- Ctrl/Cmd + X cut
- Ctrl/Cmd + V paste
- Ctrl/Cmd + D duplicate

Paste should offset copied objects slightly so duplicates are visible.

## 10. Undo / redo

One history system for the entire editor.

- Ctrl/Cmd + Z = undo
- Ctrl/Cmd + Shift + Z = redo
- toolbar buttons use the same history
- every user gesture produces one history entry
- typing may be coalesced
- drag starts snapshot and commits at pointerup
- history covers all modules: text, media, PRO, sections, groups, responsive changes, deletes, uploads and custom sections

## 11. Inspector architecture

Inspector is capability-driven, not module-driven.

Common panels:
- Transform
- Layout
- Typography
- Fill / background
- Border
- Radius
- Shadow
- Opacity
- Effects
- Animation
- Responsive
- Link / action
- Accessibility

Object-specific panels appear only when relevant.

## 12. Typography

Professional text controls:
- font family
- custom font upload
- weight
- style
- font size
- line height
- letter spacing
- text transform
- alignment
- decoration
- color
- max width
- text wrapping
- auto width / fixed width

Hovering fonts may preview them live without committing until clicked.

## 13. Responsive design

Default breakpoints:
- desktop
- tablet
- mobile

Later support custom breakpoints.

Behavior:
- larger breakpoint values may cascade down until overridden
- mobile overrides do not alter desktop
- position, size, typography, visibility and layout may differ by breakpoint
- allow reset override to inherit from larger breakpoint
- allow hide on selected breakpoint

## 14. Global styles

Global design tokens:
- color palette
- text colors
- backgrounds
- accent colors
- H1/H2/H3 styles
- body text
- button styles
- radii
- spacing scale
- shadows

Local override is allowed and can be reset back to global style.

## 15. Sections

Sections are first-class objects.

Every section must support:
- select
- move/reorder
- duplicate
- delete
- hide
- lock
- background color/image/video/gradient
- padding
- min height
- full width / contained
- responsive overrides
- save as reusable section/pattern

Every element created inside a section must remain editable later.

## 16. Reusable patterns / templates

Support a library of reusable sections and compositions:
- hero
- offer/services
- portfolio
- reviews
- trusted brands
- stats
- FAQ
- contact
- CTA
- gallery
- video
- split image/text

Inserted patterns become normal editable objects.

## 17. Media handling

Images:
- click Choose from library
- drag/drop local file directly onto target
- upload automatically to the shared media library
- replace image
- crop
- focal point X/Y
- zoom
- object-fit cover/contain
- alt text
- optional auto-WEBP optimization

Video:
- YouTube
- Vimeo
- MP4/WebM
- cover/contain
- focal point
- zoom
- autoplay
- loop
- muted
- poster/fallback
- mobile fallback

## 18. Forms

Form builder objects:
- text
- email
- phone
- textarea
- select
- checkbox
- radio
- button

Properties:
- required
- placeholder
- validation
- labels
- success/error message
- destination/action

## 19. Animations

Animation properties:
- trigger: load / scroll / hover
- type
- duration
- delay
- easing
- distance
- stagger
- repeat

Preview animation button must replay animation in editor without changing layout position.

## 20. Alignment / snapping

Optional guides:
- canvas center
- section center
- element edges
- element centers
- equal spacing

Snap must be subtle and optional.

## 21. Spacing tools

For multi-selection:
- distribute horizontally
- distribute vertically
- equalize gaps
- align left/center/right
- align top/middle/bottom

## 22. Responsive auto-layout helper

Provide an Auto-layout/Auto-RWD helper that can:
- detect logically related nearby elements/groups
- create stack/grid suggestions
- preserve groups
- generate tablet/mobile starting layout
- never overwrite a manually customized breakpoint without confirmation

## 23. Preview

Preview mode must show only the visitor-facing page:
- no toolbar
- no inspector
- no selection boxes
- no editor nav artifacts
- no hidden editor-only text

Preview must use the current working draft, not only the last published version.

## 24. Publish

Publishing contract:

WHAT THE USER SEES IN THE EDITOR AT PUBLISH TIME = WHAT THE PUBLIC PAGE MUST SHOW.

After successful publish:
- public state is verified
- published state becomes the new editor baseline
- editorDraft is synchronized to published state
- no old autosave may overwrite the baseline
- open public tabs should receive a fresh-version signal

## 25. No-flash boot

Both public page and editor must stay visually hidden until the current Firebase state has been applied.

Never show:
- old placeholder images
- default text
- old transforms
- stale section order
- previous published version

Reveal only after ready, with a short fade.

## 26. Safe deletion

Deleting an object removes it from:
- current DOM/editor state
- draft data
- section order/group membership
- relevant style/transform maps

Deleted items must not reappear after refresh.

## 27. Locking

Locked object:
- remains visible
- cannot be moved/resized/deleted accidentally
- can still be selected from Layers panel
- can be unlocked from context menu/inspector/layers

## 28. Duplication

Duplicate preserves:
- content
- local styles
- responsive overrides
- animation
- media reference

But receives a new stable object ID.

## 29. Stable object IDs

Every editable object must have a stable persistent ID.

Never identify long-lived editable objects only by DOM index. IDs must survive reorder, refresh and publish.

## 30. Single source of truth

Future architecture must converge toward:
- one editor state store
- one history system
- one transform engine
- one selection system
- one persistence layer
- capability-based inspector

New features must extend this core instead of adding another independent competing editor module.

## 31. Performance rules

- avoid whole-document MutationObservers when possible
- no polling loops for selection/transform
- event driven updates
- batch Firebase writes
- debounce autosave
- one commit per user gesture
- avoid duplicated renderers writing the same CSS property

## 32. Default behavior rule for future development

When adding ANY new visual feature, assume by default that it must:
1. be selectable
2. be movable
3. be editable
4. be duplicable
5. be deletable
6. be hideable
7. be lockable
8. participate in multi-select
9. participate in grouping
10. support relevant responsive overrides
11. survive refresh
12. publish 1:1
13. appear in Layers panel
14. work with undo/redo

No new visual element is considered finished until these rules are satisfied.

## Migration plan

### v7.0 Core
- stable object IDs
- unified selection
- unified transform
- parent/child selection rules
- unified history
- universal inspector capabilities

### v7.1 Layers + clipboard
- layer tree
- rename/reorder/lock/hide
- cut/copy/paste/duplicate
- context menu

### v7.2 Responsive
- breakpoint inheritance
- per-breakpoint overrides
- reset-to-inherit
- auto-RWD helper

### v7.3 Layout
- free / stack / grid containers
- docking
- spacing/distribution tools

### v7.4 Patterns + reusable sections
- section library
- save section as pattern
- reusable global sections

### v7.5 Media + forms + advanced effects
- unified media inspector
- crop/focal/zoom
- form builder
- animation timeline/effects cleanup

The current stable v6.x publishing contract must remain intact during migration until v7 fully replaces it.
