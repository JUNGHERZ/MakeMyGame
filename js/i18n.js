/* ============================================
   i18n.js – Zweisprachigkeit DE / EN
   ============================================ */

const translations = {
  de: {
    // Header
    subtitle:              'BESCHREIBE DEINE IDEE · KI BAUT DEIN SPIEL',
    // Card
    cardTitle:             '💡 DEINE SPIELIDEE',
    helpTitle:             'Steuerung anzeigen',
    langToggleTitle:       'Sprache wechseln',
    // Textarea
    placeholder:           'Beschreibe dein Spiel...\nz.B. \'Eine Schlange die Äpfel frisst und immer länger wird\'',
    // Generate Button
    btnGenerate:           '🚀 SPIEL GENERIEREN',
    // Examples
    examplesTitle:         '📝 BEISPIELE',
    exSnake:               '🐍 Snake',
    exSpace:               '👾 Space Invaders',
    exBreakout:            '🧱 Breakout',
    exLabyrinth:           '🏰 Labyrinth',
    exPong:                '🏓 Pong vs CPU',
    exDino:                '🦖 Dino Runner',
    exSnakePrompt:         'Eine Schlange die Äpfel frisst und immer länger wird. Mit Wänden an denen man stirbt.',
    exSpacePrompt:         'Ein Raumschiff das von unten nach oben schießt. Aliens kommen von oben herunter. Wird immer schneller.',
    exBreakoutPrompt:      'Ein Ball der von einem Schläger am unteren Rand abprallt und Blöcke oben zerstört. Verschiedene Blockreihen.',
    exLabyrinthPrompt:     'Ein Labyrinth in dem man einen Punkt durch die Gänge steuert und Münzen einsammelt. Einfache zufällige Level.',
    exPongPrompt:          'Pong für einen Spieler gegen den Computer. Der Ball wird mit jedem Punkt schneller.',
    exDinoPrompt:          'Ein Dino der über Kakteen springt. Endloser Sidescroller der immer schneller wird. Wie das Chrome Dino Game.',
    // Settings
    btnSettings:           '⚙️ EIGENE API-KEYS VERWENDEN',
    btnSettingsActive:     '🔑 EIGENE API-KEYS (AKTIV)',
    btnSettingsServer:     '✅ SERVER-API AKTIV',
    btnSettingsNone:       '⚠️ KEINE API KONFIGURIERT',
    settingsTitle:         '⚙️ EIGENE API-KEYS',
    settingsDesc:          'Optional: Nutze deine eigenen API-Keys statt der Server-Konfiguration.',
    labelApiUrl:           'API URL (OpenAI-kompatibel)',
    labelApiKey:           'API KEY',
    labelModel:            'MODEL',
    btnSave:               '💾 SPEICHERN',
    // Game Actions
    btnShare:              '📋 TEILEN',
    btnRemix:              '🔄 REMIX',
    btnNew:                '✨ NEU',
    // Status messages
    statusSending:         'Erstelle Share-Link...',
    statusShared:          'Geteilt! 🎉',
    statusCopied:          '📋 Link in Zwischenablage!',
    statusCopyReady:       'Link bereit zum Kopieren!',
    statusShareFail:       'Teilen fehlgeschlagen: ',
    statusSaved:           'Einstellungen gespeichert!',
    statusNoApi:           'Bitte eigene API-Keys eingeben und speichern.',
    statusNoServer:        'Server-API nicht verfügbar. Eigene Keys aktivieren.',
    statusRemix:           '🔄 Remix-Modus: Beschreibe die Änderung und klicke Generieren.',
    // Help Modal
    helpModalTitle:        '🎮 STEUERUNG',
    helpKeyboard:          '⌨️ TASTATUR',
    helpTouch:             '👆 TOUCH / MAUS',
    helpTouchText:         'Alle Buttons auf dem Gameboy-Skin sind klick- und touchbar – D-Pad, A, B, Start und Select.',
    helpTips:              '💡 TIPPS',
    helpTipsText:          '• Drücke <strong>A</strong> um ein Spiel zu starten<br>• Bei Game Over: <strong>A</strong> für Neustart<br>• <strong>Start</strong> für Pause (wenn unterstützt)',
    helpDpad:              'D-Pad',
    helpDpadAlt:           'D-Pad (alternativ)',
    helpABtn:              'A-Button',
    helpBBtn:              'B-Button',
    helpStart:             'Start',
    helpSelect:            'Select',
    // Footer
    footerText:            'GAMEBOY GAME MAKER · POWERED BY AI · 2026 · ',
  },

  en: {
    // Header
    subtitle:              'DESCRIBE YOUR IDEA · AI BUILDS YOUR GAME',
    // Card
    cardTitle:             '💡 YOUR GAME IDEA',
    helpTitle:             'Show controls',
    langToggleTitle:       'Switch language',
    // Textarea
    placeholder:           'Describe your game...\ne.g. \'A snake that eats apples and grows longer\'',
    // Generate Button
    btnGenerate:           '🚀 GENERATE GAME',
    // Examples
    examplesTitle:         '📝 EXAMPLES',
    exSnake:               '🐍 Snake',
    exSpace:               '👾 Space Invaders',
    exBreakout:            '🧱 Breakout',
    exLabyrinth:           '🏰 Labyrinth',
    exPong:                '🏓 Pong vs CPU',
    exDino:                '🦖 Dino Runner',
    exSnakePrompt:         'A snake that eats apples and grows longer. Walls kill you.',
    exSpacePrompt:         'A spaceship shooting upward. Aliens descend from above. Gets faster over time.',
    exBreakoutPrompt:      'A ball bouncing off a paddle at the bottom, destroying blocks above. Multiple rows of blocks.',
    exLabyrinthPrompt:     'A maze where you guide a dot through corridors collecting coins. Simple random levels.',
    exPongPrompt:          'Pong for one player against the computer. The ball speeds up with each point.',
    exDinoPrompt:          'A dino jumping over cacti. Endless side-scroller that gets faster. Like the Chrome Dino Game.',
    // Settings
    btnSettings:           '⚙️ USE CUSTOM API KEYS',
    btnSettingsActive:     '🔑 CUSTOM API KEYS (ACTIVE)',
    btnSettingsServer:     '✅ SERVER API ACTIVE',
    btnSettingsNone:       '⚠️ NO API CONFIGURED',
    settingsTitle:         '⚙️ CUSTOM API KEYS',
    settingsDesc:          'Optional: Use your own API keys instead of the server configuration.',
    labelApiUrl:           'API URL (OpenAI-compatible)',
    labelApiKey:           'API KEY',
    labelModel:            'MODEL',
    btnSave:               '💾 SAVE',
    // Game Actions
    btnShare:              '📋 SHARE',
    btnRemix:              '🔄 REMIX',
    btnNew:                '✨ NEW',
    // Status messages
    statusSending:         'Creating share link...',
    statusShared:          'Shared! 🎉',
    statusCopied:          '📋 Link copied to clipboard!',
    statusCopyReady:       'Link ready to copy!',
    statusShareFail:       'Share failed: ',
    statusSaved:           'Settings saved!',
    statusNoApi:           'Please enter and save your API keys.',
    statusNoServer:        'Server API unavailable. Enable custom keys.',
    statusRemix:           '🔄 Remix mode: Describe the change and click Generate.',
    // Help Modal
    helpModalTitle:        '🎮 CONTROLS',
    helpKeyboard:          '⌨️ KEYBOARD',
    helpTouch:             '👆 TOUCH / MOUSE',
    helpTouchText:         'All buttons on the Gameboy skin are clickable and touchable – D-Pad, A, B, Start and Select.',
    helpTips:              '💡 TIPS',
    helpTipsText:          '• Press <strong>A</strong> to start a game<br>• On Game Over: <strong>A</strong> to restart<br>• <strong>Start</strong> to pause (if supported)',
    helpDpad:              'D-Pad',
    helpDpadAlt:           'D-Pad (alt)',
    helpABtn:              'A-Button',
    helpBBtn:              'B-Button',
    helpStart:             'Start',
    helpSelect:            'Select',
    // Footer
    footerText:            'GAMEBOY GAME MAKER · POWERED BY AI · 2026 · ',
  }
};

/* === Sprache erkennen === */
export function detectLang() {
  const saved = localStorage.getItem('gb-maker-lang');
  if (saved === 'de' || saved === 'en') return saved;
  const browser = (navigator.language || 'en').toLowerCase();
  return browser.startsWith('de') ? 'de' : 'en';
}

export function setLang(lang) {
  localStorage.setItem('gb-maker-lang', lang);
}

/* === Übersetzung abrufen === */
export function t(key) {
  const lang = detectLang();
  return translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
}
