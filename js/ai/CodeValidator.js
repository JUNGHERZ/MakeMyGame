/* ============================================
   CodeValidator.js – Validiert generierten Code
   
   Prüft ob der generierte Code die erwartete
   Struktur hat und keine gefährlichen Teile enthält.
   ============================================ */

const FORBIDDEN_PATTERNS = [
  /document\./,
  /window\.(location|open|close)/,
  /eval\s*\(/,
  /Function\s*\(/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /import\s+/,
  /require\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /cookie/,
  /innerHTML/,
  /outerHTML/,
  /\.src\s*=/,
  /script/i
];

/**
 * Validiert ein Game-Definition-Objekt.
 * @param {object} gameDef - { init, update, draw }
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateGameCode(gameDef) {
  const errors = [];
  const warnings = [];

  // Typ-Check
  if (!gameDef || typeof gameDef !== 'object') {
    errors.push('GameDef ist kein Objekt');
    return { valid: false, errors, warnings };
  }

  // Pflicht-Funktionen
  if (typeof gameDef.init !== 'function') {
    errors.push('init() fehlt oder ist keine Funktion');
  }
  if (typeof gameDef.update !== 'function') {
    errors.push('update() fehlt oder ist keine Funktion');
  }
  if (typeof gameDef.draw !== 'function') {
    errors.push('draw() fehlt oder ist keine Funktion');
  }

  // Code-Inhalt prüfen (als String)
  const codeStr = [
    gameDef.init?.toString() || '',
    gameDef.update?.toString() || '',
    gameDef.draw?.toString() || ''
  ].join('\n');

  FORBIDDEN_PATTERNS.forEach(pattern => {
    if (pattern.test(codeStr)) {
      warnings.push(`Potenziell unsicheres Pattern: ${pattern.source}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitiert den Code-String vor dem Parsen.
 * @param {string} code
 * @returns {string}
 */
export function sanitizeCode(code) {
  let clean = code;
  
  // Offensichtlich gefährliche Aufrufe entfernen
  FORBIDDEN_PATTERNS.forEach(pattern => {
    clean = clean.replace(pattern, '/* REMOVED */');
  });
  
  return clean;
}
