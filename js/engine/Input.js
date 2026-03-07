/* ============================================
   Input.js – Gameboy Button → Event System
   
   Mappt physische Buttons + Tastatur auf
   ein einheitliches Event-System.
   ============================================ */

export class Input {
  constructor() {
    // Aktueller State aller Buttons
    this.state = {
      up: false,
      down: false,
      left: false,
      right: false,
      a: false,
      b: false,
      start: false,
      select: false
    };

    // Für "just pressed" Detection
    this._prev = { ...this.state };

    // Event-Listener
    this._listeners = {};

    // Keyboard Mapping
    this._keyMap = {
      'ArrowUp':    'up',
      'ArrowDown':  'down',
      'ArrowLeft':  'left',
      'ArrowRight': 'right',
      'w': 'up',   'W': 'up',
      's': 'down',  'S': 'down',
      'a': 'left',  'A': 'left',
      'd': 'right', 'D': 'right',
      'j': 'a',     'J': 'a',     'x': 'a',  'X': 'a',
      'k': 'b',     'K': 'b',     'z': 'b',  'Z': 'b',  'y': 'b', 'Y': 'b',
      'Enter': 'start',
      'Shift': 'select'
    };

    this._initKeyboard();
  }

  /* --- Keyboard Events --- */
  /* Prüft ob ein Eingabefeld fokussiert ist */
  _isTyping() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  _initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (this._isTyping()) return;
      const btn = this._keyMap[e.key];
      if (btn) {
        e.preventDefault();
        this.press(btn);
      }
    });

    document.addEventListener('keyup', (e) => {
      if (this._isTyping()) return;
      const btn = this._keyMap[e.key];
      if (btn) {
        e.preventDefault();
        this.release(btn);
      }
    });
  }

  /* --- Shell Buttons anbinden --- */
  bindShellButtons(shell) {
    const buttonMap = {
      'dpad-up':    'up',
      'dpad-down':  'down',
      'dpad-left':  'left',
      'dpad-right': 'right',
      'btn-a':      'a',
      'btn-b':      'b',
      'btn-start':  'start',
      'btn-select': 'select'
    };

    Object.entries(buttonMap).forEach(([id, btn]) => {
      const el = shell.querySelector(`[data-btn="${id}"]`);
      if (!el) return;

      // Pointer Events für Touch + Maus
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.press(btn);
      });
      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        this.release(btn);
      });
      el.addEventListener('pointerleave', (e) => {
        this.release(btn);
      });
    });
  }

  /* --- Button State --- */
  press(btn) {
    if (!this.state[btn]) {
      this.state[btn] = true;
      this._emit('press', btn);
    }
  }

  release(btn) {
    if (this.state[btn]) {
      this.state[btn] = false;
      this._emit('release', btn);
    }
  }

  /* "Wurde gerade gedrückt?" (einmal pro Frame) */
  justPressed(btn) {
    return this.state[btn] && !this._prev[btn];
  }

  /* Am Ende jedes Frames aufrufen */
  endFrame() {
    this._prev = { ...this.state };
  }

  /* --- Events --- */
  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  _emit(event, btn) {
    const listeners = this._listeners[event] || [];
    listeners.forEach(cb => cb(btn));
  }

  /* --- Reset --- */
  reset() {
    Object.keys(this.state).forEach(k => {
      this.state[k] = false;
      this._prev[k] = false;
    });
  }
}
