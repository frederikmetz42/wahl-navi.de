# Changelog

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
