# RAF.studio 9.0.1 — stan prac

Data: 25.09.2026. Kontynuacja rozmowy „001 Strona RAF STUDIO”.

## Zakres tego wydania

Punktem wyjścia był zapisany na `main` Core 9.0.0
(`b87e18c64fb310cb8d7f6e14b9887d2a6faa5695`). Wydanie 9.0.1 stabilizuje
zaakceptowany fundament: punkty **1–7, 23, 27, 28** audytu. Nie oznacza
ukończenia całej przebudowy opisanej w 34 punktach. Specjalistyczne moduły
poprzednich generacji nadal działają jako adaptery.

| Punkt | Stan w 9.0.1 |
|---|---|
| 1. Jeden rdzeń | Core 9 obsługuje bieżące zaznaczanie i transformacje; silnik układu jest współdzielony z rendererem. Migracja wszystkich specjalistycznych paneli pozostaje dalszym etapem. |
| 2. Jedna historia | Wspólne cofanie i ponawianie obejmuje cztery gałęzie szkicu. Zapis stanu jest atomowy; szybkie cofnięcie czeka na zapis, a nieudane cofnięcie można ponowić. Oddzielono skalowanie w panelu od zmiany rozmiaru uchwytem. |
| 3. Wspólny renderer | Tekst, układ, klony i kolejność przechodzą przez wspólne renderowanie. Sprawdzono publikację tekstu z pełnego edytora i ponowne otwarcie strony publicznej. Pełna zgodność wszystkich szablonów wymaga punktu 29. |
| 4. Trwałe identyfikatory | UUID obiektów są zapisywane w mapie o kluczach zgodnych z Firebase. Identyfikatory zachowują się po zmianie kolejności i odświeżeniu; potomkowie klonów otrzymują własną przestrzeń identyfikatorów. |
| 5. FREE / LAYOUT | Zachowano wspólne tryby układu. Usunięto kasowanie źródłowych stylów szablonu podczas przesuwania i resetowania nadpisania. Nie jest to jeszcze pełny edytor kontenerów z punktu 10. |
| 6. Zaznaczanie | Sprawdzono kliknięcie, przeciąganie, wielokrotny wybór i wybór grupy. Ctrl+A pomija rodziców zaznaczonych dzieci. Elementy interfejsu i modal publikacji są wyłączone z przechwytywania gestów płótna. Pozostałe kombinacje zagnieżdżeń wymagają szerszej macierzy scenariuszy. |
| 7. Transformacje | Naprawiono proporcjonalną zmianę rozmiaru po wcześniejszym skalowaniu i zachowanie przeciwległego narożnika. Sprawdzono skalowanie wielu obiektów do 65%, cofanie i ochronę zablokowanych obiektów. |
| 23. Wydajność | Usunięto pętle samowyzwalających się zmian DOM w kolejności, tekstach, panelu grup i FAQ oraz polling FAQ/uchwytów hero. Test sprawdza uspokojenie renderera po operacji. Nie wykonano benchmarku wszystkich 101 szablonów. |
| 27. Wersjonowanie | Manifest wskazuje 9.0.1 / build 9010. Przekierowanie edytora, ładowanie zmienionych modułów, etykiety publikacji i historia wersji korzystają z manifestu. Starsze, niezmienione adaptery zachowują własne znaczniki plików. |
| 28. Testy | Dodano scenariusze interakcji oraz pełne uruchomienie edytora i publikację na izolowanych danych. CI sprawdza kod konkretnego commitu lokalnie, zamiast poprzedniej wersji na stronie produkcyjnej. Dalsze scenariusze mediów, FAQ, paneli i wszystkich szablonów pozostają do rozszerzenia. |

## Pozostałe punkty audytu

„Dalszy etap” oznacza, że wydanie nie dostarcza kompletnej przebudowy tego
obszaru. Część funkcji jest już dostępna we wcześniejszych modułach.

| Punkt | Obszar | Stan / następny krok |
|---|---|---|
| 8 | Grupy | Podstawowe grupowanie i wspólne skalowanie sprawdzone; pełna obsługa zagnieżdżonych grup — dalszy etap. |
| 9 | Komponenty | Dalszy etap: instancje i powiązane aktualizacje. |
| 10 | Kontenery FREE / STACK / GRID | Dalszy etap: wspólny model i panel układu. |
| 11 | Responsive w jednej aplikacji | Obecny rdzeń obsługuje wariant urządzenia; pełne uporządkowanie interfejsu — dalszy etap. |
| 12 | Dziedziczenie responsive | Sprawdzono nadpisanie telefonu bez zmiany desktopu i reset do wartości odziedziczonej; pełna macierz właściwości — dalszy etap. |
| 13 | Nowy interfejs | Poprawiono zawijanie górnego paska i dostępność publikacji; całościowy redesign — dalszy etap. |
| 14 | Dokowane panele | Zachowane dotychczasowe panele; pełna przebudowa i testy dockowania — dalszy etap. |
| 15 | Drzewo warstw | Dalszy etap przebudowy hierarchii i przeciągania pomiędzy kontenerami. |
| 16 | Inspector zależny od możliwości obiektu | Dalszy etap migracji paneli do wspólnego schematu. |
| 17 | Wspólny edytor mediów | Zachowane istniejące moduły; pełna unifikacja — dalszy etap. |
| 18 | Biblioteka mediów | Dalszy etap przebudowy. |
| 19 | Przyciąganie i prowadnice | Istniejące mechanizmy zachowane; pełne scenariusze wyrównywania i odstępów — dalszy etap. |
| 20 | Menu kontekstowe i skróty | Istniejące mechanizmy zachowane; pełny przegląd komend — dalszy etap. |
| 21 | Sekcje jako obiekty | Dalszy etap ujednolicenia całego cyklu operacji na sekcji. |
| 22 | Walidator 101 szablonów | Nie wdrożono w tym wydaniu. |
| 24 | Wspólna warstwa Firebase | Atomowy zapis rdzenia i historii gotowy; migracja wszystkich zapisów adapterów — dalszy etap. |
| 25 | Publikacja i zgodność wyniku | Naprawiono blokowanie modala i sprawdzono pełną ścieżkę tekstu na danych testowych. Pełna walidacja wszystkich rodzajów obiektów — dalszy etap. |
| 26 | Autosave / Recovery 2 | Kolejka zapisu rdzenia poprawiona; pełny nowy system odzyskiwania — dalszy etap. |
| 29 | Regresja wizualna 101 × 3 | Nie wykonano w tym wydaniu. |
| 30 | Paleta poleceń | Dalszy etap. |
| 31 | Globalny system stylów | Dalszy etap. |
| 32 | Inspector dostępności i SEO | Dalszy etap. |
| 33 | Tryb diagnostyczny | Dalszy etap. |
| 34 | Porządki starych generacji repozytorium | Dalszy etap; archiwalne wersje zachowano. |

## Weryfikacja i ograniczenia

Zestaw zawiera **21 testów Playwright**: 5 kontroli architektury/składni,
12 scenariuszy interakcji, 1 pełny scenariusz edycji i publikacji oraz 3 testy
nagłówka i strony publicznej. Testy operacji zapisu używają lokalnego mocka
Firebase i nie zmieniają treści użytkownika w produkcji. Nie weryfikują
rzeczywistych reguł dostępu Firebase, uploadów ani usług wideo.

Uruchomienie: `npm ci`, `npx playwright install chromium`, `npm test`.
Workflow regresji i wdrożenie GitHub Pages działają niezależnie; ten workflow
nie jest blokadą wdrożenia Pages.
