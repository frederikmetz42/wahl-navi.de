# Changelog

## v4.20e - 2026-03-16 - Ergebnis-Transparenz
- **Added:** Tendenz-Verhältnis (z.B. 45:55) neben Textlabel im Ergebnis + Share-Text
- **Added:** Richtungspfeile pro Kano-Thema im Breakdown (→ Krause / → Reiter / → beide)
- **Changed:** Issue-Log um v4.20e-Einträge und Rückkanal-Spalte erweitert

## v4.20d - 2026-03-15 - Kano-Asymmetrie-Fix + Krause-Digital
- **Fixed:** Kano negQ: 6 von 8 negQ um "auch wenn"-Trade-off ergänzt (Verkehr, Klima, Amtserfahrung komplett neu; Wohnen, Sicherheit, Kultur ergänzt)
- **Fixed:** Amtserfahrung posQ: Trade-off "Seilschaften" ergänzt (vorher nur positiv)
- **Fixed:** Krause-Digitalisierung: "—" → "Digitales Bürgerkonto, Open Source, digitale Souveränität" im Programm-Tab
- **Added:** Kano-Randomisierung: Fisher-Yates-Shuffle (kanoOrder) + pos/neg-Flip (kanoFlip) pro Thema
- **Changed:** Kano-Farben: grün/rot → neutral (stone-50/stone-200), Labels "Wenn umgesetzt:" / "Wenn nicht umgesetzt:"
- **Added:** 8 Kano posQ mit Trade-off-Formulierungen ("auch wenn..."-Klauseln)
- **Research:** 3 Parallel-Studien zu Kano-Asymmetrie (Audit, Wähler-Simulation, Reformulierung)

## v4.20b - 2026-03-14 - Bugfixes + Impressum + Quellenbereinigung
- **Fixed:** Mobile Pill-Overflow: `white-space: nowrap` aus `.pq-pill` entfernt, lange Labels wrappen jetzt korrekt
- **Fixed:** Share-Image Footer: light gray bar → dark stone-800 Banner (passend zur Homepage-Nav)
- **Changed:** Impressum: Adresse Ridlerstr. 29f → Ridlerstr. 9
- **Removed:** München-O-Mat Thesenbuch aus methodik-check.html Quellen-Sektion
- **Discovered:** Google Ads EU-weit geblockt (Political Ads Ban seit Okt 2025), Kampagnendaten gesichert

## v4.20 - 2026-03-13 - Kano 3×3 + Neutralität + Verständlichkeit
- **Changed:** Kano von 5×5 auf 3×3 Matrix (L-Kategorie entfällt), 5 Emoji-Buttons → 3 Klartext-Buttons (Freut mich / Egal / Stört mich)
- **Changed:** Kano-Labels vereinfacht: Muss sein → Erwarte ich, Unklar → Passt nicht zusammen
- **Changed:** Topic-Attribution rebalanciert: 3 Krause / 3 Reiter / 2 both (war 5/2/1)
- **Changed:** Bilanz-Texte neutralisiert (editorialisierende Sprache entfernt)
- **Changed:** 12+ Fachbegriffe durch Alltagssprache ersetzt (SEM Nord, Radentscheid, Geothermie, Klimaneutral erklärt)
- **Changed:** Bilanz-Button "Keiner" → "Weiß nicht", Ergebnis-Erklärung vereinfacht
- **Added:** Sticky-Navbar mit Logo + Burger-Menü, Footer, floating "Jetzt starten" CTA
- **Added:** Prioritäten-Profil (2×2 Quadrant: Passt & wichtig / Achtung / Bonus / Egal) ersetzt Cityscape
- **Added:** Bilanz-Legende (🟢 Umgesetzt · 🟡 Teilweise · 🔴 Nicht umgesetzt)
- **Added:** Optional Chaining für Alpine.js Template-Expressions (kanoTopics[kanoQ]?.)
- **Removed:** Cityscape-Visualisierung (CSS + HTML + cityVal() Methode)
- **Removed:** L-Explainer aus allen 8 Kano-Topics

