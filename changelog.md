# Changelog

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
