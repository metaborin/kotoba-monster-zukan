// モンスターレベルの XP しきいち（Level 1〜5）
export const LEVEL_XP = [0, 30, 70, 120, 200];
export const MAX_LEVEL = 5;

export const LEVEL_TITLES = [
  "なかまになった",
  "すこしせいちょう",
  "とくいわざをおぼえた",
  "キラキラしんか",
  "ことばスター",
];

export function levelForXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) level = i + 1;
  }
  return level;
}

/** つぎのレベルまでの のこり XP。さいだいレベルなら null */
export function xpToNextLevel(xp: number): number | null {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) return null;
  return LEVEL_XP[level] - xp;
}

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, MAX_LEVEL) - 1];
}