## v4.19 - 2026-03-13 - Unified Stichwahl-Guide als Homepage
- **Added:** `index.html` — Unified 4-step Stichwahl-Wizard (Kandidaten-Profil → Bilanz-Check → München-Check → Ergebnis) als Homepage
- **Added:** `kommunalwahl.html` — 25-Thesen-Quiz (Kopie des alten index.html) unter eigener URL
- **Added:** Tab-basiertes Step 1: Person | Kontroversen | Programm (expandierbare Timelines, stacked Themen-Vergleich)
- **Added:** VS-Grafik (Reiter rot vs. Krause grün) auf Guide-Intro
- **Added:** PayPal-Spendenbox auf Ergebnisseite
- **Added:** Footer-Links (25-Thesen-Quiz, Methodik, Impressum, Datenschutz) auf Intro + Ergebnis
- **Changed:** `stichwahl.html` → Redirect auf index.html (meta-refresh)
- **Changed:** `methodik.html` — Stichwahl-Sektion auf einen Guide-Link reduziert, Kano-Methodik ergänzt
- **Changed:** `methodik-check.html` — stichwahl4-Links → index.html
- **Removed:** stichwahl1-6.html + stichwahl-guide.html aus git (lokal behalten via .gitignore)

## v4.18 - 2026-03-12 - Workshop-Umsetzung: Playlist + Merges + Scoring-Fix
- **Added:** `stichwahl.html` — Playlist-Landingpage (4 Schritte + optionaler Simulator + "Jetzt starten" CTA)
- **Added:** `stichwahl1.html` — Deine Wahl (verschoben von stichwahl.html)
- **Changed:** `stichwahl6.html` — Bilanz-Check als 5. Tab integriert (ehemals stichwahl2), Deep-linking via URL-Hash
- **Changed:** `stichwahl3.html` — Scoring: Cosine Similarity → Weighted Difference (5-95% statt 88-96% Spread)
- **Changed:** Alle Stichwahl-Seiten: Sequenzielle Navigation ("Nächster Schritt: X →") statt flache "Weitere Tools"-Listen
- **Changed:** `stichwahl2.html` → Redirect auf stichwahl6#bilanz-check (meta-refresh)
- **Changed:** `stichwahl4.html` → Redirect auf stichwahl5 (meta-refresh)

## v4.17 - 2026-03-12 - München-Check + Kandidaten-Profil + Design Workshop
### München-Check (stichwahl5)
- **Added:** `stichwahl5.html` — Kano + Cityscape Fusion: 8 Münchner Themen als Kano-Dualfragen, kombiniert mit Stadtpostkarten-Visualisierung. Überholt stichwahl4 vollständig.
### Kandidaten-Profil (stichwahl6)
- **Added:** `stichwahl6.html` — 4-Tab-Profil beider OB-Kandidaten: Person, Bilanz, Kontroversen, Programm. Höchstes Trust-Rating im Voter-Panel.
- **Changed:** Subtle Party Colours: SPD rot, Grüne grün statt generisches Indigo/Teal über alle Stichwahl-Tools
### Research & Feedback
- **Added:** `_internal/feedback/reddit-2026-03-11-stichwahl.md` — Reddit-Feedback zu Stichwahl-Tools archiviert
- **Added:** `_internal/feedback/design-workshop-2026-03-12.md` — Design Thinking Workshop (3 Panels, 2 Runden): Konsolidierungsplan für 6 Stichwahl-Tools, Kill-Liste (stichwahl4 entfernen, stichwahl2 in stichwahl6 integrieren), Playlist-Startseite geplant

