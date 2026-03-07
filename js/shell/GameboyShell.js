/* ============================================
   GameboyShell.js – Gameboy UI Controller
   
   Verbindet die HTML-Shell mit der Engine,
   verwaltet States und UI-Updates.
   ============================================ */

import { GameEngine } from '../engine/GameEngine.js';
import { ScreenManager } from './ScreenManager.js';

export class GameboyShell {
  constructor(canvasElement, shellElement) {
    this.canvas = canvasElement;
    this.shell = shellElement;
    this.engine = new GameEngine(canvasElement);
    this.screenManager = new ScreenManager(this.engine);

    // State
    this._state = 'idle'; // idle | loading | playing | error
    this._currentGame = null;
    this._idleRafId = null;

    // LED
    this.led = this.shell.querySelector('.power-led');

    // Input an Shell-Buttons binden
    this.engine.input.bindShellButtons(this.shell);

    // B-Button als "Zurück" im Error-State
    this.engine.input.on('press', (btn) => {
      if (btn === 'b' && this._state === 'error') {
        this.showIdle();
      }
    });
  }

  /* === STATES === */

  async boot() {
    this._setLed(true);
    await this.screenManager.playBoot();
    this.showIdle();
  }

  showIdle() {
    this._state = 'idle';
    this.engine.stop();
    this._currentGame = null;
    this._startIdleAnimation();
  }

  showLoading(message) {
    this._state = 'loading';
    this._stopIdleAnimation();
    this.engine.stop();
    this._startLoadingAnimation(message);
  }

  showError(message) {
    this._state = 'error';
    this._stopIdleAnimation();
    this.engine.stop();
    this.engine.sound.error();
    this._startErrorAnimation(message);
  }

  loadGame(gameResult) {
    this._state = 'playing';
    this._stopIdleAnimation();
    this._currentGame = gameResult;
    this._setLed(true);

    try {
      this.engine.load(gameResult.gameDef);
      this.engine.sound.confirm();
    } catch (e) {
      this.showError('GAME CRASH: ' + e.message);
    }
  }

  /* === IDLE ANIMATION === */

  _startIdleAnimation() {
    this._stopIdleAnimation();
    const loop = () => {
      this.screenManager.drawIdle();
      this._idleRafId = requestAnimationFrame(loop);
    };
    loop();
  }

  _stopIdleAnimation() {
    if (this._idleRafId) {
      cancelAnimationFrame(this._idleRafId);
      this._idleRafId = null;
    }
  }

  /* === LOADING ANIMATION === */

  _startLoadingAnimation(message) {
    this._stopLoadingAnimation();
    const loop = () => {
      this.screenManager.drawLoading(message);
      this._loadingRafId = requestAnimationFrame(loop);
    };
    loop();
  }

  _stopLoadingAnimation() {
    if (this._loadingRafId) {
      cancelAnimationFrame(this._loadingRafId);
      this._loadingRafId = null;
    }
  }

  /* === ERROR ANIMATION === */

  _startErrorAnimation(message) {
    this._stopErrorAnimation();
    const loop = () => {
      this.screenManager.drawError(message);
      this._errorRafId = requestAnimationFrame(loop);
    };
    loop();
  }

  _stopErrorAnimation() {
    if (this._errorRafId) {
      cancelAnimationFrame(this._errorRafId);
      this._errorRafId = null;
    }
  }

  /* === LED === */

  _setLed(on) {
    if (this.led) {
      this.led.classList.toggle('on', on);
    }
  }

  /* === GETTERS === */

  get state()       { return this._state; }
  get currentGame() { return this._currentGame; }
  get isPlaying()   { return this._state === 'playing'; }
}
