// Generates the extension's PNG icons from scratch (solid dark square,
// white "+" for the add-a-task affordance) using only Node's built-in
// zlib for compression — no image library dependency for three tiny icons.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "..", "icons");

const BACKGROUND = [0x11, 0x18, 0x27]; // #111827, matches the app's gray-900
const FOREGROUND = [0xff, 0xff, 0xff]; // white

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

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcInput = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);

  return Buffer.concat([length, typeBytes, data, crc]);
}

function drawPlusIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const barThickness = Math.max(2, Math.round(size * 0.16));
  const margin = Math.round(size * 0.28);
  const center = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const withinHorizontalBar = Math.abs(y - center) <= barThickness / 2 && x >= margin && x <= size - margin;
      const withinVerticalBar = Math.abs(x - center) <= barThickness / 2 && y >= margin && y <= size - margin;
      const isForeground = withinHorizontalBar || withinVerticalBar;
      const [r, g, b] = isForeground ? FOREGROUND : BACKGROUND;
      const offset = (y * size + x) * 4;
      pixels[offset] = r;
      pixels[offset + 1] = g;
      pixels[offset + 2] = b;
      pixels[offset + 3] = 255;
    }
  }
  return pixels;
}

function encodePng(size) {
  const pixels = drawPlusIcon(size);

  // Each scanline is prefixed with a filter-type byte (0 = "None").
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const srcStart = y * size * 4;
    const dstStart = y * (1 + size * 4);
    raw[dstStart] = 0;
    pixels.copy(raw, dstStart + 1, srcStart, srcStart + size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const size of [16, 48, 128]) {
  const outPath = join(ICONS_DIR, `icon${size}.png`);
  writeFileSync(outPath, encodePng(size));
  console.log(`wrote ${outPath}`);
}