## v4.16 - 2026-03-11 - Prioritäten-Check + Methodik + Budget-Redesign
### Prioritäten-Check (stichwahl4)
- **Added:** `stichwahl4.html` — Kano-Dualfragen-Tool: 8 Münchner Themen, positive+negative Fragestellung, 5x5-Klassifikationsmatrix (Begeisterung/Leistung/Basis/Indifferent/Rückweisung/Fraglich)
- **Added:** Kandidaten-Attribution: 5 Themen Krause-nah, 2 Themen Reiter-nah, 1 geteilt
- **Added:** Per-Kano-Kategorie Erklärungstexte pro Thema
- **Added:** Reddit-AMA-Positionen eingebaut (50K Wohnungen, Ausbau vor Gratisticket, Backstage-Sicherung)
- **Fixed:** Share-Text: benennt jetzt stärkeren Kandidaten + gemeinsame Themen statt Kano-Kategorien-Zählung
### Methodik-Check (methodik-check)
- **Added:** `methodik-check.html` — Transparenzseite für Prioritäten-Check: Kano-Asymmetrie-Erklärung (Anna/Clara-Beispiel), 5x5-Matrix farbkodiert, Themen-Attributionstabelle mit Quellen, Krause-Tilt-Transparenz (5 von 8)
### Dein München 2032 (stichwahl3)
- **Changed:** v2.0 Redesign: 5-Screen-Flow → 3-Screen Live-Instrument (Intro → Instrument → Teilen)
- **Changed:** Auto-Redistribution → manueller Budget-Counter mit Remaining-Points und Over-Allocation-Cap
- **Changed:** Live-Match-Balken aktualisieren sich beim Schieben (kein separater Reveal-Screen)
### Research
- **Changed:** Research-Dateien in Unterordner reorganisiert: `stichwahl2/research/`, `stichwahl3/research/`, `research/panel/`, `research/thesen/`

## v4.15 - 2026-03-11 - Stichwahl-Links + Em-Dash Purge
- **Added:** Stichwahl-Links auf index.html (Startseite, Ergebnisseite, Hamburger-Nav) und methodik.html
- **Fixed:** Em dashes in allen HTML-Dateien durch Kommas/Doppelpunkte/Bindestriche ersetzt

## v4.14 - 2026-03-11 - Fairness-Audit + Nudge-Fix
### Bilanz-Check (stichwahl2)
- **Added:** 2 grüne Erfolgskarten: Bildungsbauoffensive (9,4 Mrd EUR), Ökostrom/Geothermie
- **Added:** Corona-/Energiekrisen-Kontext in Intro + Ergebnis-Note
- **Changed:** 6→8 Karten (3 rot, 3 gelb, 2 grün), Scoring + Archetyp-Schwellen angepasst
- **Changed:** Krause-Scrutiny geschärft: "Finanzierung offen" (Wohnen), "Mobilitätsreferat-Verantwortung" (Tram)
- **Fixed:** Nudging-Bug: Vote-Button-Highlight bleibt nicht mehr für nächste Karte stehen
- **Removed:** Schock-Karte (roter Rahmen + "Größte Lücke" Banner auf Radentscheid)
### Deine Wahl (stichwahl)
- **Changed:** Q1 "Verwaltung vs Vision" → "Erfahrung vs Aufbruch" (neutralere Formulierung)
### Dein München 2032 (stichwahl3)
- **Changed:** Kandidatenvektoren: Reiter Mobilität 12→15, Kultur 16→13; Krause Sicherheit 10→13, Kultur 12→9
### Research
- **Added:** `_internal/stichwahl3/fairness-audit.md` — Fairness-Bewertung aller 3 Tools
- **Added:** `_internal/stichwahl3/research-reiter-full-record.md` — Vollständige Reiter-Bilanz
- **Added:** `_internal/stichwahl3/research-krause-full-record.md` — Vollständige Krause-Bilanz
- **Added:** `_internal/stichwahl3/research-missing-sources.md` — Ungenutzte Datenquellen

## v4.13 — 2026-03-11 — Bilanz-Check + Dein München 2032
### Bilanz-Check (stichwahl2)
- **Changed:** Redesigned from blind dilemma to sourced Koalitionsvertrag-Audit
- **Added:** 6 Versprechen mit Traffic-Light-Status (rot/gelb), Kandidatenpositionen mit Quellen
- **Added:** Schock-Karte (Radentscheid: 4,4% von 1,6 Mrd umgesetzt)
- **Added:** 4 Wählertyp-Archetypen (Wechselwähler/Pragmatiker/Skeptiker/Abwägende)
- **Added:** Koalitions-Neutralitätsframing ("Beide tragen Verantwortung")
### Dein München 2032 (stichwahl3)
- **Added:** `stichwahl3.html` — Budget-Simulator (100 Punkte auf 6 Themen)
- **Added:** CSS-Stadtpostkarte (Gebäude, Bäume, Tram, Laternen, Wifi)
- **Added:** Cosine-Similarity-Kandidaten-Match (Indigo/Teal, randomisierte Reihenfolge)
- **Added:** 5-Screen-Flow (Intro → Slider → Postkarte → Match → Teilen)
### Research
- **Added:** `_internal/stichwahl2/research-*.md` — Öffentliche Daten, Mobilität, Head-to-Head
- **Added:** `_internal/stichwahl3/workshop-concepts.md` — 3 Konzepte, Scoring-Matrix
- **Added:** `_internal/stichwahl3/design-directions.md` — 3 Designrichtungen

