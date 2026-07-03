export type MonsterElement =
  | "ひらがな"
  | "ことば"
  | "だくおん"
  | "カタカナ"
  | "ぶん"
  | "よみとり";

export type KotobaMonster = {
  id: string;
  name: string;
  icon: string;
  element: MonsterElement;
  description: string;
  skillName: string;
  skillDescription: string;
  unlockStageId: string;
};
