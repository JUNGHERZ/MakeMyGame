/* ============================================
   Renderer.js – Gameboy LCD Renderer
   
   Canvas-basiertes Rendering in der
   Original-Gameboy-4-Farben-Palette.
   ============================================ */

export class Renderer {
  // Gameboy Originalauflösung: 160×144
  static WIDTH  = 160;
  static HEIGHT = 144;

  // 4-Farben-Palette (Original DMG)
  static PALETTE = {
    lightest: '#9bab3f',
    light:    '#7b8b1f',
    dark:     '#3a5a1a',
    darkest:  '#1a2a00'
  };

  // Numerischer Zugriff (0-3)
  static COLORS = [
    '#9bab3f',  // 0 = lightest
    '#7b8b1f',  // 1 = light
    '#3a5a1a',  // 2 = dark
    '#1a2a00'   // 3 = darkest
  ];

  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.width = Renderer.WIDTH;
    this.canvas.height = Renderer.HEIGHT;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Standard-Font
    this._fontSize = 8;
    this._fontFamily = 'monospace';
  }

  /* --- Bildschirm leeren --- */
  clear(colorIndex = 0) {
    this.ctx.fillStyle = Renderer.COLORS[colorIndex] || Renderer.COLORS[0];
    this.ctx.fillRect(0, 0, Renderer.WIDTH, Renderer.HEIGHT);
  }

  /* --- Pixel setzen --- */
  pixel(x, y, colorIndex = 3) {
    this.ctx.fillStyle = Renderer.COLORS[colorIndex];
    this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }

  /* --- Rechteck (gefüllt) --- */
  rect(x, y, w, h, colorIndex = 3) {
    this.ctx.fillStyle = Renderer.COLORS[colorIndex];
    this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  /* --- Rechteck (Rahmen) --- */
  strokeRect(x, y, w, h, colorIndex = 3) {
    this.ctx.strokeStyle = Renderer.COLORS[colorIndex];
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.floor(w) - 1, Math.floor(h) - 1);
  }

  /* --- Linie --- */
  line(x1, y1, x2, y2, colorIndex = 3) {
    this.ctx.strokeStyle = Renderer.COLORS[colorIndex];
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(Math.floor(x1) + 0.5, Math.floor(y1) + 0.5);
    this.ctx.lineTo(Math.floor(x2) + 0.5, Math.floor(y2) + 0.5);
    this.ctx.stroke();
  }

  /* --- Kreis (gefüllt) --- */
  circle(cx, cy, r, colorIndex = 3) {
    this.ctx.fillStyle = Renderer.COLORS[colorIndex];
    this.ctx.beginPath();
    this.ctx.arc(Math.floor(cx), Math.floor(cy), Math.floor(r), 0, Math.PI * 2);
    this.ctx.fill();
  }

  /* --- Text --- */
  text(str, x, y, colorIndex = 3, size = null) {
    const sz = size || this._fontSize;
    this.ctx.fillStyle = Renderer.COLORS[colorIndex];
    this.ctx.font = `${sz}px ${this._fontFamily}`;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(str, Math.floor(x), Math.floor(y));
  }

  /* --- Text zentriert --- */
  textCenter(str, y, colorIndex = 3, size = null) {
    const sz = size || this._fontSize;
    this.ctx.font = `${sz}px ${this._fontFamily}`;
    const w = this.ctx.measureText(str).width;
    this.text(str, (Renderer.WIDTH - w) / 2, y, colorIndex, sz);
  }

  /* --- Sprite (aus einem 2D-Array von Farbindizes) --- */
  sprite(data, x, y, scale = 1) {
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        const c = data[row][col];
        if (c < 0) continue; // transparent
        this.ctx.fillStyle = Renderer.COLORS[c];
        this.ctx.fillRect(
          Math.floor(x + col * scale),
          Math.floor(y + row * scale),
          scale, scale
        );
      }
    }
  }

  /* --- Hilfsfunktionen --- */
  get width()  { return Renderer.WIDTH; }
  get height() { return Renderer.HEIGHT; }

  setFont(size, family) {
    this._fontSize = size || 8;
    this._fontFamily = family || 'monospace';
  }
}