## v4.12 — 2026-03-10 — Stichwahl-Tool "Deine Wahl" v3
- **Added:** `stichwahl.html` — Standalone Stichwahl-Entscheidungshilfe für OB-Stichwahl Reiter (SPD) vs Krause (Grüne)
- **Added:** Star-any topic selection (1-5 Themen statt forced pick-2)
- **Added:** 3 orthogonale Führungsstil-Fragen (Verwaltung/Vision, Kompromiss/Kante, Bürgernähe/Großprojekte)
- **Added:** Swipe-Cards für Fragen (CSS-only, Touch + Mouse, Tap-Fallback)
- **Added:** 8 Persönlichkeits-Archetypen ("Münchens Kompass", "Münchens Antrieb", etc.)
- **Added:** "Wusstest du?"-Factoids auf allen Vergleichskarten
- **Added:** Results-Reflow: Archetyp-Reveal → Einigkeit (18/25) → Unterschiede → Tendenz als Punchline
- **Added:** Shareable Archetyp-Text ("Münchens Kompass. Tendenz: Krause. Was bist du?")
- **Added:** Design-Workshop-Dokumentation in `_internal/stichwahl/workshop-notes.md`
- **Changed:** Tailwind rebuilt für neue Utility-Klassen

## v4.11.1 — 2026-03-07 — Instagram-Visuals + Grüne T1 Tunnel-Korrektur
- **Added:** 10 Instagram-Feed-Karten (1080x1350) mit reusable HTML-Template (`_internal/screenshots/instagram/`)
- **Fixed:** Grüne T1 Zitat: "klimaschädliche Autotunnel" → Tram-Nordtangente-Argument (Tunnel enthält 2 Tramgleise, ist kein reiner Autotunnel)
- **Changed:** T1 Background: Tram-Komponente, Baumfällungen (578-900), oberirdische Alternative ergänzt
- **Fixed:** database.json Drift: T1 Statement noch "Milliarden" (seit v4.9.12 "hohe Baukosten"), Grüne T1 Zitat synchronisiert

## v4.11 — 2026-03-07 — Reddit-Feedback + Countdown + Marktexpansion
### Daten-Fixes (Reddit-Feedback)
- **Fixed:** Die Linke T9 (Wachstumsbremse) von val=1 auf val=0 (neutral). Zitat kritisiert investorengetriebenes Wachstum, fordert aber keine aktive Wachstumsbremse.
- **Fixed:** T8 Statement "früher GWG" → "früher GWG/GEWOFAG" (Münchner Wohnen = Fusion beider Unternehmen)
### Countdown-UX
- **Added:** 3 emotionale Countdown-States: "Morgen ist Wahl!" (1 Tag), "Heute wird gewählt!" (Wahltag), "Noch X Tage" (>1 Tag)
- **Changed:** Emoji-Unterstützung an 3 Stellen (Intro-Text, Election-Day-Banner, Ergebnisseite)
### Marktexpansion + Media-Pitch (intern)
- **Added:** `_internal/cockpit.html` Expansion Tab: Weltweite Gap-Matrix, Revenue-Szenarien, Strategie
- **Added:** `_internal/outreach/media-pitch.md` — Pitch-Template für Lokalredaktionen
- **Added:** `_internal/research/vaa-market-research.md` — 30+ Länder VAA-Analyse (456 Zeilen)
- **Changed:** Cockpit Ads/GoatCounter-Zahlen aktualisiert (5.840 Klicks, 5.823 GC, €541 Spend)

