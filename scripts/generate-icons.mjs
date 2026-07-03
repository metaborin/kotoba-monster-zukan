// あいうさぎ（public/monsters/aiusagi.png）から PWA用アイコンを生成するスクリプト。
// 実行: npm run generate:icons
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(PROJECT_ROOT, "public", "monsters", "aiusagi.png");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "icons");

// ゲームのテーマカラー（global.css の --accent 系のクリーム色）
const BACKGROUND = "#ffedb3";

/**
 * 背景色つきの正方形アイコンを生成する。
 * @param {number} size 出力サイズ(px)
 * @param {number} scale キャラクターの占める割合（maskable は安全圏の8割程度に）
 * @param {string} filename 出力ファイル名
 */
async function makeIcon(size, scale, filename) {
  const charSize = Math.round(size * scale);
  const character = await sharp(SOURCE)
    .resize(charSize, charSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const outputPath = path.join(OUTPUT_DIR, filename);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: character, gravity: "centre" }])
    .png()
    .toFile(outputPath);

  console.log(`Saved ${path.relative(PROJECT_ROOT, outputPath)} (${size}x${size})`);
}

await mkdir(OUTPUT_DIR, { recursive: true });

// 通常アイコン: キャラ大きめ / maskable: OSが円形などに切り抜くため中央62%に収める
await makeIcon(192, 0.82, "pwa-192x192.png");
await makeIcon(512, 0.82, "pwa-512x512.png");
await makeIcon(512, 0.62, "maskable-512x512.png");
await makeIcon(180, 0.82, "apple-touch-icon.png");
await makeIcon(64, 0.86, "favicon-64x64.png");

console.log("Done.");
