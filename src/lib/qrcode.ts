/**
 * Générateur de QR code — implémentation autonome (aucune dépendance npm).
 *
 * Mode octet, niveau de correction M, versions 1 à 10 (jusqu'à 213 octets),
 * choix automatique du masque par pénalité (règles ISO/IEC 18004).
 * Le rendu est un SVG : net à toutes les tailles, imprimable, et sans image
 * binaire à stocker.
 *
 * Utilisé pour les cartes d'abonnement : le QR encode une URL contenant un
 * jeton opaque, jamais l'identifiant de la carte.
 */

type ECLevel = "L" | "M" | "Q" | "H";

/* ───────────────────────────── Tables ISO ─────────────────────────────── */

/** [total codewords, ec codewords/bloc, g1 blocs, g1 data cw, g2 blocs, g2 data cw] */
const RS_BLOCKS: Record<ECLevel, Record<number, number[]>> = {
  M: {
    1: [26, 10, 1, 16, 0, 0],
    2: [44, 16, 1, 28, 0, 0],
    3: [70, 26, 1, 44, 0, 0],
    4: [100, 18, 2, 32, 0, 0],
    5: [134, 24, 2, 43, 0, 0],
    6: [172, 16, 4, 27, 0, 0],
    7: [196, 18, 4, 31, 0, 0],
    8: [242, 22, 2, 38, 2, 39],
    9: [292, 22, 3, 36, 2, 37],
    10: [346, 26, 4, 43, 1, 44],
  },
  L: {
    1: [26, 7, 1, 19, 0, 0],
    2: [44, 10, 1, 34, 0, 0],
    3: [70, 15, 1, 55, 0, 0],
    4: [100, 20, 1, 80, 0, 0],
    5: [134, 26, 1, 108, 0, 0],
    6: [172, 18, 2, 68, 0, 0],
    7: [196, 20, 2, 78, 0, 0],
    8: [242, 24, 2, 97, 0, 0],
    9: [292, 30, 2, 116, 0, 0],
    10: [346, 18, 2, 68, 2, 69],
  },
  Q: {
    1: [26, 13, 1, 13, 0, 0],
    2: [44, 22, 1, 22, 0, 0],
    3: [70, 18, 2, 17, 0, 0],
    4: [100, 26, 2, 24, 0, 0],
    5: [134, 18, 2, 15, 2, 16],
    6: [172, 24, 4, 19, 0, 0],
    7: [196, 18, 2, 14, 4, 15],
    8: [242, 22, 4, 18, 2, 19],
    9: [292, 20, 4, 16, 4, 17],
    10: [346, 24, 6, 19, 2, 20],
  },
  H: {
    1: [26, 17, 1, 9, 0, 0],
    2: [44, 28, 1, 16, 0, 0],
    3: [70, 22, 2, 13, 0, 0],
    4: [100, 16, 4, 9, 0, 0],
    5: [134, 22, 2, 11, 2, 12],
    6: [172, 28, 4, 15, 0, 0],
    7: [196, 26, 4, 13, 1, 14],
    8: [242, 26, 4, 14, 2, 15],
    9: [292, 24, 4, 12, 4, 13],
    10: [346, 28, 6, 15, 2, 16],
  },
};

const ALIGN_CENTERS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

const EC_BITS: Record<ECLevel, number> = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };

/* ─────────────────────────── Arithmétique GF(256) ─────────────────────── */

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

/** Polynôme générateur de Reed-Solomon pour `degree` codewords de contrôle. */
function rsGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGenerator(ecLen);
  const res = new Array(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ res[0];
    res.shift();
    res.push(0);
    if (factor !== 0) {
      for (let i = 0; i < ecLen; i++) {
        res[i] ^= gfMul(gen[i + 1], factor);
      }
    }
  }
  return res;
}

/* ───────────────────────────── Encodage ───────────────────────────────── */

function utf8Bytes(text: string): number[] {
  const out: number[] = [];
  for (const byte of new TextEncoder().encode(text)) out.push(byte);
  return out;
}