## v4.10 — 2026-03-06 — Schnellcheck-Prototyp + SEO-Audit
### Schnellcheck (Either-Or MVP)
- **Added:** `schnellcheck.html` — Standalone 8-Fragen-Quiz im binären "A oder B?"-Format
- **Added:** `schnellcheck.js` — Quizlogik mit Scoring gegen 14 Parteien, A/B-Randomisierung
- **Added:** Farbkodierte Optionskarten (Teal vs. Amber) mit Tradeoff-Labels (z.B. "Sparsamkeit" vs. "Investition")
- **Added:** "Beides wichtig"-Escape mit halbem Gewicht
- **Added:** Ergebnisseite mit Top-Match-Hero und sortiertem Balkendiagramm
### SEO-Audit + Performance
- **Fixed:** Render-blocking `wahlomat_data.js` (68KB) von `<head>` ans Body-Ende verschoben
- **Fixed:** Falsches Wahldatum in FAQ-Schema + Noscript ("9. März" → "8. März")
- **Added:** Font-Preloads für Inter woff2 (400 + 700)
- **Added:** OG-Image + Twitter-Card Meta auf allen öffentlichen Seiten
- **Added:** `noindex` auf `embed.html` (Duplicate-Content-Schutz)
- **Added:** Noscript-Fallback für `schnellcheck.html`
- **Changed:** Sitemap bereinigt: embed.html + schnellcheck.html entfernt, lastmod aktualisiert
- **Added:** `_internal/faq-draft.md` — 10 FAQ-Entwürfe für JSON-LD (Review ausstehend)

## v4.9.14 — 2026-03-05
### SEO-Optimierung + Outreach
- Title + Description: "Kommunalwahl München 2026" als Keyword vorne eingefügt
- FAQPage structured data: 3 Fragen (Parteien, Was ist MUCwahl, Wahldatum) für Rich Snippets
- Noscript-Content: alle 14 Parteien namentlich, Wahldatum, alle Kategorien
- Sitemap: lastmod aktualisiert, embed.html ergänzt, changefreq → daily, in Search Console neu eingereicht
- Twitter-Meta (title/description/image) entfernt (OG-Fallback reicht)
- Outreach-Tracker erstellt: `_internal/outreach/outreach-tracker.md` (12 Kontakte)
- Landeszentrale: Absage → Reply → Sekretärin fragt nach Nummer (Status CALL)

## v4.9.13 — 2026-03-04
### Schwache Thesen ersetzen + Gewerbesteuer-Reframe (Pre-Flight Check)
- T26 Kostenlose Krippe → **Kitaplatz-Vergabe** (Spread 14, Balance 0.75, 0 Neutrals). Quelle: München-O-Mat T36. Überraschende Splits: Grüne FOR (Bedarfsprinzip), SPD AGAINST (Alleinerziehende benachteiligt).
- T28 Kostenloses Schulessen → **Übernachtungsabgabe** (Spread 14, Balance 0.40, 0 Neutrals). Quelle: München-O-Mat T71. Dokumentierter Stadtratsbeschluss 2023.
- T15 Gewerbesteuer: Reframe "senken" → "erhöhen" (Spread 5→14, Strength 4.0→10.9, 0 Neutrals). Quelle: München-O-Mat T69. "Senken" produzierte Neutrals, "erhöhen" erzwingt Positionierung.
- Alte T26/T28 in _internal/archiv-geloeschte-thesen.md archiviert
- Pre-Flight-Check als HARD-Kriterien in _internal/editorial-rules.md dokumentiert: Spread≥7, Neutrals≤6, Balance≥0.4, Stärke≥5.0
- 3 verbleibende Thesen unter HARD-Schwelle: T7 Wohnungs-Rückkauf, T21 Videoüberwachung, T1 Straßentunnel

## v4.9.12 — 2026-03-04
### Schwache Thesen ersetzen + Klausel-Fixes
- 3 Thesen gelöscht wegen mangelnder Differenzierung: T3 Schulen/Kita (9×Neutral, 0×Dagegen), T6 Sozialtarif (9×Neutral, 6 generische Zitate), T17 Digitale Verwaltung (nur 1 Partei dagegen)
- 3 neue Thesen mit höherer Differenzierung: T26 Kostenlose Krippe (Spread 5), T27 Deutsch in Kitas (Spread 10, perfekte 5:5-Teilung), T28 Kostenloses Schulessen (Spread 6)
- 42 neue Partei-Positionen (14 Parteien × 3 Thesen)
- T1 Straßentunnel: "dies Milliarden kostet" → "dies hohe Baukosten verursacht" (Fear-Word entfernt)
- T14 Klima-Vorrang: "deutlich teurer werden" → "teurer werden" (Intensifier entfernt)
- Gelöschte Thesen mit allen Positionen in _internal/archiv-geloeschte-thesen.md archiviert
- Kategorieverteilung unverändert: Mobilität 4, Wohnen 4, Bauen 4, Wirtschaft 6, Gesellschaft 7

