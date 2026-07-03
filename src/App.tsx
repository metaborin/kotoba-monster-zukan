import { useState } from "react";
import { STAGES, getStage, getNextStage } from "./data/stages";
import { getMonster } from "./data/monsters";
import { MISSIONS } from "./data/missions";
import type { BattleOutcome, ResultInfo, SaveData } from "./types/progress";
import { loadSave, saveSave, resetSave } from "./utils/progress";
import { getStar, isStageClear } from "./utils/gameLogic";
import { levelForXp } from "./utils/monsterLogic";
import { TitleScreen } from "./components/TitleScreen";
import { WorldMap } from "./components/WorldMap";
import { TeamScreen } from "./components/TeamScreen";
import { StageIntro } from "./components/StageIntro";
import { QuizBattleScreen } from "./components/QuizBattleScreen";
import { ResultScreen } from "./components/ResultScreen";
import { MonsterDexScreen } from "./components/MonsterDexScreen";
import { ProgressScreen } from "./components/ProgressScreen";

type Screen =
  | "title"
  | "map"
  | "team"
  | "stageIntro"
  | "battle"
  | "result"
  | "dex"
  | "progress";

const STAR_ORDER = { none: 0, silver: 1, gold: 2 } as const;

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [screen, setScreen] = useState<Screen>("title");
  const [stageId, setStageId] = useState<string | null>(null);
  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState<ResultInfo | null>(null);
  // ずかん・せいせきから もどる さきを おぼえておく
  const [backTo, setBackTo] = useState<Screen>("title");

  const updateSave = (next: SaveData) => {
    setSave(next);
    saveSave(next);
  };

  const openStage = (id: string) => {
    setStageId(id);
    setScreen("stageIntro");
  };

  const handleBattleEnd = (outcome: BattleOutcome) => {
    const stage = getStage(outcome.stageId);
    if (!stage) return;

    const next: SaveData = {
      ...save,
      bestCorrect: { ...save.bestCorrect },
      stageStars: { ...save.stageStars },
      monsters: { ...save.monsters },
      clearedStageIds: [...save.clearedStageIds],
      unlockedMonsterIds: [...save.unlockedMonsterIds],
      team: [...save.team],
      missions: {
        ...save.missions,
        counters: { ...save.missions.counters },
        doneIds: [...save.missions.doneIds],
      },
    };

    // パワーと XP
    next.power += outcome.power;
    next.totalXp += outcome.xp;

    // チームの なかまに XP → レベルアップ判定
    const leveledUp: { id: string; level: number }[] = [];
    for (const id of next.team) {
      const prev = next.monsters[id] ?? { xp: 0, level: 1 };
      const newXp = prev.xp + outcome.xp;
      const newLevel = levelForXp(newXp);
      next.monsters[id] = { xp: newXp, level: newLevel };
      if (newLevel > prev.level) leveledUp.push({ id, level: newLevel });
    }

    const cleared = !outcome.practice && isStageClear(outcome.correct);
    const star = outcome.practice
      ? ("none" as const)
      : getStar(outcome.correct, outcome.total);

    let newMonsterId: string | null = null;
    if (!outcome.practice) {
      // さいこう せいかいすう
      next.bestCorrect[stage.id] = Math.max(
        next.bestCorrect[stage.id] ?? 0,
        outcome.correct,
      );
      // ほし（よい ほうを のこす）
      const prevStar = next.stageStars[stage.id] ?? "none";
      if (STAR_ORDER[star] > STAR_ORDER[prevStar]) {
        next.stageStars[stage.id] = star;
      }
      if (cleared) {
        if (!next.clearedStageIds.includes(stage.id)) {
          next.clearedStageIds.push(stage.id);
        }
        // あたらしい なかま
        const reward = getMonster(stage.rewardMonsterId);
        if (reward && !next.unlockedMonsterIds.includes(reward.id)) {
          next.unlockedMonsterIds.push(reward.id);
          next.monsters[reward.id] = { xp: 0, level: 1 };
          newMonsterId = reward.id;
          if (next.team.length < 3) next.team.push(reward.id);
        }
      }
    }

    // まちがえた もんだいの きろく（こんかい せいかいした ものは けす）
    const wrongSet = new Set(next.wrongQuestionIds);
    for (const id of outcome.correctQuestionIds) wrongSet.delete(id);
    for (const id of outcome.wrongQuestionIds) wrongSet.add(id);
    next.wrongQuestionIds = [...wrongSet];

    next.lastStageId = stage.id;

    // きょうの ミッション
    next.missions.counters.stagesPlayed += 1;
    next.missions.counters.correctAnswers += outcome.correct;
    next.missions.counters.powerEarned += outcome.power;
    next.missions.doneIds = MISSIONS.filter(
      (m) => next.missions.counters[m.counter] >= m.target,
    ).map((m) => m.id);

    updateSave(next);

    const nextStage = cleared ? getNextStage(stage.id) : undefined;
    setResult({
      outcome,
      cleared,
      star,
      newMonsterId,
      leveledUp,
      nextStageId: nextStage?.id ?? null,
    });
    setScreen("result");
  };

  const handleReset = () => {
    const fresh = resetSave();
    setSave(fresh);
    setStageId(null);
    setResult(null);
    setScreen("title");
  };

  const stage = stageId ? getStage(stageId) : undefined;
  const isMaster = save.clearedStageIds.length >= STAGES.length;

  switch (screen) {
    case "title":
      return (
        <TitleScreen
          hasProgress={save.lastStageId !== null}
          isMaster={isMaster}
          onStart={() => setScreen("map")}
          onContinue={() => {
            if (save.lastStageId) {
              openStage(save.lastStageId);
            } else {
              setScreen("map");
            }
          }}
          onDex={() => {
            setBackTo("title");
            setScreen("dex");
          }}
          onProgress={() => {
            setBackTo("title");
            setScreen("progress");
          }}
          onReset={() => {
            if (
              window.confirm(
                "本当にはじめからやりなおしますか？\nこれまでの記録はすべて消えます。",
              )
            ) {
              handleReset();
            }
          }}
        />
      );
    case "map":
      return (
        <WorldMap
          save={save}
          onSelectStage={openStage}
          onTeam={() => setScreen("team")}
          onDex={() => {
            setBackTo("map");
            setScreen("dex");
          }}
          onProgress={() => {
            setBackTo("map");
            setScreen("progress");
          }}
          onTitle={() => setScreen("title")}
        />
      );
    case "team":
      return (
        <TeamScreen
          save={save}
          onChangeTeam={(team) => updateSave({ ...save, team })}
          onBack={() => setScreen("map")}
        />
      );
    case "stageIntro":
      if (!stage) return null;
      return (
        <StageIntro
          stage={stage}
          save={save}
          onChallenge={() => {
            setPractice(false);
            setScreen("battle");
          }}
          onPractice={() => {
            setPractice(true);
            setScreen("battle");
          }}
          onBack={() => setScreen("map")}
        />
      );
    case "battle":
      if (!stage) return null;
      return (
        <QuizBattleScreen
          key={`${stage.id}-${practice}`}
          stage={stage}
          save={save}
          practice={practice}
          onFinish={handleBattleEnd}
          onQuit={() => setScreen("map")}
        />
      );
    case "result":
      if (!result) return null;
      return (
        <ResultScreen
          result={result}
          save={save}
          onNextStage={openStage}
          onRetry={() => setScreen("battle")}
          onMap={() => setScreen("map")}
        />
      );
    case "dex":
      return (
        <MonsterDexScreen save={save} onBack={() => setScreen(backTo)} />
      );
    case "progress":
      return (
        <ProgressScreen
          save={save}
          onBack={() => setScreen(backTo)}
          onReset={handleReset}
          onSelectStage={openStage}
        />
      );
  }
}
