/**
 * AgroVision PWA Icon Generator
 *
 * Generates PNG app icons (192, 512, maskable) and an SVG icon
 * using only Node.js built-ins (zlib) — no external dependencies.
 *
 * Usage: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ============================================================
// PNG encoding (pure Node.js, no deps)
// ============================================================

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Add filter byte 0 to each scanline
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ============================================================
// Icon drawing
// ============================================================

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

/**
 * Draw the AgroVision icon (green gradient rounded square + white sprout).
 * @param {number} size - Icon size in pixels
 * @param {boolean} maskable - If true, full-bleed background (no rounded corners)
 * @returns {Buffer} RGBA pixel buffer
 */
function drawIcon(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  const ss = 2; // supersampling factor for anti-aliasing

  const topLeft = [34, 197, 94]; // #22c55e
  const bottomRight = [21, 128, 61]; // #15803d
  const white = [255, 255, 255];

  const cornerRadius = maskable ? 0 : size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = x + (sx + 0.5) / ss;
          const py = y + (sy + 0.5) / ss;

          // Rounded rect test
          let inside = true;
          if (!maskable) {
            const cx = Math.min(Math.max(px, cornerRadius), size - cornerRadius);
            const cy = Math.min(Math.max(py, cornerRadius), size - cornerRadius);
            const dx = px - cx;
            const dy = py - cy;
            if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
              inside = false;
            }
          }

          if (!inside) continue;

          // Background gradient
          const t = (px + py) / (2 * size);
          const bg = lerpColor(topLeft, bottomRight, t);

          // Normalized coordinates
          const nx = px / size;
          const ny = py / size;
          let color = bg;

          // Stem (connects leaves to bottom)
          const stemX = 0.5;
          const stemW = 0.055;
          if (
            nx >= stemX - stemW / 2 &&
            nx <= stemX + stemW / 2 &&
            ny >= 0.52 &&
            ny <= 0.84
          ) {
            color = white;
          }

          // Left leaf (rotated ellipse)
          const lcx = 0.4,
            lcy = 0.5,
            lrx = 0.17,
            lry = 0.1,
            lrot = (-35 * Math.PI) / 180;
          const ldx = nx - lcx,
            ldy = ny - lcy;
          const lrx2 = ldx * Math.cos(lrot) + ldy * Math.sin(lrot);
          const lry2 = -ldx * Math.sin(lrot) + ldy * Math.cos(lrot);
          if (
            (lrx2 * lrx2) / (lrx * lrx) + (lry2 * lry2) / (lry * lry) <=
            1
          ) {
            color = white;
          }

          // Right leaf (rotated ellipse)
          const rcx = 0.6,
            rcy = 0.5,
            rrx = 0.17,
            rry = 0.1,
            rrot = (35 * Math.PI) / 180;
          const rdx = nx - rcx,
            rdy = ny - rcy;
          const rrx2 = rdx * Math.cos(rrot) + rdy * Math.sin(rrot);
          const rry2 = -rdx * Math.sin(rrot) + rdy * Math.cos(rrot);
          if (
            (rrx2 * rrx2) / (rrx * rrx) + (rry2 * rry2) / (rry * rry) <=
            1
          ) {
            color = white;
          }

          // Center seed dot (where leaves meet stem)
          const cdx = nx - 0.5,
            cdy = ny - 0.52;
          if (cdx * cdx + cdy * cdy <= 0.045 * 0.045) {
            color = white;
          }

          r += color[0];
          g += color[1];
          b += color[2];
          a += 255;
        }
      }

      const idx = (y * size + x) * 4;
      const samples = ss * ss;
      rgba[idx] = Math.round(r / samples);
      rgba[idx + 1] = Math.round(g / samples);
      rgba[idx + 2] = Math.round(b / samples);
      rgba[idx + 3] = Math.round(a / samples);
    }
  }

  return rgba;
}

// ============================================================
// SVG icon
// ============================================================

function createSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#bg)"/>
  <rect x="232" y="266" width="48" height="164" rx="24" fill="#ffffff"/>
  <ellipse cx="205" cy="256" rx="87" ry="51" fill="#ffffff" transform="rotate(-35 205 256)"/>
  <ellipse cx="307" cy="256" rx="87" ry="51" fill="#ffffff" transform="rotate(35 307 256)"/>
  <circle cx="256" cy="266" r="23" fill="#ffffff"/>
</svg>
`;
}

// ============================================================
// Main
// ============================================================

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const icons = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
];

for (const icon of icons) {
  const rgba = drawIcon(icon.size, icon.maskable);
  const png = encodePNG(icon.size, icon.size, rgba);
  fs.writeFileSync(path.join(outDir, icon.file), png);
  console.log(
    `Generated ${icon.file} (${icon.size}x${icon.size}, ${png.length} bytes)`
  );
}

fs.writeFileSync(path.join(outDir, "icon.svg"), createSVG());
console.log("Generated icon.svg");

console.log("All icons generated successfully!");
