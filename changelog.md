# Changelog

## v4.9.2 — 2026-03-02
### Analytics, Ads, Bugfixes
- GoatCounter: Privacy-freundliche Besucherzählung (keine Cookies, kein Tracking, GDPR-konform)
- Google Ads: Week-1-Analyse ausgewertet, 4 Keywords pausiert, 3 Negatives hinzugefügt, Zeitplan + Budget optimiert
- Fix: Weitermachen landete auf Wahl-Info statt Quiz-Frage (wn_step speichert nur noch Schritte 1–25)
- Fix: Antwort-Vorauswahl entfernt (ring-2 Highlight konnte als Nudging wahrgenommen werden)

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
