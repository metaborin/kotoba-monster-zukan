export type QuizQuestion = {
  id: string;
  type: "choice" | "order" | "fill";
  question: string;
  storyText?: string;
  choices?: string[];
  answer: string | string[];
  hint: string;
  xp: number;
};

export type Stage = {
  id: string;
  title: string;
  areaName: string;
  description: string;
  level: number;
  icon: string;
  rewardMonsterId: string;
  questions: QuizQuestion[];
};