## v4.9.11 — 2026-03-04
### Tradeoff-Klauseln entschärfen + T3/T6 ersetzen
- 13 "auch wenn"-Klauseln entschärft: Nein-Bias, Angst-Trigger und Sympathie-Gruppen neutralisiert (T1, T2, T5, T7, T10, T11, T13, T19, T20, T21, T22, T23, T24)
- T3 Parkplätze → Schulen & Kita (Ganztagsschulen + Kita-Plätze Vorrang, Kategorie: Gesellschaft)
- T6 Radwege → Sozialtarif Energie (SWM Sozialtarif für Strom/Fernwärme, Kategorie: Wirtschaft)
- 28 neue Partei-Positionen für beide ersetzten Thesen (14 Parteien × 2 Thesen)
- Die PARTEI T6: val 1 (Sozialtarif-Antrag als Fraktion mit Die Linke im Stadtrat)
- Kategorieverteilung: Mobilität 6→4, Wirtschaft 5→6, Gesellschaft 6→7

## v4.9.10 — 2026-03-04
### CSU-Korrektur Drogenkonsumräume
- CSU T22 Drogenkonsumräume: val -1→1, neues Zitat (CSU-Stadtratsfraktion + OB-Kandidat Baumgärtner fordern Modellversuch, Quelle: t-online 19.02.2026)

## v4.9.9 — 2026-03-03
### Reddit-Feedback + SPD-Direktfeedback
- SPD T12 Hochhäuser: val 0→1, neues Zitat (SPD-Direktfeedback: Ja mit Bedingung bezahlbares Wohnen)
- SPD T23 Ordnung: val 0→-1 (SPD-Direktfeedback: Nein)
- SPD T5 ÖPNV-Preise: val 1→0 (SPD-Direktfeedback: neutral; Zitat betrifft nur Kinderfahrkarten)
- Volt T16 Sparkurs: val -1→0 (Reddit: Zitat schützt nur Investitionen, nicht Gesamtausgaben)
- SPD T17 + Grüne T17 Digitale Verwaltung: bewusst bei val 0 belassen (beide wollen digital + persönlich; val -1 wäre irreführend anti-digital)

## v4.9.8 — 2026-03-03
### Reddit-Feedback
- Kompass: Hinweis ergänzt, dass Kompass-Nähe und Prozent-Rangliste verschiedene Dinge messen
- Background-Texte: 5 asymmetrische Parteiennennungen neutralisiert (T4, T12, T19, T21, T22)
- 6 Positionen umkodiert (val 1→0): CSU T15, Grüne T7, Volt T22, München-Liste T24, SPD T7, SPD T10 ("prüfen"/"vorbereiten"/"gezielt" ≠ Zustimmung)
- Methodik-Seite: Limitation der "auch wenn"-Klauseln ehrlich dokumentiert (Framing-Bias durch Preiswahl)
- 7 fehlende "auch wenn"-Klauseln ergänzt: T2, T10, T11, T14, T19, T22, T23 (jetzt 25/25)

## v4.9.7 — 2026-03-03
### Datenlücken + Polish
- Bayernpartei: 12 fehlende Thesen ergänzt (T1, T3, T5, T7, T8, T10, T11, T12, T13, T14, T15, T22), jetzt alle 25 Thesen abgedeckt
- Bündnis Kultur: `partial`-Flag + "unvollständig"-Badge in Ergebnis-Liste und Modal (kein Wahlprogramm veröffentlicht, nur 5 Thesen)
- 4 leere Zitate ergänzt: SPD T20 (Gendersprache), Die PARTEI T2 (Autofreie Altstadt), Rosa Liste T20 (Gendersprache), München-Liste T24 (Bezahlkarte)
- Share-Sheet: Focus-Trap für Tab-Navigation (gleiche Logik wie Modal)
- trapFocus() generisch umgebaut (nutzt event.currentTarget statt hardcoded Modal-ID)
- Surprise-Card: Emoji-Lightbulb durch Canvas-Stern ersetzt (plattformunabhängig)
- embed.html: Version 4.3 → 4.9.7