function capacityBytes(version: number, level: ECLevel): number {
  const [, ecPerBlock, g1, g1d, g2, g2d] = RS_BLOCKS[level][version];
  const dataCw = g1 * g1d + g2 * g2d;
  void ecPerBlock;
  const countBits = version >= 10 ? 16 : 8;
  return Math.floor((dataCw * 8 - 4 - countBits) / 8);
}

function pickVersion(byteLen: number, level: ECLevel): number {
  for (let v = 1; v <= 10; v++) {
    if (byteLen <= capacityBytes(v, level)) return v;
  }
  throw new Error("Contenu trop long pour un QR code version 10.");
}

class BitBuffer {
  bits: number[] = [];
  put(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1);
  }
  get length() {
    return this.bits.length;
  }
  toBytes(): number[] {
    const out: number[] = [];
    for (let i = 0; i < this.bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | (this.bits[i + j] ?? 0);
      out.push(b);
    }
    return out;
  }
}

function buildCodewords(
  bytes: number[],
  version: number,
  level: ECLevel,
): number[] {
  const [, ecPerBlock, g1, g1d, g2, g2d] = RS_BLOCKS[level][version];
  const dataCw = g1 * g1d + g2 * g2d;

  const bb = new BitBuffer();
  bb.put(0b0100, 4); // mode octet
  bb.put(bytes.length, version >= 10 ? 16 : 8);
  for (const b of bytes) bb.put(b, 8);

  const capacityBits = dataCw * 8;
  const terminator = Math.min(4, capacityBits - bb.length);
  if (terminator > 0) bb.put(0, terminator);
  while (bb.length % 8 !== 0) bb.put(0, 1);

  const data = bb.toBytes();
  const padding = [0xec, 0x11];
  let p = 0;
  while (data.length < dataCw) data.push(padding[p++ % 2]);

  // Découpage en blocs
  const blocks: { data: number[]; ec: number[] }[] = [];
  let offset = 0;
  for (let i = 0; i < g1; i++) {
    const chunk = data.slice(offset, offset + g1d);
    offset += g1d;
    blocks.push({ data: chunk, ec: rsEncode(chunk, ecPerBlock) });
  }
  for (let i = 0; i < g2; i++) {
    const chunk = data.slice(offset, offset + g2d);
    offset += g2d;
    blocks.push({ data: chunk, ec: rsEncode(chunk, ecPerBlock) });
  }

  // Entrelacement
  const out: number[] = [];
  const maxData = Math.max(...blocks.map((b) => b.data.length));
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.data.length) out.push(b.data[i]);
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const b of blocks) out.push(b.ec[i]);
  }
  return out;
}

/* ─────────────────────────── Construction matrice ─────────────────────── */

type Grid = { m: Int8Array; reserved: Uint8Array; size: number };

function newGrid(size: number): Grid {
  return {
    m: new Int8Array(size * size),
    reserved: new Uint8Array(size * size),
    size,
  };
}
const at = (g: Grid, r: number, c: number) => g.m[r * g.size + c];
function set(g: Grid, r: number, c: number, v: number, reserve = true) {
  g.m[r * g.size + c] = v;
  if (reserve) g.reserved[r * g.size + c] = 1;
}
const isReserved = (g: Grid, r: number, c: number) =>
  g.reserved[r * g.size + c] === 1;

function placeFinder(g: Grid, row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || cc < 0 || rr >= g.size || cc >= g.size) continue;
      const inRing =
        (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
        (c >= 0 && c <= 6 && (r === 0 || r === 6));
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      set(g, rr, cc, inRing || inCore ? 1 : 0);
    }
  }
}

function placeAlignment(g: Grid, version: number) {
  const centers = ALIGN_CENTERS[version];
  for (const r of centers) {
    for (const c of centers) {
      // Ne pas écraser les motifs de détection.
      if (
        (r <= 8 && c <= 8) ||
        (r <= 8 && c >= g.size - 9) ||
        (r >= g.size - 9 && c <= 8)
      ) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const ring = Math.max(Math.abs(dr), Math.abs(dc));
          set(g, r + dr, c + dc, ring === 1 ? 0 : 1);
        }
      }
    }
  }
}

