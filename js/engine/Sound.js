/* ============================================
   Sound.js – 8-Bit Sound Effects

   Web Audio API basierte Retro-Sounds
   für den Gameboy Game Maker.

   iPadOS Fix: AudioContext darf erst nach
   einer echten User-Interaktion erstellt werden.
   ============================================ */

export class Sound {
  constructor() {
    this._ctx     = null;
    this._enabled = true;
    this._volume  = 0.15;
    this._queue   = []; // Sounds die vor dem Unlock ankamen
  }

  /* ------------------------------------------------
     AudioContext erst beim ersten User-Event anlegen.
     Auf iPadOS MUSS createContext + resume im selben
     synchronen Call-Stack wie das User-Event passieren.
  ------------------------------------------------ */
  _ensureCtx() {
    if (!this._ctx) return null; // noch nicht entsperrt
    return this._ctx;
  }

  /* Wird von außen aufgerufen (z.B. aus app.js) beim ersten
     echten Touch/Click – oder intern beim ersten tone()-Aufruf
     nach Unlock. */
  unlock() {
    if (this._ctx) return; // bereits entsperrt

    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Stiller 1-Sample-Buffer: entsperrt iPadOS AudioContext
      const buf = this._ctx.createBuffer(1, 1, 22050);
      const src = this._ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this._ctx.destination);
      src.start(0);

      this._ctx.resume().then(() => {
        // Warteschlange abspielen
        const q = this._queue.splice(0);
        q.forEach(fn => fn());
      });
    } catch (e) {
      // Web Audio nicht verfügbar
    }
  }

  /* --- Basis-Ton spielen --- */
  tone(freq = 440, duration = 0.1, type = 'square') {
    if (!this._enabled) return;

    const play = () => {
      const ctx = this._ensureCtx();
      if (!ctx || ctx.state === 'suspended') return;
      try {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = this._volume;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) { /* ignorieren */ }
    };

    if (!this._ctx || this._ctx.state === 'suspended') {
      // Noch nicht entsperrt – in Queue legen (max. 5 Einträge)
      if (this._queue.length < 5) this._queue.push(play);
    } else {
      play();
    }
  }

  /* --- Vordefinierte Sounds --- */
  beep()    { this.tone(880, 0.08, 'square'); }
  select()  { this.tone(660, 0.06, 'square'); }
  confirm() { this.tone(880, 0.05, 'square'); setTimeout(() => this.tone(1100, 0.08, 'square'), 60); }
  error()   { this.tone(220, 0.15, 'sawtooth'); }
  score()   { this.tone(660, 0.06); setTimeout(() => this.tone(880, 0.06), 70); setTimeout(() => this.tone(1100, 0.1), 140); }
  gameover(){ this.tone(440, 0.1); setTimeout(() => this.tone(330, 0.1), 120); setTimeout(() => this.tone(220, 0.2), 240); }
  move()    { this.tone(440, 0.03, 'square'); }
  hit()     { this.tone(200, 0.08, 'sawtooth'); }
  jump()    {
    const play = () => {
      const ctx = this._ensureCtx();
      if (!ctx || ctx.state === 'suspended') return;
      try {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.value = this._volume;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) { /* ignorieren */ }
    };
    if (!this._ctx || this._ctx.state === 'suspended') {
      if (this._queue.length < 5) this._queue.push(play);
    } else {
      play();
    }
  }

  /* Boot-Sound */
  boot() {
    this.tone(262, 0.12, 'square');
    setTimeout(() => this.tone(330, 0.12, 'square'), 130);
    setTimeout(() => this.tone(392, 0.12, 'square'), 260);
    setTimeout(() => this.tone(523, 0.2,  'square'), 390);
  }

  /* --- Steuerung --- */
  enable()     { this._enabled = true; }
  disable()    { this._enabled = false; }
  toggle()     { this._enabled = !this._enabled; return this._enabled; }
  setVolume(v) { this._volume = Math.max(0, Math.min(1, v)); }
}