## v4.9.6 — 2026-03-02
### Cockpit: Google Ads Day-by-Day
- Cockpit: Colour-coded Day-by-Day Performance table (5 Tage, Feb 26 - Mar 2)
- CTR/CPC farbcodiert (grün/gelb/rot nach Schwellenwerten)
- Spend-Balken proportional zum Tagesbudget (€30)
- Mar 1 hervorgehoben: 3.5x Budget Badge (€104.60), Gradient-Bar
- Legende mit Schwellenwerten + Budget-Referenz

## v4.9.5 — 2026-03-02
### Methodik-Seite + Grüne-Outreach
- T20 (Gendersprache): Neues Statement "geschlechtergerechte Sprache nutzen, auch wenn nicht den amtlichen Rechtschreibregeln entspricht" + Background (Bayern-Verbot, München gendert weiter)
- Methodik-Seite: Zustimmungs-Balance (~11:10:4 progressiv:konservativ:ambivalent) dokumentiert
- Methodik-Seite: KI-gestützte Delphi-Panels mit simulierten Wählerprofilen als Validierungsmethode ergänzt
- Methodik-Seite: Polarity Flips korrigiert (veraltete "3 Flips, 15:8" entfernt)
- Methodik-Seite: "Auch wenn"-Klauseln als eigene Neutralitätsmethode dokumentiert
- Google Sheet "MUCwahl – Grüne Positionen" erstellt und öffentlich geteilt

## v4.9.4 — 2026-03-02
### Neutralitäts-Überarbeitung
- 7 Thesen reformuliert für bessere Neutralität (T3, T7, T12, T18, T20, T23, T24)
- T3 (Parkplätze) + T18 (Gewerbeflächen): Polarity komplett geflippt, alle 9 Party-Vals invertiert
- T18 mit Recherche-Daten unterlegt (1,9 Mio. m² Leerstand, 8,5% Quote, Werksviertel/Domagkpark)
- T20 (Gendersprache): Neues Statement mit "auch wenn"-Klausel + Background-Text
- T23 (Ordnung): False Binary "statt" → Priority-Kontrast "stärker... als"
- T24 (Bezahlkarte): Konkreter, weniger verfassungsrechtlich
- T12 (Hochhäuser): Klargestellt Büro-/Hotelhochhäuser (nicht Wohnblöcke)
- T7 (Wohnungs-Rückkauf): "Milliarden" entfernt, Sprache neutraler
- "Auch wenn"-Klauseln: 11 → 18 von 25 Thesen
- Polaritätsbalance: ~11:10:4 (progressiv:konservativ:ambivalent)
- Tradeoff-Labels aktualisiert, beide Datendateien synchronisiert

## v4.9.3 — 2026-03-02
### Ordnung
- Root-Folder aufgeräumt: Images → `assets/`, Alpine.js → `vendor/`, Build-Tools → `_build/` (gitignored)
- Alle HTML-Referenzen aktualisiert (favicon, icon, og-image, alpine.min.js)
- Build-Kommando: `npx tailwindcss@3 -i _build/input.css -o styles.css --minify --config _build/tailwind.config.js`
- `research-wirtschaft-thesen.md` → `_internal/`
- 226 verwaiste QA-Screenshots (21.9MB) aus Vault-Root gelöscht

## v4.9.2 — 2026-03-02
### Analytics, Ads, Bugfixes
- GoatCounter: Privacy-freundliche Besucherzählung (keine Cookies, kein Tracking, GDPR-konform)
- Google Ads: Week-1-Analyse ausgewertet, 4 Keywords pausiert, 3 Negatives hinzugefügt, Zeitplan + Budget optimiert
- Fix: Weitermachen landete auf Wahl-Info statt Quiz-Frage (wn_step speichert nur noch Schritte 1–25)
- Fix: Antwort-Nudging eliminiert — Focus-Ring, sticky Hover (Mobile Safari), Alpine `:class`-Bindings entfernt (`focus:ring-0`, `@media (hover: hover)`, `blur()` nach Antwort)