function placeTiming(g: Grid) {
  for (let i = 8; i < g.size - 8; i++) {
    const v = i % 2 === 0 ? 1 : 0;
    set(g, 6, i, v);
    set(g, i, 6, v);
  }
}

function reserveFormat(g: Grid, version: number) {
  for (let i = 0; i < 9; i++) {
    if (!isReserved(g, 8, i)) set(g, 8, i, 0);
    if (!isReserved(g, i, 8)) set(g, i, 8, 0);
  }
  for (let i = 0; i < 8; i++) {
    set(g, 8, g.size - 1 - i, 0);
    set(g, g.size - 1 - i, 8, 0);
  }
  set(g, g.size - 8, 8, 1); // module sombre

  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        set(g, i, g.size - 11 + j, 0);
        set(g, g.size - 11 + j, i, 0);
      }
    }
  }
}

function formatBits(level: ECLevel, mask: number): number {
  const data = (EC_BITS[level] << 3) | mask;
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) {
    if ((rem >>> i) & 1) rem ^= 0b10100110111 << (i - 10);
  }
  return ((data << 10) | rem) ^ 0b101010000010010;
}

function versionBits(version: number): number {
  let rem = version << 12;
  for (let i = 17; i >= 12; i--) {
    if ((rem >>> i) & 1) rem ^= 0b1111100100101 << (i - 12);
  }
  return (version << 12) | rem;
}

function writeFormat(g: Grid, level: ECLevel, mask: number) {
  const bits = formatBits(level, mask);
  for (let i = 0; i < 15; i++) {
    const bit = (bits >>> i) & 1;
    // Copie 1 : colonne 8 puis ligne 8, autour du motif haut-gauche
    if (i < 6) set(g, i, 8, bit);
    else if (i === 6) set(g, 7, 8, bit);
    else if (i === 7) set(g, 8, 8, bit);
    else if (i === 8) set(g, 8, 7, bit);
    else set(g, 8, 14 - i, bit);
    // Copie 2 : ligne 8 à droite, colonne 8 en bas
    if (i < 8) set(g, 8, g.size - 1 - i, bit);
    else set(g, g.size - 15 + i, 8, bit);
  }
}

function writeVersion(g: Grid, version: number) {
  if (version < 7) return;
  const bits = versionBits(version);
  for (let i = 0; i < 18; i++) {
    const bit = (bits >>> i) & 1;
    const r = Math.floor(i / 3);
    const c = g.size - 11 + (i % 3);
    set(g, r, c, bit);
    set(g, c, r, bit);
  }
}

function placeData(g: Grid, codewords: number[]) {
  let bitIndex = 0;
  const total = codewords.length * 8;
  const nextBit = () => {
    if (bitIndex >= total) return 0;
    const b = (codewords[bitIndex >> 3] >>> (7 - (bitIndex & 7))) & 1;
    bitIndex++;
    return b;
  };

  let upward = true;
  for (let col = g.size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // saute la colonne de synchronisation
    for (let i = 0; i < g.size; i++) {
      const row = upward ? g.size - 1 - i : i;
      for (let k = 0; k < 2; k++) {
        const c = col - k;
        if (isReserved(g, row, c)) continue;
        set(g, row, c, nextBit(), false);
      }
    }
    upward = !upward;
  }
}

function maskFn(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0:
      return (r + c) % 2 === 0;
    case 1:
      return r % 2 === 0;
    case 2:
      return c % 3 === 0;
    case 3:
      return (r + c) % 3 === 0;
    case 4:
      return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5:
      return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6:
      return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    default:
      return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
  }
}

function applyMask(g: Grid, mask: number) {
  for (let r = 0; r < g.size; r++) {
    for (let c = 0; c < g.size; c++) {
      if (isReserved(g, r, c)) continue;
      if (maskFn(mask, r, c)) g.m[r * g.size + c] ^= 1;
    }
  }
}

