import type { Stage } from "../types/quiz";
import type { SaveData } from "../types/progress";
import { getMonster } from "../data/monsters";
import { CLEAR_CORRECT_COUNT } from "../utils/gameLogic";
import { StatusBar } from "./StatusBar";

const TYPE_LABEL: Record<string, string> = {
  choice: "えらぶ もんだい",
  order: "ならべる もんだい",
  fill: "あなうめ もんだい",
};

type Props = {
  stage: Stage;
  save: SaveData;
  onChallenge: () => void;
  onPractice: () => void;
  onBack: () => void;
};

export function StageIntro({
  stage,
  save,
  onChallenge,
  onPractice,
  onBack,
}: Props) {
  const reward = getMonster(stage.rewardMonsterId);
  const rewardOwned = reward
    ? save.unlockedMonsterIds.includes(reward.id)
    : false;
  const types = [...new Set(stage.questions.map((q) => q.type))];

  return (
    <div className="screen intro-screen">
      <StatusBar save={save} onBack={onBack} backLabel="マップ" />
      <div className="intro-card">
        <div className="intro-icon">{stage.icon}</div>
        <h2 className="intro-area">
          ステージ{stage.level}：{stage.areaName}
        </h2>
        <h3 className="intro-title">「{stage.title}」</h3>
        <p className="intro-desc">{stage.description}</p>

        <div className="intro-row">
          <span className="intro-label">であえるモンスター</span>
          <span className="intro-value">
            {reward && (
              <>
                <span className="intro-monster-icon">
                  {rewardOwned ? reward.icon : "❓"}
                </span>{" "}
                {rewardOwned ? reward.name : "？？？"}
              </>
            )}
          </span>
        </div>
        <div className="intro-row">
          <span className="intro-label">もんだい</span>
          <span className="intro-value">
            ぜんぶで {stage.questions.length}もん（
            {types.map((t) => TYPE_LABEL[t]).join("・")}）
          </span>
        </div>
        <div className="intro-row">
          <span className="intro-label">クリアじょうけん</span>
          <span className="intro-value">
            {CLEAR_CORRECT_COUNT}もん いじょう せいかい！
          </span>
        </div>
        <div className="intro-row">
          <span className="intro-label">ほし</span>
          <span className="intro-value">
            ぜんもん せいかいで 🌟きんのほし／
            {CLEAR_CORRECT_COUNT}もんで ⭐ぎんのほし
          </span>
        </div>

        <div className="intro-buttons">
          <button className="btn btn-primary btn-big" onClick={onChallenge}>
            ⚔️ チャレンジする
          </button>
          <button className="btn btn-secondary" onClick={onPractice}>
            📝 れんしゅうする（ハートが へらないよ）
          </button>
        </div>
      </div>
    </div>
  );
}
