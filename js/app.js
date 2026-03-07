/* ============================================
   app.js – Haupteinstieg Gameboy Game Maker
   ============================================ */

import { GameboyShell }  from './shell/GameboyShell.js';
import { GameGenerator } from './ai/GameGenerator.js';
import { t, detectLang, setLang } from './i18n.js';

class App {
  constructor() {
    this.form               = document.getElementById('ideaForm');
    this.textarea           = document.getElementById('ideaInput');
    this.genreTagsContainer = document.getElementById('genreTags');
    this.btnGenerate        = document.getElementById('btnGenerate');
    this.statusBar          = document.getElementById('statusBar');
    this.statusText         = document.getElementById('statusText');
    this.statusSpinner      = document.getElementById('statusSpinner');
    this.gameActions        = document.getElementById('gameActions');
    this.settingsToggle     = document.getElementById('settingsToggle');
    this.settingsPanel      = document.getElementById('settingsPanel');
    this.customKeysFields   = document.getElementById('customKeysFields');
    this.customKeysKnob     = document.querySelector('.custom-keys-knob');

    this._progressWrap  = document.getElementById('progressWrap');
    this._progressBar   = document.getElementById('progressBar');
    this._progressLabel = document.getElementById('progressLabel');
    this._progressTimer = null;

    const canvas   = document.getElementById('gameboyCanvas');
    const shell    = document.querySelector('.gameboy');
    this.shell     = new GameboyShell(canvas, shell);

    this.generator = new GameGenerator({
      onStatusChange: (status, msg) => this._updateStatus(status, msg)
    });

    this._selectedGenre   = null;
    this._generating      = false;
    this._lastGameResult  = null;
    this._customKeysActive = false;
    this._remixMode       = false;

    this._init();
  }

  async _init() {
    this._initTheme();
    this._applyTranslations();

    // Server-Status prüfen
    const serverOk = await this.generator.checkServerStatus();

    // Custom-Keys State laden
    this._loadCustomKeysState();

    if (!serverOk && !this._customKeysActive) {
      this._setCustomKeysActive(true);
    }

    if (this._customKeysActive) {
      this._loadCustomSettings();
    }

    this._updateSettingsUI();
    this._bindEvents();
    await this.shell.boot();

    // Gespeichertes Spiel nach Reload wiederherstellen?
    const restored = this._restoreGameAfterReload();
    if (!restored) {
      await this._loadSharedGame();
    }
  }

  /* === THEME === */

  _initTheme() {
    const saved = localStorage.getItem('gb-maker-theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  _toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('gb-maker-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('gb-maker-theme', 'light');
    }
  }

  /* === I18N === */

