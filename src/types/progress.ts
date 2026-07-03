export type StarRank = "gold" | "silver" | "none";

export type MonsterProgress = {
  xp: number;
  level: number;
};

export type MissionState = {
  date: string;
  counters: {
    stagesPlayed: number;
    correctAnswers: number;
    powerEarned: number;
  };
  doneIds: string[];
};

export type SaveData = {
  clearedStageIds: string[];
  bestCorrect: Record<string, number>;
  stageStars: Record<string, StarRank>;
  totalXp: number;
  power: number;
  unlockedMonsterIds: string[];
  monsters: Record<string, MonsterProgress>;
  team: string[];
  lastStageId: string | null;
  wrongQuestionIds: string[];
  missions: MissionState;
};

/** 1かいのバトルの結果（結果画面と保存処理に渡す） */
export type BattleOutcome = {
  stageId: string;
  practice: boolean;
  total: number;
  correct: number;
  power: number;
  xp: number;
  perfect: boolean;
  wrongQuestionIds: string[];
  correctQuestionIds: string[];
  endedEarly: boolean;
};

export type ResultInfo = {
  outcome: BattleOutcome;
  cleared: boolean;
  star: StarRank;
  newMonsterId: string | null;
  leveledUp: { id: string; level: number }[];
  nextStageId: string | null;
};
