# RAF.studio — kolekcja sześciu szablonów

Kolekcja działa w istniejącym edytorze RESPONSIVE 8.9.3. Przycisk SZABLONY udostępnia wyłącznie sześć poniższych projektów.

| Szablon | Referencja | Kompozycja |
| --- | --- | --- |
| SOP the DRONE | https://sopthedrone.com/ | Pełnoekranowe miasto, techniczny pasek zaufania, konsola usług, panoramiczny showreel i nieregularna mozaika. |
| BMBDRON | https://www.bmbdron.com/ | Krótki czarny nagłówek, szeroki showreel, ogromny tytuł produkcyjny, kwadratowa siatka filmów i techniczne listy. |
| Rolands Varsbergs | https://rolandsvarsbergs.com/ | Biały nagłówek autora, pełna szerokość fotografii, dużo światła i nieobramowana ściana dziewięciu zdjęć. |
| AK Film | https://akfilm.pl/ | Nawigacja na filmowym HERO, turkusowe sterowanie, trzy karty filmów i ślubna opowieść z podziałem ekranu. |
| The Honest Films | https://www.thehonestfilms.com/ | Analogowe pełnoekranowe otwarcie, wielki szeryfowy logotyp, kremowo-oliwkowy manifest i pionowe historie. |
| Charles Studio | https://charles-studio.pl/ | Rozjaśnione asymetryczne HERO, złoty monogram, nakładająca się typografia i luksusowy układ magazynowy. |

To adaptacje układów dla RAF.studio, z oryginalnymi tekstami demonstracyjnymi i wymiennymi zdjęciami. Nie zawierają ofert, opinii klientów ani tożsamości właścicieli stron referencyjnych. HERO obsługuje zdjęcie oraz własny film przez istniejący panel edytora.

## Obsługa

- Kliknij SZABLONY (6), wybierz projekt i otwórz pełny podgląd.
- Podgląd ma przełączniki PC / Tablet / Telefon i normalne przewijanie.
- „Użyj szablonu” wczytuje pełny dokument do wersji roboczej.
- „Układ + moje treści” zachowuje zapisane teksty i media, w tym HERO i kontakt, a nowe sekcje otrzymują przykładowe treści.
- Przed wczytaniem edytor próbuje zapisać `templateBackupLatest`. Jeżeli starsze reguły Firebase blokują tę ścieżkę, kopia trafia do pamięci sesji, a zapis właściwego szablonu nie jest blokowany.
- Właściwy `editorDraft` zapisuje się jako pierwszy i jest odczytywany kontrolnie przed przeładowaniem edytora. Dane dodatkowe zapisują się osobno i nie mogą cofnąć wybranego układu.
- Nowy draft zachowuje znacznik `basePublishedAt`, dzięki czemu moduł synchronizacji po restarcie edytora nie przywraca ponownie starej opublikowanej strony.
- Publikacja nadal odbywa się przez istniejący przycisk PUBLIKUJ. Wybranie szablonu nie zmienia publicznej wersji strony.

Podgląd i edytor korzystają z tego samego generatora dokumentu. Każdy tekst, obraz, przycisk i sekcja ma identyfikator istniejącego edytora. Stare szablony usunięto z biblioteki wyboru; moduł zgodności potrafi nadal wyświetlić zapisany wcześniej projekt, bez samoczynnej zmiany strony użytkownika.

## Media demonstracyjne

Wykorzystano istniejące zasoby RAF.studio i poniższe zdjęcia z Unsplash, zapisane lokalnie jako WebP:

- aerial-city.webp — https://images.unsplash.com/photo-1519501025264-65ba15a82390
- mountains.webp — https://images.unsplash.com/photo-1500534623283-312aade485b7
- wedding-table.webp — https://images.unsplash.com/photo-1511795409834-ef04bbd61622
- wedding-story.webp — https://images.unsplash.com/photo-1519741497674-611481863552
- camera.webp — https://images.unsplash.com/photo-1516035069371-29a1b244cc32

## Sprawdzenie

Na lokalnych danych testowych, z przechwyconym Firebase SDK, sprawdzono wszystkie sześć projektów: desktop 1440 px, telefon 390 px oraz uruchomienie i wybór elementu w edytorze. Sprawdzono dokładnie sześć pozycji w bibliotece, wyszukiwanie, odnośniki do sekcji, FAQ, zapis wyłącznie do draftu, kopię poprzedniego projektu i zachowanie po błędzie zapisu. Dodatkowo: publiczne odczyty zmienionych tekstów/mediów, zachowanie treści przy zmianie układu, przyciski na telefonie i zgodność zapisanych starszych projektów.
