/* ============================================
   GameEngine.js – Mini-Engine für generierte Spiele
   
   Stellt eine einfache API bereit, die von
   KI-generiertem Code genutzt wird.
   Beinhaltet: Game Loop, Rendering, Input, Sound,
   Collision Detection, Score Management.
   ============================================ */

import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { Sound } from './Sound.js';

export class GameEngine {
  constructor(canvas) {
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.sound = new Sound();

    // Game Loop
    this._running = false;
    this._rafId = null;
    this._lastTime = 0;
    this._accumulator = 0;
    this._tickRate = 1000 / 60; // 60 FPS

    // Game Callbacks (vom generierten Spiel gesetzt)
    this._initFn = null;
    this._updateFn = null;
    this._drawFn = null;

    // Game State (für generierte Spiele zugänglich)
    this.state = {};
    this.score = 0;
    this.highScore = 0;
    this.gameOver = false;
    this.paused = false;

    // Entities (einfaches Entity-System)
    this.entities = [];

    // Screen-Dimensionen
    this.WIDTH = Renderer.WIDTH;
    this.HEIGHT = Renderer.HEIGHT;

    // Farben als Convenience
    this.COLORS = Renderer.COLORS;
  }

  /* === GAME LIFECYCLE === */

  /**
   * Spiel laden und starten.
   * @param {object} gameDef - { init, update, draw }
   */
  load(gameDef) {
    this.stop();
    this.reset();

    this._initFn = gameDef.init || null;
    this._updateFn = gameDef.update || null;
    this._drawFn = gameDef.draw || null;

    if (this._initFn) {
      this._initFn(this);
    }

    this.start();
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._loop(this._lastTime);
  }

  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  reset() {
    this.state = {};
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.entities = [];
    this.input.reset();
  }

  restart() {
    this.reset();
    if (this._initFn) {
      this._initFn(this);
    }
  }

  /* === GAME LOOP === */

  _loop(timestamp) {
    if (!this._running) return;

    const delta = timestamp - this._lastTime;
    this._lastTime = timestamp;

    if (!this.paused) {
      // Fixed timestep Update
      this._accumulator += delta;
      while (this._accumulator >= this._tickRate) {
        if (this._updateFn) {
          this._updateFn(this, this._tickRate / 1000);
        }
        this.input.endFrame();
        this._accumulator -= this._tickRate;
      }
    }

    // Draw
    if (this._drawFn) {
      this._drawFn(this, this.renderer);
    }

    this._rafId = requestAnimationFrame((t) => this._loop(t));
  }

  /* === CONVENIENCE API für generierte Spiele === */

  // --- Drawing Shortcuts ---
  clear(c)                    { this.renderer.clear(c); }
  drawRect(x, y, w, h, c)    { this.renderer.rect(x, y, w, h, c); }
  drawCircle(x, y, r, c)     { this.renderer.circle(x, y, r, c); }
  drawLine(x1, y1, x2, y2, c){ this.renderer.line(x1, y1, x2, y2, c); }
  drawText(s, x, y, c, sz)   { this.renderer.text(s, x, y, c, sz); }
  drawTextCenter(s, y, c, sz) { this.renderer.textCenter(s, y, c, sz); }
  drawSprite(d, x, y, s)     { this.renderer.sprite(d, x, y, s); }
  drawBorder(c)               { this.renderer.strokeRect(0, 0, this.WIDTH, this.HEIGHT, c); }
  drawPixel(x, y, c)         { this.renderer.pixel(x, y, c); }

  // --- Input Shortcuts ---
  btnUp()     { return this.input.state.up; }
  btnDown()   { return this.input.state.down; }
  btnLeft()   { return this.input.state.left; }
  btnRight()  { return this.input.state.right; }
  btnA()      { return this.input.state.a; }
  btnB()      { return this.input.state.b; }
  btnStart()  { return this.input.state.start; }
  btnSelect() { return this.input.state.select; }

  btnUpPressed()     { return this.input.justPressed('up'); }
  btnDownPressed()   { return this.input.justPressed('down'); }
  btnLeftPressed()   { return this.input.justPressed('left'); }
  btnRightPressed()  { return this.input.justPressed('right'); }
  btnAPressed()      { return this.input.justPressed('a'); }
  btnBPressed()      { return this.input.justPressed('b'); }
  btnStartPressed()  { return this.input.justPressed('start'); }
  btnSelectPressed() { return this.input.justPressed('select'); }

  // --- Collision Detection ---
  collideRect(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  collideCircle(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (a.r || 4) + (b.r || 4);
  }

  // --- Hilfsfunktionen ---
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // --- Score ---
  addScore(points = 1) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  setGameOver() {
    this.gameOver = true;
    this.sound.gameover();
  }

  // --- Sound Shortcuts ---
  playBeep()    { this.sound.beep(); }
  playScore()   { this.sound.score(); }
  playHit()     { this.sound.hit(); }
  playJump()    { this.sound.jump(); }
  playMove()    { this.sound.move(); }
  playConfirm() { this.sound.confirm(); }
  playTone(f,d,t) { this.sound.tone(f, d, t); }

  /* === ENTITY SYSTEM (einfach) === */

  addEntity(entity) {
    this.entities.push(entity);
    return entity;
  }

  removeEntity(entity) {
    this.entities = this.entities.filter(e => e !== entity);
  }

  clearEntities() {
    this.entities = [];
  }

  getEntitiesByTag(tag) {
    return this.entities.filter(e => e.tag === tag);
  }
}
