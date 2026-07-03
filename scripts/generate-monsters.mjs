import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODEL = "gpt-image-1";
const SIZE = "1024x1024";
const API_URL = "https://api.openai.com/v1/images/generations";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "monsters");

const COMMON_STYLE = [
  "Create an original mascot character illustration for the same children's educational game character set.",
  "Style: flat cute picture-book illustration for young children, rounded simple silhouette, thick soft outline, big bright eyes, smiling friendly expression.",
  "Use bright pastel colors, clean cel shading, and only very subtle shadows on the character itself.",
  "Composition: one full-body character only, centered large in the image, facing front to slight three-quarter view, with generous padding.",
  "Background must be fully transparent.",
  "Do not include readable text, logos, frames, floor, cast shadow, ground shadow, watermark, or any extra characters.",
  "Do not resemble any existing famous game, anime, manga, or mascot character; make it completely original.",
  "Do not draw Japanese letters or readable symbols. Express language-learning ideas only as abstract shapes, patterns, dots, circles, blocks, charms, or speech-bubble motifs.",
].join(" ");

const MONSTERS = [
  {
    id: "aiusagi",
    prompt:
      "A small white and pink rabbit mascot inspired by hiragana learning. Long ears wave gently like soft ribbons. The rabbit is jumping energetically, with round pink cheek blushes and a cheerful smile.",
  },
  {
    id: "kotobaneko",
    prompt:
      "A cream and orange striped cat mascot inspired by words. Long whiskers sparkle softly. A round speech-bubble-shaped abstract pattern is on its belly. Curious, lively expression.",
  },
  {
    id: "tententanuki",
    prompt:
      "A round brown tanuki mascot inspired by voiced and semi-voiced sound marks. Two small dot-like cheek patterns suggest dakuten, and a small circle-like forehead pattern suggests handakuten. It happily hugs a tiny taiko drum.",
  },
  {
    id: "chibitsubame",
    prompt:
      "A very tiny blue and white swallow mascot inspired by small kana sounds. Fluffy round body, tiny wings, flying pose, one eye winking. The design should make its smallness feel charming and cute.",
  },
  {
    id: "katakanarobo",
    prompt:
      "A stocky rounded-corner robot mascot in silver and light blue, inspired by katakana. Body parts have straight, angular, blocky forms that suggest the feel of katakana without drawing letters. Small antenna on the head, digital-style smiling eyes.",
  },
  {
    id: "nakamapanda",
    prompt:
      "A round black and white panda mascot inspired by sorting groups. It sits calmly and plays by sorting small differently colored round balls into three groups. The balls are abstract and suggest apple, car, and star categories without realistic details.",
  },
  {
    id: "bunbunrisu",
    prompt:
      "An energetic brown and orange squirrel mascot inspired by sentence building. Large fluffy tail, quick playful smile. It is lining up plain toy blocks in one row, like arranging words, but the blocks have no letters or markings.",
  },
  {
    id: "joshikitsune",
    prompt:
      "A clever yellow and white fox mascot inspired by grammar particles. It wears a small scarf. The tip of its tail has three round charm ornaments. Proud, composed, slightly smug smile.",
  },
  {
    id: "marutenkurage",
    prompt:
      "A light blue and pale purple jellyfish mascot with a slightly translucent feeling, inspired by punctuation marks. The bell has round circle patterns, and the tentacle tips have small teardrop ornaments. It floats gently and smiles.",
  },
  {
    id: "yomitoridoragon",
    prompt:
      "A gentle small green and cream dragon mascot inspired by reading comprehension. Wings are shaped like open book pages, with no text. Round belly, soft eyes. It sits while reading a small open book with blank pages.",
  },
];

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.find((arg) => arg.startsWith("--only="));
const onlyIds = onlyArg
  ? new Set(
      onlyArg
        .slice("--only=".length)
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
  : null;

if (args.includes("--help")) {
  console.log(`Usage: node scripts/generate-monsters.mjs [--force] [--only=id1,id2]

Generates PNG monster images with ${MODEL} and saves them to public/monsters/<id>.png.
Requires OPENAI_API_KEY in the environment.`);
  process.exit(0);
}

const unknownIds = onlyIds
  ? [...onlyIds].filter((id) => !MONSTERS.some((monster) => monster.id === id))
  : [];

if (unknownIds.length > 0) {
  console.error(`Unknown monster id(s): ${unknownIds.join(", ")}`);
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is not set. Set it in your environment before running this script.");
  process.exit(1);
}

const selectedMonsters = onlyIds
  ? MONSTERS.filter((monster) => onlyIds.has(monster.id))
  : MONSTERS;

async function fileExists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function buildPrompt(monster) {
  return `${COMMON_STYLE}\n\nCharacter brief: ${monster.prompt}`;
}

async function requestImage(monster) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: buildPrompt(monster),
      n: 1,
      size: SIZE,
      background: "transparent",
      output_format: "png",
      quality: "high",
    }),
  });

  const body = await response.text();
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = body;
  }

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error?.message || JSON.stringify(payload, null, 2);
    throw new Error(`Image API failed for ${monster.id}: ${response.status} ${message}`);
  }

  const image = payload?.data?.[0];
  if (image?.b64_json) {
    return Buffer.from(image.b64_json, "base64");
  }

  if (image?.url) {
    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to download image for ${monster.id}: ${imageResponse.status} ${imageResponse.statusText}`,
      );
    }
    return Buffer.from(await imageResponse.arrayBuffer());
  }

  throw new Error(`Image API response for ${monster.id} did not include b64_json or url.`);
}

await mkdir(OUTPUT_DIR, { recursive: true });

for (const monster of selectedMonsters) {
  const outputPath = path.join(OUTPUT_DIR, `${monster.id}.png`);
  const outputLabel = path.relative(PROJECT_ROOT, outputPath);

  if (!force && (await fileExists(outputPath))) {
    console.log(`Skipping ${outputLabel}; already exists. Use --force to regenerate.`);
    continue;
  }

  console.log(`Generating ${monster.id}...`);
  const imageBuffer = await requestImage(monster);
  await writeFile(outputPath, imageBuffer);
  console.log(`Saved ${outputLabel} (${imageBuffer.length.toLocaleString()} bytes)`);
}

console.log("Done.");
