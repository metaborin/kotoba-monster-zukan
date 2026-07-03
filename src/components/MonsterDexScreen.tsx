import { MONSTERS } from "../data/monsters";
import { getStage } from "../data/stages";
import type { SaveData } from "../types/progress";
import { MonsterCard } from "./MonsterCard";
import { StatusBar } from "./StatusBar";

type Props = {
  save: SaveData;
  onBack: () => void;
};

export function MonsterDexScreen({ save, onBack }: Props) {
  const ownedCount = save.unlockedMonsterIds.length;

  return (
    <div className="screen dex-screen">
      <StatusBar save={save} onBack={onBack} backLabel="もどる" />
      <h2 className="screen-title">📖 ことばモンスターずかん</h2>
      <p className="screen-note">
        あつめた なかま：{ownedCount}/{MONSTERS.length}たい
      </p>
      <div className="monster-grid">
        {MONSTERS.map((m) => {
          const owned = save.unlockedMonsterIds.includes(m.id);
          const stage = getStage(m.unlockStageId);
          return (
            <div key={m.id} className="dex-card-wrap">
              <MonsterCard
                monster={m}
                progress={save.monsters[m.id]}
                owned={owned}
              />
              {!owned && stage && (
                <div className="dex-hint">
                  {stage.icon} 「{stage.areaName}」で であえるよ
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
