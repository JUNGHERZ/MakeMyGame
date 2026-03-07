# 🎮 MakeMyGame

[![Live Demo](https://img.shields.io/badge/Live%20Demo-makemygame.app-9bbc0f?style=flat-square&logo=googlechrome&logoColor=white)](https://makemygame.app)
[![MIT License](https://img.shields.io/badge/License-MIT-9bbc0f?style=flat-square)](https://github.com/JUNGHERZ/MakeMyGame/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/JUNGHERZ/MakeMyGame?style=flat-square&color=9bbc0f)](https://github.com/JUNGHERZ/MakeMyGame/stargazers)
[![Python](https://img.shields.io/badge/Python-3.12-9bbc0f?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)

> Beschreibe eine Spielidee – die KI baut es dir als spielbares Retro-Game im Gameboy-Stil.

**MakeMyGame** ist eine Web-App, bei der du eine Spielidee in natürlicher Sprache eingibst und eine KI daraus ein spielbares Spiel generiert – im klassischen Gameboy-Look (grüner LCD-Screen, 4-Farben-Palette, 160×144px).

---

## ✨ Features

- 🧠 **KI-Spielgenerierung** – Spielidee eingeben, fertig spielbares Game erhalten
- 🎮 **Gameboy-Skin** – authentischer Retro-Look, responsive für alle Bildschirmgrößen
- 🕹️ **Vollständige Game Engine** – Canvas, 60 FPS Game Loop, Entity-System, Sound
- ⌨️ **Keyboard & Touch** – D-Pad, A/B, Start, Select (Tastatur + Touch-Buttons)
- 🔀 **Remix-Modus** – bestehende Spiele durch KI gezielt verändern lassen
- 🔗 **Share-System** – Spiele speichern & per Kurz-URL teilen
- 🌙 **Dark/Light Mode** – Toggle mit localStorage-Speicherung
- 🔑 **Flexibles API-System** – Server-Keys (Default) oder eigene API-Keys

---

## 🚀 Demo

**[makemygame.app](https://makemygame.app)**

---

## 🗂️ Projektstruktur

```
gameboy-maker/
├── .env                    ← API_URL, API_KEY, API_MODEL (nicht im Repo)
├── Dockerfile              ← Container-Build (python:3.12-slim)
├── requirements.txt        ← Python-Dependencies
├── server.py               ← aiohttp Server (Static Files + API)
├── index.html              ← Landing Page
├── css/
│   ├── shared.css          ← CSS-Variablen, Dark/Light Mode
│   ├── gameboy.css         ← Gameboy-Skin (responsive)
│   └── landing.css         ← Layout, Modal, Examples-Grid
├── js/
│   ├── app.js              ← Hauptlogik, UI, Share, Remix
│   ├── engine/
│   │   ├── GameEngine.js   ← Game Loop, Entity-System, API
│   │   ├── Renderer.js     ← Canvas 160×144, 4-Farben-Palette
│   │   ├── Input.js        ← Keyboard + Touch → Button-Events
│   │   └── Sound.js        ← Web Audio API, 8-Bit Sounds
│   ├── ai/
│   │   ├── GameGenerator.js    ← API-Call, Parsing
│   │   ├── CodeValidator.js    ← Sicherheits-Check
│   │   └── promptTemplates.js  ← System-Prompt, Genre-Hints
│   └── shell/
│       ├── GameboyShell.js     ← Boot, Idle, Loading, Error
│       └── ScreenManager.js    ← Canvas-Screen-States
└── shared_games/           ← Gespeicherte Spiele (nicht im Repo)
```

---

## 🛠️ Setup & Start

### Lokal (Python)

**Voraussetzungen:** Python 3.10+

```bash
pip install -r requirements.txt
```

`.env` anlegen:

```env
API_URL=https://router.eu.requesty.ai/v1/chat/completions
API_KEY=dein-api-key
API_MODEL=anthropic/claude-sonnet-4-6
```

Server starten:

```bash
python3 server.py
```

Die App läuft dann auf `http://localhost:8777`.

### Docker

```bash
docker build -t makemygame .
docker run -p 8777:8777 --env-file .env makemygame
```

### EasyPanel

- Build-Methode: **Dockerfile**
- Port: `8777`
- Umgebungsvariablen: `API_URL`, `API_KEY`, `API_MODEL` in EasyPanel hinterlegen
- Volume: `shared_games/` als persistentes Volume mounten

---

## 🎮 Tastatur-Belegung

| Aktion | Tasten |
|---|---|
| D-Pad | Pfeiltasten oder WASD |
| A-Button | X, J, Leertaste |
| B-Button | Z, Y, K |
| Start | Enter |
| Select | Shift |

---

## 🔌 API-Routes

| Method | Route | Funktion |
|---|---|---|
| GET | `/api/status` | Server-Key-Status prüfen |
| POST | `/api/generate` | KI-Anfrage (Server-Keys) |
| POST | `/api/proxy` | KI-Anfrage (Client-Keys) |
| POST | `/api/games` | Spiel speichern |
| GET | `/api/games/{id}` | Spiel laden |

---

## 📌 Geplante Erweiterungen

- [ ] Community-Galerie (gespeicherte Spiele durchstöbern)
- [ ] Top-Spiele nach plays-Counter
- [ ] Export als standalone HTML
- [ ] Nutzer-Accounts & eigene Sammlungen

---

## 📄 Lizenz

MIT