## v4.9.1 — 2026-03-01
### Feedback, Impressum, OG-Image
- Inline-Feedback: Ja/Teilweise/Nein Pill-Buttons nach Ergebnis, pre-fillen Google Form
- Exit-Intent: Desktop Slide-in nach 15s, einmalig, localStorage-persistent
- Impressum: E-Mail + Adresse per JS obfusziert (Anti-Scraper, DOM-Assembly)
- OG-Image komplett neu: hell, Logo + Orange/Blau Branding, "Welche Partei passt zu dir?", 76px Headline, 420px Kompass

## v4.9 — 2026-03-01
### Share UX Overhaul
- Fragment-Encoding: Share-URLs nutzen `#r=` statt `?r=` (Privacy, Fragment nie an Server gesendet). Alte `?r=`-Links funktionieren weiterhin.
- Animierter Ergebnis-Reveal: Celebration-Pulse auf Prozent-Ring, Parteifarb-Akzent auf Hero-Card, verzögerter "Ergebnis teilen" CTA (respektiert `prefers-reduced-motion`)
- 4 neue Share-Karten: Story (1080x1920), Top-Match-Card (1080x1080), Radar-Card (1080x1080), Surprise-Card (1080x1080)
- Share-Sheet Bottom-Sheet: Format-Toggle (Feed 4:5 / Story 9:16), Karten-Auswahl, zentrales Share-Interface
- WhatsApp/Telegram/X Direct-Share-Buttons im Share-Sheet
- `_shareCanvas()` Helper: ~30 Zeilen Duplikation aus bestehenden 3 Share-Funktionen eliminiert
- Mini-Share-Buttons (Radar/Kompass) öffnen jetzt Share-Sheet mit Vorauswahl

## v4.8 — 2026-03-01
### Thesen-Swap: Wirtschaft & Sicherheit
- 6 schwache Thesen entfernt (Klimaneutralität, Isar, Übernachtungssteuer, Gasteig, Queere Projekte, Wiesn)
- 6 neue Thesen: Sparkurs, Digitale Verwaltung, Gewerbeflächen, Referate abschaffen, Ordnung im öffentlichen Raum, Integrationskosten
- Kategorien von 7 auf 5 konsolidiert (Digitalisierung + Kultur aufgelöst)
- 84 neue Partei-Positionen für neue Thesen
- T7 (Wohnungs-Rückkauf) umformuliert: Immobilienkonzerne statt "private Wohnungsbestände", positiv gepollt
- Thesen-Reihenfolge durchgemischt: nie gleiche Kategorie hintereinander, thematisch ähnliche weit auseinander
- Polaritätsbalance verschoben: ~14:9 (progressiv:konservativ) → ~10:13
- "Auch wenn"-Klauseln: 9→11
- Internal docs aktualisiert (PROJECT_SPEC, cockpit, Analyse-Dokument)

## v4.7 — 2026-02-27
### Vergleich-Tab, Offene Karten, Korrekturen
- Neuer Vergleich-Tab: These-für-These Vergleich mit Partei-Zitaten
- Offene Karten Seite (methodik.html) überarbeitet
- Solarpflicht (T13) Polarity-Flip: jetzt "soll abgeschafft werden"
- LGBTQ+ Formulierung gekürzt
- ueber-uns.html Redirect auf methodik.html

## v4.6 — 2026-02-24
### Stimmzettel & Wahltag-Modus
- Stimmzettel-Seite (Step 97) mit Wahllokal-Finder
- Wahltag-Countdown-Badge (≤30 Tage)
- Personalisiertes Share-Image (Canvas 1080×1350)
- Milestone-Toasts mit Themen

## v4.5 — 2026-02-20
### Budget-Gewichtung & 2-Tab-Ergebnis
- 10-Punkte Budget-Gewichtung (ersetzt 1x/2x Toggle)
- 2-Tab Ergebnis: Kompass + Parteien
- Surprise-Match Amber Card
- Compass Power-Compression + Collision-Avoidance
