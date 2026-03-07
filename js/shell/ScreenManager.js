/* ============================================
   ScreenManager.js – Verwaltet die Screens
   
   Boot-Animation, Menü-Screens, Game-Screen.
   ============================================ */

export class ScreenManager {
  constructor(engine) {
    this.engine = engine;
    this._currentScreen = null;
    this._bootComplete = false;
  }

  /* === BOOT SCREEN === */
  async playBoot() {
    return new Promise((resolve) => {
      const e = this.engine;
      let frame = 0;
      const totalFrames = 120; // ~2 Sekunden

      e.sound.boot();

      const bootLoop = () => {
        frame++;
        e.renderer.clear(0);

        if (frame < 30) {
          // Fade in
        } else if (frame < 90) {
          // Logo anzeigen
          e.renderer.textCenter('GAMEBOY', 50, 3, 8);
          e.renderer.textCenter('GAME MAKER', 65, 2, 6);
          
          // Kleiner Gameboy-Sprite
          const gb = [
            [-1,-1,3,3,3,3,-1,-1],
            [-1,3,0,0,0,0,3,-1],
            [-1,3,0,1,1,0,3,-1],
            [-1,3,0,1,1,0,3,-1],
            [-1,3,0,0,0,0,3,-1],
            [-1,-1,3,3,3,3,-1,-1],
            [-1,3,2,-1,-1,2,3,-1],
            [-1,3,3,3,3,3,3,-1],
          ];
          e.renderer.sprite(gb, 72, 25, 2);
        } else if (frame < totalFrames) {
          e.renderer.textCenter('GAMEBOY', 50, 3, 8);
          e.renderer.textCenter('GAME MAKER', 65, 2, 6);

          const gb = [
            [-1,-1,3,3,3,3,-1,-1],
            [-1,3,0,0,0,0,3,-1],
            [-1,3,0,1,1,0,3,-1],
            [-1,3,0,1,1,0,3,-1],
            [-1,3,0,0,0,0,3,-1],
            [-1,-1,3,3,3,3,-1,-1],
            [-1,3,2,-1,-1,2,3,-1],
            [-1,3,3,3,3,3,3,-1],
          ];
          e.renderer.sprite(gb, 72, 25, 2);

          // Blinkend: PRESS START
          if (Math.floor(frame / 15) % 2 === 0) {
            e.renderer.textCenter('PRESS START', 110, 2, 5);
          }
        }

        if (frame >= totalFrames) {
          this._bootComplete = true;
          resolve();
          return;
        }

        requestAnimationFrame(bootLoop);
      };

      bootLoop();
    });
  }

  /* === LOADING SCREEN === */
  drawLoading(message = 'LOADING...') {
    const e = this.engine;
    e.renderer.clear(0);
    
    // Loading-Animation
    const dots = '.'.repeat((Math.floor(Date.now() / 400) % 4));
    e.renderer.textCenter('GENERATING', 55, 3, 6);
    e.renderer.textCenter(`GAME${dots}`, 68, 2, 6);
    
    // Fortschrittsbalken
    const barW = 100;
    const barX = (160 - barW) / 2;
    const barY = 90;
    e.renderer.strokeRect(barX, barY, barW, 8, 3);
    
    const progress = (Math.sin(Date.now() / 300) + 1) / 2;
    e.renderer.rect(barX + 2, barY + 2, (barW - 4) * progress, 4, 2);

    if (message) {
      e.renderer.textCenter(message, 110, 2, 4);
    }
  }

  /* === ERROR SCREEN === */
  drawError(message = 'ERROR') {
    const e = this.engine;
    e.renderer.clear(0);
    e.renderer.textCenter('! ERROR !', 40, 3, 8);
    
    // Mehrzeilig umbrechen
    const words = message.split(' ');
    let line = '';
    let y = 65;
    words.forEach(word => {
      const test = line + word + ' ';
      if (test.length > 22) {
        e.renderer.textCenter(line.trim(), y, 2, 5);
        y += 10;
        line = word + ' ';
      } else {
        line = test;
      }
    });
    if (line.trim()) {
      e.renderer.textCenter(line.trim(), y, 2, 5);
    }

    if (Math.floor(Date.now() / 600) % 2 === 0) {
      e.renderer.textCenter('PRESS B TO GO BACK', 125, 2, 4);
    }
  }

  /* === IDLE SCREEN (kein Spiel geladen) === */
  drawIdle() {
    const e = this.engine;
    e.renderer.clear(0);

    const gb = [
      [-1,-1,3,3,3,3,-1,-1],
      [-1,3,0,0,0,0,3,-1],
      [-1,3,0,1,1,0,3,-1],
      [-1,3,0,1,1,0,3,-1],
      [-1,3,0,0,0,0,3,-1],
      [-1,-1,3,3,3,3,-1,-1],
      [-1,3,2,-1,-1,2,3,-1],
      [-1,3,3,3,3,3,3,-1],
    ];
    e.renderer.sprite(gb, 72, 20, 2);

    e.renderer.textCenter('GAME MAKER', 48, 3, 6);
    e.renderer.textCenter('READY', 62, 2, 5);
    
    const t = Date.now();
    if (Math.floor(t / 800) % 2 === 0) {
      e.renderer.textCenter('DESCRIBE YOUR', 90, 2, 5);
      e.renderer.textCenter('GAME IDEA', 102, 2, 5);
    } else {
      e.renderer.textCenter('AND PRESS', 90, 2, 5);
      e.renderer.textCenter('GENERATE', 102, 3, 5);
    }

    e.renderer.textCenter('v1.0', 132, 1, 4);
  }
}
