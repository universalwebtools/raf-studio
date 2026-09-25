# RAF.studio 9.1.0 — przestrzeń pracy edytora

Data: 25.09.2026. Kontynuacja wydania 9.0.1.
Zakres: **punkty 1–9 z listy ulepszeń zaakceptowanej 25.09.2026**.
Numeracja nie odpowiada wcześniejszemu audytowi 34 punktów.

| Punkt | Dostarczone działanie |
|---|---|
| 1. Interfejs | Stały pasek zapisu, cofania, urządzeń i publikacji; zwijana nawigacja z wyszukiwanym drzewem warstw; wspólny panel właściwości. Specjalistyczne okna nagłówka, podstron, szablonów i widżetów dostępne z lewej strony. |
| 2. Grupy i kontenery | Grupowanie, wspólne przesuwanie i proporcjonalne skalowanie narożnikami oraz polem procentowym; wyrównanie; kontenery FREE, STACK i GRID, kierunek, odstępy, padding, kolumny, rozpakowanie. Cofanie przywraca rodzica elementów. |
| 3. Telefon | Osobny rzeczywisty viewport 390 px i tablet 768 px; wspólny panel oraz historia; dziedziczenie desktop → tablet → telefon, reset pojedynczych właściwości i całego nadpisania. Podgląd szkicu: 360, 390, 768 i 1440 px. |
| 4. Media | Wspólny panel obrazów i filmów: przeciągany punkt kadru, zoom, dopasowanie, osobny kadr urządzenia, podmiana pliku z zachowaniem geometrii, ALT. Dla HTML video: miniatura, autostart, pętla, wyciszenie i sterowanie. |
| 5. Biblioteka | Rekurencyjny odczyt istniejących plików website/media, upload obrazów i filmów, foldery, wyszukiwanie, filtr rodzaju i informacja o użyciu w zapisanych danych szkicu/podstron/PRO. |
| 6. Wersje | Nazwane wersje, miniatury i podgląd nowych zapisów, zmiana nazwy, przywrócenie szkicu z automatyczną kopią poprzedniej pracy. Komunikaty zapisu, błędu i utraty połączenia. |
| 7. Własne sekcje | Zapis zaznaczonej sekcji, niezależne kopie i wystąpienia wspólnego wzorca, aktualizacja wspólnych wystąpień z zaznaczenia. Przenoszenie własnych ustawień urządzeń wraz z sekcją. |
| 8. Marka | Fonty tekstu i nagłówków, kolory, wielkości, interlinia, przyciski i odstępy sekcji; wspólne renderowanie w edytorze i publicznie; lokalne ustawienia elementów mają pierwszeństwo. |
| 9. Publikacja | Kontrola linków, obrazów, odbiorcy formularza i wyjścia poza bieżący viewport; kliknięcie problemu zaznacza obiekt. Włączenie kontroli do publikacji, atomowy zapis gałęzi publicznych oraz testy mediów, FAQ i wyboru szablonu. |

## Dodatkowe naprawy

- Widoki desktopu i telefonu synchronizują model; zapis po przełączeniu widoku nie nadpisuje zmian drugiego urządzenia starszą kopią.
- Górne przyciski cofania i skróty w ramce telefonu korzystają z jednej historii.
- Zmiana trybu kontenera i reset usuwają style należące do poprzedniego trybu.
- Tabletowe nadpisania są poprawnie dziedziczone przez publiczny renderer telefonu.
- „Pełny nowy projekt” w wyborze szablonów zapisuje kopię i zmienia tylko szkic. Nie publikuje automatycznie. Biblioteka mediów i wzorce sekcji pozostają dostępne.
- Publikacja jawnie usuwa puste kolekcje z poprzedniej strony; przywracanie akceptuje normalizację pustych pól przez Firebase.
- Edycja nagłówka otwiera osobne okno i zachowuje wspólny panel właściwości.
- Publikacja i wersje czekają na zakończenie kolejki zapisu aktywnego widoku.

## Weryfikacja

Zestaw: **39 testów Playwright**. Dane Firebase, autoryzacja i Storage są
izolowane w fixture; testy nie zapisują nic w produkcyjnej bazie użytkownika.
Obejmują pełny start edytora, publikację i ponowne otwarcie strony,
historię, grupy, kontenery, telefon, kadrowanie wideo, bibliotekę, wersje,
sekcje wspólne, style, FAQ i wybór szablonu bez niezamierzonej publikacji.

Uruchomienie: `npm ci`, `npx playwright install chromium`, `npm test`.

## Granice tego wydania

- Nowa przestrzeń pracy dotyczy głównego edytora strony. Oddzielny panel portfolio i specjalistyczne okna korzystają z dotychczasowych modułów.
- Kontener tworzy się z elementów mających wspólnego rodzica. Nie dodano przeciągania warstw pomiędzy dowolnymi rodzicami.
- Wspólne sekcje są aktualizowane przyciskiem „Aktualizuj z zaznaczenia”; nie jest to edycja wzorca na żywo. Zapis sekcji utrwala wygląd DOM i nie przenosi dowolnych zewnętrznych skryptów.
- Miniatury starszych wersji bez zapisanego obrazu DOM pozostają opisowe. System zachowuje dotychczasowy limit 12 wersji.
- Foldery mediów są organizacją logiczną; informacja o użyciu obejmuje zapisane odwołania, nie historię usuniętych wersji. Upload jest ograniczony do 250 MB na plik.
- Opcje odtwarzania dotyczą plików video. Osadzenia YouTube/Vimeo nadal korzystają także z ustawień HERO/PRO i możliwości dostawcy.
- Walidator wskazuje problemy widoczne w aktualnie wybranym wariancie. Dla telefonu/tabletu należy wybrać ten wariant. Nie wykonano pełnej regresji wizualnej 101 szablonów × 3 urządzenia.
- Nie testowano rzeczywistych uprawnień Firebase ani wysyłania plików na konto użytkownika. Nie zmieniano danych produkcyjnych ani konfiguracji rozliczeń.
