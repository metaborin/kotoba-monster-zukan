import type { SaveData } from "../types/progress";

const STORAGE_KEY = "kotoba-monster-zukan-save-v1";
const FIRST_MONSTER_ID = "aiusagi";

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function createDefaultSave(): SaveData {
  return {
    clearedStageIds: [],
    bestCorrect: {},
    stageStars: {},
    totalXp: 0,
    power: 0,
    unlockedMonsterIds: [FIRST_MONSTER_ID],
    monsters: { [FIRST_MONSTER_ID]: { xp: 0, level: 1 } },
    team: [FIRST_MONSTER_ID],
    lastStageId: null,
    wrongQuestionIds: [],
    missions: {
      date: todayString(),
      counters: { stagesPlayed: 0, correctAnswers: 0, powerEarned: 0 },
      doneIds: [],
    },
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    // ふるいセーブでも こわれないように、デフォルトと マージする
    const save: SaveData = { ...createDefaultSave(), ...parsed } as SaveData;
    // ひづけが かわっていたら きょうのミッションを リセット
    if (save.missions.date !== todayString()) {
      save.missions = {
        date: todayString(),
        counters: { stagesPlayed: 0, correctAnswers: 0, powerEarned: 0 },
        doneIds: [],
      };
    }
    return save;
  } catch {
    return createDefaultSave();
  }
}

export function saveSave(save: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // ほぞんできなくても ゲームは つづけられる
  }
}

export function resetSave(): SaveData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // なにも しない
  }
  return createDefaultSave();
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
