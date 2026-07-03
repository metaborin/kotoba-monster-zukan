import type { MissionState } from "../types/progress";

export type Mission = {
  id: string;
  title: string;
  icon: string;
  target: number;
  counter: keyof MissionState["counters"];
};

// きょうの ミッション（まいにち リセットされます）
export const MISSIONS: Mission[] = [
  {
    id: "m1",
    title: "ステージで 1かい あそぶ",
    icon: "🎮",
    target: 1,
    counter: "stagesPlayed",
  },
  {
    id: "m2",
    title: "10もん せいかいする",
    icon: "✏️",
    target: 10,
    counter: "correctAnswers",
  },
  {
    id: "m3",
    title: "ことばパワーを 50 ためる",
    icon: "⚡",
    target: 50,
    counter: "powerEarned",
  },
];
