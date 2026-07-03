import { STAGES } from "../data/stages";
import type { SaveData } from "../types/progress";
import { starValue, CLEAR_CORRECT_COUNT } from "../utils/gameLogic";
import { StatusBar } from "./StatusBar";

const TYPE_LABEL: Record<string, string> = {
  choice: "えらぶ問題（選択）",
  order: "ならべる問題（語順）",
  fill: "あなうめ問題（助詞・句読点）",
};

type Props = {
  save: SaveData;
  onBack: () => void;
  onReset: () => void;
  onSelectStage: (stageId: string) => void;
};

export function ProgressScreen({ save, onBack, onReset, onSelectStage }: Props) {
  const totalStars = Object.values(save.stageStars).reduce(
    (sum, s) => sum + starValue(s),
    0,
  );

  // まちがえた問題を ステージ・タイプごとに 集計
  const wrongByStage: Record<string, number> = {};
  const wrongByType: Record<string, number> = {};
  for (const stage of STAGES) {
    for (const q of stage.questions) {
      if (save.wrongQuestionIds.includes(q.id)) {
        wrongByStage[stage.id] = (wrongByStage[stage.id] ?? 0) + 1;
        wrongByType[q.type] = (wrongByType[q.type] ?? 0) + 1;
      }
    }
  }

  const attempted = STAGES.filter((s) => save.bestCorrect[s.id] !== undefined);
  const weakStages = attempted.filter(
    (s) =>
      (save.bestCorrect[s.id] ?? 0) < CLEAR_CORRECT_COUNT ||
      (wrongByStage[s.id] ?? 0) >= 2,
  );
  const reviewStages =
    weakStages.length > 0
      ? weakStages
      : attempted.filter((s) => save.stageStars[s.id] !== "gold");

  const sortedTypes = Object.entries(wrongByType).sort((a, b) => b[1] - a[1]);

  return (
    <div className="screen progress-screen">
      <StatusBar save={save} onBack={onBack} backLabel="もどる" />
      <h2 className="screen-title">📊 せいせき（先生・保護者向け）</h2>

      <div className="progress-summary">
        <div className="summary-item">
          <span className="summary-label">クリア済み</span>
          <span className="summary-value">
            {save.clearedStageIds.length}/{STAGES.length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">合計XP</span>
          <span className="summary-value">{save.totalXp}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">ことばパワー</span>
          <span className="summary-value">{save.power}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">星の数</span>
          <span className="summary-value">{totalStars}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">仲間の数</span>
          <span className="summary-value">{save.unlockedMonsterIds.length}</span>
        </div>
      </div>

      <div className="progress-panel">
        <h3 className="panel-title">ステージごとの記録</h3>
        <table className="progress-table">
          <thead>
            <tr>
              <th>ステージ</th>
              <th>最高正解数</th>
              <th>星</th>
              <th>状態</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map((stage) => {
              const best = save.bestCorrect[stage.id];
              const star = save.stageStars[stage.id];
              const cleared = save.clearedStageIds.includes(stage.id);
              const weak = weakStages.some((s) => s.id === stage.id);
              return (
                <tr key={stage.id} className={weak ? "row-weak" : ""}>
                  <td>
                    {stage.icon} {stage.title}
                  </td>
                  <td>
                    {best !== undefined
                      ? `${best}/${stage.questions.length}`
                      : "—"}
                  </td>
                  <td>
                    {star === "gold" ? "🌟" : star === "silver" ? "⭐" : "—"}
                  </td>
                  <td>
                    {cleared
                      ? "クリア"
                      : best !== undefined
                        ? "挑戦中（要復習）"
                        : "未挑戦"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="progress-panel">
        <h3 className="panel-title">よく間違える問題の種類</h3>
        {sortedTypes.length === 0 ? (
          <p>まだ間違いの記録はありません。</p>
        ) : (
          <ul className="progress-list">
            {sortedTypes.map(([type, count]) => (
              <li key={type}>
                {TYPE_LABEL[type] ?? type}：{count}問
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="progress-panel">
        <h3 className="panel-title">おすすめの復習ステージ</h3>
        {reviewStages.length === 0 ? (
          <p>すべて順調です。次のステージに進みましょう！</p>
        ) : (
          <div className="review-buttons">
            {reviewStages.map((s) => (
              <button
                key={s.id}
                className="btn btn-secondary"
                onClick={() => onSelectStage(s.id)}
              >
                {s.icon} {s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-danger"
        onClick={() => {
          if (
            window.confirm(
              "本当にはじめからやりなおしますか？\nこれまでの記録はすべて消えます。",
            )
          ) {
            onReset();
          }
        }}
      >
        🗑️ はじめからやりなおす
      </button>
    </div>
  );
}
