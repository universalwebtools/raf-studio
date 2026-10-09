# RAF.studio · Modern Workspace 8.9.3 (opcja testowa)

## Co to jest?

To **nakładka interfejsu na prawdziwy edytor 8.9.3**, nie kolejny kreator pisany od zera. Zachowuje obecny silnik obiektów, moduły widżetów, szablony, historię, edycję HERO, ustawienia responsywne, Firebase i publikację.

**Test:** `/?editor=direct&ev=8.9.3&_editorBuild=8930&modern=1`

**Wersja klasyczna:** `/?editor=direct&ev=8.9.3&_editorBuild=8930`

## W tej iteracji

- Nowy dwurzędowy górny pasek: osobne sterowanie trybem Modern i **wszystkie oryginalne kontrolki** przeniesione do poziomego docka; ich event handlers pozostają te same.
- Przebudowany wizualnie panel właściwości z lepszą czytelnością; zwijanie i możliwość zmiany szerokości.
- Lewy nawigator: automatycznie indeksuje istniejące sekcje strony i widżety, przechodzenie do obiektów, zakładka narzędzi.
- **Ctrl+K** — wyszukiwarka wszystkich oryginalnych modułów i bieżących sekcji; Enter uruchamia, Esc zamyka.
- Skróty **Alt+Shift+F** (pełne płótno) oraz oryginalne Ctrl+Z/Ctrl+Y/Tab, bez przejmowania ich logiki.
- Szybkie otwieranie oryginalnych bibliotek: widżety, szablony, warstwy, podstrony, styl, historia wersji, preview i pływające panele.
- Powrót do oryginalnego wyglądu jednym przyciskiem.
- Nowy przycisk w panelu admina, ponad archiwalnym prototypem 9.0.

## Bezpieczeństwo i ograniczenia

- Modernizacja jest **opt-in**. Bez parametru `modern=1` nie ładuje się ani CSS, ani JS nakładki.
- Żaden z modułów starego edytora nie został nadpisany ani usunięty.
- **Uwaga: tryb Modern używa TEGO SAMEGO szkicu Firebase i tych samych przycisków zapisu/publikacji co 8.9.3.** Jest to osobny interfejs, NIE osobna kopia danych! Edytowanie treści działa jak w klasycznym 8.9.3. Do eksperymentów z usuwaniem treści lub szablonami najpierw utwórz punkt przywracania w „Wersjach”.
- Płótno strony (w tym układy i elementy publikowane) nie jest modyfikowane CSS-em nakładki — stylowane są wyłącznie kontrolki edytora.
- Widok tabletu i telefonu korzysta w tej iteracji z dotychczasowego `mobile-editor.html`; zintegrowanie tych widoków w jednym workspace to kolejny etap.
- To etap przebudowy interfejsu, nie naprawa wszystkich dotychczasowych błędów funkcjonalnych 8.9.3.

## Dalsza kolejność

1. Dopracować kontekstowe narzędzia zaznaczania i skalowania na istniejącym silniku.
2. Zunifikować panele edycji tekstu/wideo/zdjęć i interakcję z warstwami.
3. Integracja PC/tablet/telefon w jednym obszarze z poprawnym renderowaniem.
4. Dopiero potem odizolowane kopie projektu, bezpieczne testy i lepszy proces publikacji.
