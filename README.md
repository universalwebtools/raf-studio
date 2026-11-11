# RAF.studio – raf-studio.pl

Strona fotografa i filmowca RAF.studio (Bielsko-Biała). Lekka strona w czystym HTML,
generowana z plików z treścią, z własnym edytorem pod adresem **raf-studio.pl/admin/**.

## Struktura

| Folder / plik | Co zawiera |
|---|---|
| `site/content/*.json` | Cała treść strony: teksty, usługi, portfolio, filmy, wpisy |
| `site/src/templates.mjs` | Szablony HTML (działają w Node i w edytorze w przeglądarce) |
| `site/src/style.css`, `site/src/site.js` | Wygląd i interakcje strony |
| `site/admin/` | Edytor treści |
| `site/media/` | Zdjęcia (WebP) i wideo |
| `site/static/` | Pliki kopiowane bez zmian (ikony, czcionki) |
| `docs/` | Gotowa strona – stąd serwuje ją GitHub Pages |
| `database.rules.json`, `storage.rules` | Reguły bezpieczeństwa Firebase |

## Jak to działa

- **Edytor online** (`/admin/`): logowanie kontem administratora w Firebase, „Opublikuj”
  zapisuje treść i gotowe strony jako commit w tym repozytorium. GitHub Pages publikuje
  zmiany w ok. minutę.
- **Lokalnie** (wymaga Node.js 20+):
  ```
  cd site
  node server.mjs      # strona: http://localhost:4321, edytor: /admin/
  node build.mjs       # tylko przebudowa docs/
  ```
- Po zmianie szablonów, stylów lub edytora trzeba uruchomić `node build.mjs`
  i zatwierdzić zmiany w `docs/`.

## Reguły Firebase

```
firebase deploy --only database,storage --project raf-studio-strona
```
Zapis do `website/*` ma wyłącznie konto administratora strony.