function penalty(g: Grid): number {
  const n = g.size;
  let score = 0;

  // Règle 1 : suites de 5 modules ou plus de même couleur
  for (let r = 0; r < n; r++) {
    let runH = 1;
    let runV = 1;
    for (let c = 1; c < n; c++) {
      runH = at(g, r, c) === at(g, r, c - 1) ? runH + 1 : 1;
      if (runH === 5) score += 3;
      else if (runH > 5) score += 1;
      runV = at(g, c, r) === at(g, c - 1, r) ? runV + 1 : 1;
      if (runV === 5) score += 3;
      else if (runV > 5) score += 1;
    }
  }

  // Règle 2 : blocs 2×2 de même couleur
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const v = at(g, r, c);
      if (
        v === at(g, r, c + 1) &&
        v === at(g, r + 1, c) &&
        v === at(g, r + 1, c + 1)
      ) {
        score += 3;
      }
    }
  }

  // Règle 3 : motif 1:1:3:1:1 entouré de blanc
  const p1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const p2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  const match = (get: (i: number) => number, start: number, pat: number[]) => {
    for (let i = 0; i < pat.length; i++) if (get(start + i) !== pat[i]) return false;
    return true;
  };
  for (let r = 0; r < n; r++) {
    for (let c = 0; c + 11 <= n; c++) {
      const getH = (i: number) => at(g, r, i);
      if (match(getH, c, p1) || match(getH, c, p2)) score += 40;
      const getV = (i: number) => at(g, i, r);
      if (match(getV, c, p1) || match(getV, c, p2)) score += 40;
    }
  }

  // Règle 4 : déséquilibre noir / blanc
  let dark = 0;
  for (let i = 0; i < n * n; i++) dark += g.m[i];
  const ratio = (dark * 100) / (n * n);
  score += Math.floor(Math.abs(ratio - 50) / 5) * 10;

  return score;
}

/* ─────────────────────────────── API ──────────────────────────────────── */

/** Matrice de modules : `true` = module sombre. */
export function qrMatrix(text: string, level: ECLevel = "M"): boolean[][] {
  const bytes = utf8Bytes(text);
  const version = pickVersion(bytes.length, level);
  const codewords = buildCodewords(bytes, version, level);
  const size = version * 4 + 17;

  let best: { grid: Grid; score: number } | null = null;

  for (let mask = 0; mask < 8; mask++) {
    const g = newGrid(size);
    placeFinder(g, 0, 0);
    placeFinder(g, 0, size - 7);
    placeFinder(g, size - 7, 0);
    placeAlignment(g, version);
    placeTiming(g);
    reserveFormat(g, version);
    writeVersion(g, version);
    placeData(g, codewords);
    applyMask(g, mask);
    writeFormat(g, level, mask);
    const score = penalty(g);
    if (!best || score < best.score) best = { grid: g, score };
  }

  const g = best!.grid;
  const out: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) row.push(at(g, r, c) === 1);
    out.push(row);
  }
  return out;
}

/**
 * QR code prêt à l'emploi sous forme de SVG (chaîne).
 * `quiet` = marge blanche obligatoire, exprimée en modules (4 par la norme).
 */
export function qrSvg(
  text: string,
  opts: {
    size?: number;
    dark?: string;
    light?: string;
    quiet?: number;
    level?: ECLevel;
    title?: string;
  } = {},
): string {
  const {
    size = 160,
    dark = "#0C0C0E",
    light = "#FFFFFF",
    quiet = 4,
    level = "M",
    title,
  } = opts;

  const matrix = qrMatrix(text, level);
  const n = matrix.length;
  const total = n + quiet * 2;

  let path = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) path += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}"`,
    ` width="${size}" height="${size}" shape-rendering="crispEdges"`,
    title ? ` role="img" aria-label="${escapeXml(title)}"` : ` aria-hidden="true"`,
    `>`,
    title ? `<title>${escapeXml(title)}</title>` : "",
    `<rect width="${total}" height="${total}" fill="${light}"/>`,
    `<path d="${path}" fill="${dark}"/>`,
    `</svg>`,
  ].join("");
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (ch) =>
    ch === "<"
      ? "&lt;"
      : ch === ">"
        ? "&gt;"
        : ch === "&"
          ? "&amp;"
          : ch === '"'
            ? "&quot;"
            : "&apos;",
  );
}
