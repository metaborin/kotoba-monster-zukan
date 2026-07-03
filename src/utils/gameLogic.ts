import type { StarRank } from "../types/progress";

export const CLEAR_CORRECT_COUNT = 4; // 4もん いじょう せいかいで クリア
export const MAX_HEARTS = 3;
export const PERFECT_POWER_BONUS = 30;
export const PERFECT_XP_BONUS = 20;

/**
 * 1もん せいかいしたときの ごほうび。
 * - ふつうに せいかい: パワー+10 / XP+10
 * - ヒントを つかって せいかい: パワー+5 / XP+5
 *   （チームに ステージと あう モンスターが いれば ヒントは ノーカウント）
 * - れんぞく せいかい (2もん め いこう): パワー+5 / XP+5 ボーナス
 */
export function answerReward(
  hintUsed: boolean,
  hintFree: boolean,
  combo: number,
): { power: number; xp: number } {
  const base = hintUsed && !hintFree ? 5 : 10;
  const comboBonus = combo >= 2 ? 5 : 0;
  return { power: base + comboBonus, xp: base + comboBonus };
}

export function getStar(correct: number, total: number): StarRank {
  if (correct >= total) return "gold";
  if (correct >= CLEAR_CORRECT_COUNT) return "silver";
  return "none";
}

export function isStageClear(correct: number): boolean {
  return correct >= CLEAR_CORRECT_COUNT;
}

/** 星の かず（金=2, 銀=1） */
export function starValue(star: StarRank): number {
  if (star === "gold") return 2;
  if (star === "silver") return 1;
  return 0;
}

export function comboMessage(combo: number): string | null {
  if (combo === 2) return "2れんぞく！";
  if (combo === 3) return "3コンボ！";
  if (combo === 4) return "すごい！";
  if (combo >= 5) return "ことばパワーアップ！";
  return null;
}

/** ことばレベル（プレイヤーのレベル）: 100XPごとに 1あがる */
export function playerLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1;
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
