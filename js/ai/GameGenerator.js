/* ============================================
   GameGenerator.js – KI-Integration
   
   Zwei Modi:
   1. Server-Keys (/api/generate) – Default
   2. Custom-Keys (/api/proxy) – Optional
   ============================================ */

import { SYSTEM_PROMPT, buildPrompt } from './promptTemplates.js';
import { validateGameCode } from './CodeValidator.js';

export class GameGenerator {
  constructor(config = {}) {
    // Custom API Settings (optional)
    this.apiUrl = config.apiUrl || '';
    this.apiKey = config.apiKey || '';
    this.model  = config.model || '';

    // Modi
    this.useCustomKeys = false;
    this.serverKeysAvailable = false;
    this.serverModel = '';

    // Callbacks
    this.onStatusChange = config.onStatusChange || (() => {});
  }

  /**
   * Prüft beim Start ob Server-Keys verfügbar sind.
   */
  async checkServerStatus() {
    try {
      const resp = await fetch('/api/status');
      const data = await resp.json();
      this.serverKeysAvailable = data.serverKeysAvailable || false;
      this.serverModel = data.model || '';
      return this.serverKeysAvailable;
    } catch {
      this.serverKeysAvailable = false;
      return false;
    }
  }

  configureCustom(apiUrl, apiKey, model) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    if (model) this.model = model;
  }

  setUseCustomKeys(val) {
    this.useCustomKeys = val;
  }

  isReady() {
    if (this.useCustomKeys) {
      return !!(this.apiUrl && this.apiKey);
    }
    return this.serverKeysAvailable;
  }

  /**
   * Generiert ein Spiel basierend auf der User-Idee.
   */
  async generate(idea, genre = null, existingCode = null) {
    if (!this.isReady()) {
      if (this.useCustomKeys) {
        throw new Error('Bitte eigene API-URL und Key eingeben.');
      } else {
        throw new Error('Server-API nicht verfügbar. Bitte eigene Keys verwenden.');
      }
    }

    this.onStatusChange('sending', existingCode ? 'Remixe Spiel...' : 'Sende Anfrage an KI...');

    const userPrompt = buildPrompt(idea, genre, existingCode);
    const model = this.useCustomKeys
      ? (this.model || 'gpt-4o-mini')
      : this.serverModel;

    const payload = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    };

    try {
      let response;

      if (this.useCustomKeys) {
        // Client-Keys über Proxy
        response = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiUrl: this.apiUrl,
            apiKey: this.apiKey,
            payload
          })
        });
      } else {
        // Server-Keys
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload })
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        let errMsg;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error?.message || errJson.error || errText;
        } catch {
          errMsg = errText;
        }
        throw new Error(`API Fehler (${response.status}): ${errMsg}`);
      }

      this.onStatusChange('parsing', 'Analysiere Antwort...');
      const data = await response.json();

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Keine Antwort von der KI erhalten.');
      }

      this.onStatusChange('validating', 'Validiere Spielcode...');
      const gameDef = this._parseGameCode(content);

      const validation = validateGameCode(gameDef);
      if (!validation.valid) {
        throw new Error(`Ungültiger Spielcode: ${validation.errors.join(', ')}`);
      }

      this.onStatusChange('ready', 'Spiel bereit!');
      return {
        gameDef,
        rawCode: content,
        idea,
        genre,
        timestamp: Date.now()
      };

    } catch (error) {
      this.onStatusChange('error', error.message);
      throw error;
    }
  }

  /**
   * Parst den KI-generierten Code zu einem Game-Definition-Objekt.
   */
  _parseGameCode(rawCode) {
    let code = rawCode.trim();

    // Markdown-Fences entfernen (auch mehrfach verschachtelt)
    code = code.replace(/^```(?:javascript|js)?\s*\n?/gi, '');
    code = code.replace(/\n?```\s*$/gi, '');
    code = code.trim();

    // Falls die KI Text vor/nach dem Objekt schreibt:
    // Suche das äußerste { ... } Paar mit init/update/draw
    const objMatch = code.match(/\{[\s\S]*init\s*:\s*function[\s\S]*update\s*:\s*function[\s\S]*draw\s*:\s*function[\s\S]*\}/);
    if (objMatch) {
      code = objMatch[0];
    }

    // Variable-Deklarationen entfernen
    code = code.replace(/^(?:const|let|var)\s+\w+\s*=\s*/, '');
    // export entfernen
    code = code.replace(/^export\s+default\s+/, '');
    // Trailing semicolon
    code = code.replace(/;\s*$/, '');

    // Versuch 1: Direkt als Ausdruck
    try {
      const fn = new Function(`"use strict"; return (${code});`);
      return fn();
    } catch (e) {
      // Versuch 2: Als IIFE
      try {
        const fn = new Function(`"use strict"; return (function() { return ${code}; })();`);
        return fn();
      } catch (e2) {
        // Versuch 3: Objekt-Extraktion mit Klammer-Balancing
        try {
          const start = code.indexOf('{');
          if (start >= 0) {
            let depth = 0;
            let end = -1;
            for (let i = start; i < code.length; i++) {
              if (code[i] === '{') depth++;
              if (code[i] === '}') depth--;
              if (depth === 0) { end = i + 1; break; }
            }
            if (end > start) {
              const extracted = code.substring(start, end);
              const fn = new Function(`"use strict"; return (${extracted});`);
              return fn();
            }
          }
        } catch (e3) {
          // Alle Versuche gescheitert
        }
        throw new Error(`Code-Parsing fehlgeschlagen: ${e.message}`);
      }
    }
  }
}
