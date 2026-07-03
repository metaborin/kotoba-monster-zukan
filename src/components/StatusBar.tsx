import type { SaveData } from "../types/progress";
import { playerLevel, starValue } from "../utils/gameLogic";

type Props = {
  save: SaveData;
  onBack?: () => void;
  backLabel?: string;
};

export function StatusBar({ save, onBack, backLabel = "もどる" }: Props) {
  const stars = Object.values(save.stageStars).reduce(
    (sum, s) => sum + starValue(s),
    0,
  );
  return (
    <div className="status-bar">
      {onBack && (
        <button className="btn btn-small btn-back" onClick={onBack}>
          ← {backLabel}
        </button>
      )}
      <div className="status-items">
        <span className="status-item" title="ことばレベル">
          🎓 Lv.{playerLevel(save.totalXp)}
        </span>
        <span className="status-item" title="星のかず">
          ⭐ {stars}
        </span>
        <span className="status-item" title="ことばパワー">
          ⚡ {save.power}
        </span>
        <span className="status-item" title="なかまのかず">
          🧸 {save.unlockedMonsterIds.length}
        </span>
      </div>
    </div>
  );
}
