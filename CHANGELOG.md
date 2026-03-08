# Changelog

Alle relevanten Änderungen an diesem Projekt werden hier dokumentiert.
Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [1.0.1] – 2026-03-07

### Fixed
- Token-Limit (`max_completion_tokens: 4096`) entfernt – komplexe Spiele wurden abgeschnitten und führten zu „Code-Parsing fehlgeschlagen"-Fehlern

---

## [1.0.0] – 2026-03-07 🎉 Initial Release

### Added
- 🎮 Gameboy-Skin (grüner LCD-Screen, 4-Farben-Palette, 160×144px, responsive)
- 🧠 KI-Spielgenerierung – Spielidee in natürlicher Sprache → spielbares Retro-Game
- 🕹️ Vollständige Game Engine (Canvas, 60 FPS Game Loop, Entity-System)
- ⌨️ Keyboard & Touch-Input (D-Pad, A/B, Start, Select)
- 🔀 Remix-Modus – bestehende Spiele per KI gezielt verändern
- 🔗 Share-System – Spiele speichern & per Kurz-URL teilen (SHA256-Deduplizierung)
- 📊 plays-Counter pro gespeichertem Spiel
- 🌍 Mehrsprachigkeit – UI automatisch auf DE oder EN je nach Browser-Sprache
- 🌙 Dark/Light Mode Toggle mit localStorage-Speicherung
- 🔑 Flexibles API-System – Server-Keys (Default) oder eigene API-Keys
- 🐳 Dockerfile + requirements.txt für containerisiertes Deployment
- 🚀 EasyPanel-Deployment mit Auto-Deploy via GitHub Webhook
- 📄 MIT License