  _applyTranslations() {
    const lang = detectLang();

    // <html lang="...">
    document.documentElement.setAttribute('lang', lang);

    // Sprach-Button: zeigt Flagge der ANDEREN Sprache (zum Wechseln)
    const flagDE = document.getElementById('flagDE');
    const flagGB = document.getElementById('flagGB');
    if (flagDE && flagGB) {
      // Zeige Flagge der Zielsprache (also die andere)
      flagDE.classList.toggle('active', lang === 'en'); // auf EN → zeige DE
      flagGB.classList.toggle('active', lang === 'de'); // auf DE → zeige GB
    }

    // data-i18n → textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

    // data-i18n-html → innerHTML (für <strong> etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = t(key);
    });

    // data-i18n-placeholder → placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });

    // data-i18n-title → title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = t(key);
    });

    // Beispiel-Items: prompt + label
    document.querySelectorAll('[data-i18n-prompt]').forEach(el => {
      const promptKey = el.getAttribute('data-i18n-prompt');
      const labelKey  = el.getAttribute('data-i18n-label');
      el.dataset.prompt = t(promptKey);
      if (labelKey) el.textContent = t(labelKey);
    });
  }

  _toggleLang() {
    const current = detectLang();
    const next    = current === 'de' ? 'en' : 'de';

    // Aktuelles Spiel retten, falls vorhanden
    if (this._lastGameResult) {
      try {
        sessionStorage.setItem('gb-restore-game', JSON.stringify(this._lastGameResult));
      } catch (e) {}
    }

    setLang(next);
    location.reload();
  }

  /* === SPIEL NACH RELOAD WIEDERHERSTELLEN === */

  _restoreGameAfterReload() {
    try {
      const raw = sessionStorage.getItem('gb-restore-game');
      if (!raw) return false;
      sessionStorage.removeItem('gb-restore-game');
      const result = JSON.parse(raw);
      if (!result?.gameDef || !result?.rawCode) return false;
      this._lastGameResult = result;
      this.shell.loadGame(result);
      this.gameActions.classList.remove('hidden');
      return true;
    } catch (e) {
      return false;
    }
  }

  /* === EVENTS === */

  _bindEvents() {
    // iPadOS Audio Unlock
    const audioUnlock = () => {
      this.shell.engine.sound.unlock();
      document.removeEventListener('touchstart', audioUnlock, true);
      document.removeEventListener('touchend',   audioUnlock, true);
      document.removeEventListener('click',      audioUnlock, true);
    };
    document.addEventListener('touchstart', audioUnlock, true);
    document.addEventListener('touchend',   audioUnlock, true);
    document.addEventListener('click',      audioUnlock, true);

    document.getElementById('themeToggle')?.addEventListener('click', () => this._toggleTheme());
    document.getElementById('btnLang')?.addEventListener('click', () => this._toggleLang());

    // Hilfe-Modal
    const helpModal = document.getElementById('helpModal');
    document.getElementById('btnHelp')?.addEventListener('click', () => {
      helpModal?.classList.remove('hidden');
    });
    document.getElementById('helpModalClose')?.addEventListener('click', () => {
      helpModal?.classList.add('hidden');
    });
    helpModal?.addEventListener('click', (e) => {
      if (e.target === helpModal) helpModal.classList.add('hidden');
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._generate();
    });

    this.genreTagsContainer.querySelectorAll('.genre-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const genre = tag.dataset.genre;
        if (this._selectedGenre === genre) {
          this._selectedGenre = null;
          tag.classList.remove('active');
        } else {
          this.genreTagsContainer.querySelectorAll('.genre-tag').forEach(t => t.classList.remove('active'));
          this._selectedGenre = genre;
          tag.classList.add('active');
        }
      });
    });

    document.querySelectorAll('.example-item').forEach(item => {
      item.addEventListener('click', () => {
        this.textarea.value = item.dataset.prompt;
        this.textarea.focus();
      });
    });

    this.settingsToggle?.addEventListener('click', () => {
      this.settingsPanel.classList.toggle('hidden');
    });

    document.getElementById('customKeysToggle')?.addEventListener('click', () => {
      this._setCustomKeysActive(!this._customKeysActive);
      this._updateSettingsUI();
    });

    document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
      this._saveCustomSettings();
    });

    document.getElementById('btnShare')?.addEventListener('click',   () => this._shareGame());
    document.getElementById('btnNewGame')?.addEventListener('click', () => {
      this.shell.showIdle();
      this.gameActions.classList.add('hidden');
      this._lastGameResult = null;
      this.textarea.value  = '';
      this.textarea.focus();
    });
    document.getElementById('btnRemix')?.addEventListener('click', () => this._remixGame());
  }

  /* === CUSTOM KEYS === */

  _setCustomKeysActive(val) {
    this._customKeysActive = val;
    this.generator.setUseCustomKeys(val);
    localStorage.setItem('gb-maker-custom-keys', val ? '1' : '0');
  }

  _loadCustomKeysState() {
    const saved = localStorage.getItem('gb-maker-custom-keys');
    if (saved === '1') {
      this._customKeysActive = true;
      this.generator.setUseCustomKeys(true);
    }
  }

  _updateSettingsUI() {
    if (this.customKeysKnob) {
      this.customKeysKnob.classList.toggle('active', this._customKeysActive);
    }
    if (this.customKeysFields) {
      this.customKeysFields.style.display = this._customKeysActive ? 'block' : 'none';
    }
    if (this.settingsToggle) {
      if (this._customKeysActive) {
        this.settingsToggle.textContent = t('btnSettingsActive');
      } else if (this.generator.serverKeysAvailable) {
        this.settingsToggle.textContent = t('btnSettingsServer');
      } else {
        this.settingsToggle.textContent = t('btnSettingsNone');
      }
    }
  }

  /* === PROGRESS BAR === */

  _startProgress(durationMs = 30000) {
    if (this._progressTimer) {
      clearTimeout(this._progressTimer);
      this._progressTimer = null;
    }
    const wrap  = this._progressWrap;
    const bar   = this._progressBar;
    const label = this._progressLabel;
    if (!wrap) return;

    wrap.classList.add('visible');
    bar.style.transition = 'none';
    bar.style.width      = '0%';
    label.textContent    = '0%';

    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const raw = Math.min(elapsed / durationMs, 1);
      const pct = Math.round(raw * 95);
      bar.style.transition = 'width 1s linear';
      bar.style.width      = pct + '%';
      label.textContent    = pct + '%';
      if (raw < 1) {
        this._progressTimer = setTimeout(tick, 1000);
      }
    };
    this._progressTimer = setTimeout(tick, 1000);
  }

  _stopProgress(success = true) {
    if (this._progressTimer) {
      clearTimeout(this._progressTimer);
      this._progressTimer = null;
    }
    const wrap  = this._progressWrap;
    const bar   = this._progressBar;
    const label = this._progressLabel;
    if (!wrap) return;

    if (success) {
      bar.style.transition = 'width 0.4s ease';
      bar.style.width      = '100%';
      label.textContent    = '100%';
      setTimeout(() => {
        wrap.classList.remove('visible');
        bar.style.transition = 'none';
        bar.style.width      = '0%';
        label.textContent    = '0%';
      }, 600);
    } else {
      wrap.classList.remove('visible');
      bar.style.transition = 'none';
      bar.style.width      = '0%';
      label.textContent    = '0%';
    }
  }

  /* === GENERATE === */

  async _generate() {
    const idea = this.textarea.value.trim();
    if (!idea || this._generating) return;

    if (!this.generator.isReady()) {
      this.settingsPanel.classList.remove('hidden');
      this._updateStatus('error', this._customKeysActive
        ? t('statusNoApi')
        : t('statusNoServer'));
      this._showStatus();
      return;
    }

    this._generating = true;
    this.btnGenerate.disabled = true;
    this.gameActions.classList.add('hidden');
    this._showStatus();
    this._startProgress(30000);
    this.shell.showLoading();

    try {
      const existingCode = this._remixMode ? this._lastGameResult?.rawCode : null;
      const result = await this.generator.generate(idea, this._selectedGenre, existingCode);
      this._lastGameResult = result;
      this._stopProgress(true);
      this.shell.loadGame(result);
      this.gameActions.classList.remove('hidden');
      this._remixMode = false;
      setTimeout(() => this._hideStatus(), 2000);
    } catch (error) {
      console.error('Generation Error:', error);
      this._stopProgress(false);
      this.shell.showError(error.message.substring(0, 80));
    } finally {
      this._generating  = false;
      this._remixMode   = false;
      this.btnGenerate.disabled = false;
    }
  }

  /* === SHARE === */

  _hashCode(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash  = (hash * 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  async _shareGame() {
    if (!this._lastGameResult) return;

    this._updateStatus('sending', t('statusSending'));
    this._showStatus();

    try {
      const codeHash = this._hashCode(this._lastGameResult.rawCode);
      const resp = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea:  this._lastGameResult.idea,
          genre: this._lastGameResult.genre,
          code:  this._lastGameResult.rawCode,
          hash:  codeHash,
          ts:    this._lastGameResult.timestamp
        })
      });

      if (!resp.ok) throw new Error('Save failed');

      const data     = await resp.json();
      const shareUrl = window.location.origin + window.location.pathname + '?game=' + data.id;
      const shareTitle = 'Make My Game – makemygame.app';
      const shareText  = '🎮 ' + (this._lastGameResult.idea || 'Retro Game') + ' – ' + shareUrl;

      // 1) Native Share API (iOS/Android)
      if (navigator.share) {
        try {
          await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
          this._updateStatus('ready', t('statusShared'));
          setTimeout(() => this._hideStatus(), 3000);
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') { this._hideStatus(); return; }
        }
      }

      // 2) Clipboard API (Desktop)
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        this._updateStatus('ready', t('statusCopied'));
      } else {
        prompt('', shareUrl);
        this._updateStatus('ready', t('statusCopyReady'));
      }
      setTimeout(() => this._hideStatus(), 4000);

    } catch (e) {
      this._updateStatus('error', t('statusShareFail') + e.message);
      setTimeout(() => this._hideStatus(), 3000);
    }
  }

  /* === REMIX === */

  _remixGame() {
    if (!this._lastGameResult) return;
    this._remixMode     = true;
    this.textarea.value = this._lastGameResult.idea + '\n\n' +
      (detectLang() === 'de' ? 'Ändere: ' : 'Change: ');
    this.textarea.focus();
    this.textarea.setSelectionRange(this.textarea.value.length, this.textarea.value.length);
    this._updateStatus('ready', t('statusRemix'));
    this._showStatus();
  }

  /* === SHARED GAME LADEN === */

  async _loadSharedGame() {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    if (!gameId) return false;

    try {
      const resp = await fetch('/api/games/' + encodeURIComponent(gameId));
      if (!resp.ok) throw new Error('Game not found');

      const gameData = await resp.json();
      this.textarea.value = gameData.idea || '';

      const gameDef = this.generator._parseGameCode(gameData.code);
      const { validateGameCode } = await import('./ai/CodeValidator.js');
      const validation = validateGameCode(gameDef);

      if (validation.valid) {
        this._lastGameResult = {
          gameDef,
          rawCode:   gameData.code,
          idea:      gameData.idea,
          genre:     gameData.genre,
          timestamp: gameData.ts
        };
        this.shell.loadGame(this._lastGameResult);
        this.gameActions.classList.remove('hidden');
        window.history.replaceState({}, '', window.location.pathname);
        return true;
      }
    } catch (e) {
      console.warn('Shared game could not be loaded:', e);
    }
    return false;
  }

  /* === CUSTOM SETTINGS === */

  _loadCustomSettings() {
    try {
      const saved = localStorage.getItem('gb-maker-custom-settings');
      if (saved) {
        const s = JSON.parse(saved);
        this.generator.configureCustom(s.apiUrl, s.apiKey, s.model);
        const u = document.getElementById('apiUrl');
        const k = document.getElementById('apiKey');
        const m = document.getElementById('apiModel');
        if (u) u.value = s.apiUrl  || '';
        if (k) k.value = s.apiKey  || '';
        if (m) m.value = s.model   || 'gpt-4o-mini';
      }
    } catch (e) {}
  }

  _saveCustomSettings() {
    const apiUrl = document.getElementById('apiUrl')?.value.trim();
    const apiKey = document.getElementById('apiKey')?.value.trim();
    const model  = document.getElementById('apiModel')?.value.trim() || 'gpt-4o-mini';
    this.generator.configureCustom(apiUrl, apiKey, model);
    try {
      localStorage.setItem('gb-maker-custom-settings', JSON.stringify({ apiUrl, apiKey, model }));
    } catch (e) {}
    this._updateStatus('ready', t('statusSaved'));
    this._showStatus();
    setTimeout(() => this._hideStatus(), 2000);
  }

  /* === STATUS === */

  _updateStatus(status, message) {
    this.statusText.textContent = message;
    this.statusBar.classList.remove('error', 'hidden');
    this.statusSpinner.classList.toggle('hidden', status === 'error' || status === 'ready');
    if (status === 'error') this.statusBar.classList.add('error');
  }

  _showStatus() { this.statusBar.classList.remove('hidden'); }
  _hideStatus() { this.statusBar.classList.add('hidden'); }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
