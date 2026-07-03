import type { ResultInfo, SaveData } from "../types/progress";
import { getStage } from "../data/stages";
import { getMonster } from "../data/monsters";
import { MonsterCard } from "./MonsterCard";

type Props = {
  result: ResultInfo;
  save: SaveData;
  onNextStage: (stageId: string) => void;
  onRetry: () => void;
  onMap: () => void;
};

const CONFETTI = ["🎊", "🎉", "✨", "🌟", "🎈", "💮", "⭐", "🎀"];

export function ResultScreen({
  result,
  save,
  onNextStage,
  onRetry,
  onMap,
}: Props) {
  const { outcome, cleared, star, newMonsterId, leveledUp, nextStageId } =
    result;
  const stage = getStage(outcome.stageId);
  const newMonster = newMonsterId ? getMonster(newMonsterId) : undefined;
  const nextStage = nextStageId ? getStage(nextStageId) : undefined;

  return (
    <div className="screen result-screen">
      {cleared && (
        <div className="confetti-layer" aria-hidden>
          {CONFETTI.concat(CONFETTI).map((c, i) => (
            <span
              key={i}
              className="confetti"
              style={{
                left: `${(i * 61) % 100}%`,
                animationDelay: `${(i % 8) * 0.25}s`,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      <h2 className="screen-title">
        {outcome.practice
          ? "📝 れんしゅう おつかれさま！"
          : cleared
            ? "🎉 ステージクリア！"
            : "🌈 よく がんばったね！"}
      </h2>

      {outcome.perfect && (
        <div className="perfect-banner combo-pop">
          🏆 パーフェクト！モンスターが とてもよろこんでいるよ！
        </div>
      )}

      <div className="result-card">
        <div className="result-row">
          <span>せいかい</span>
          <strong>
            {outcome.correct}/{outcome.total} もん
          </strong>
        </div>
        <div className="result-row">
          <span>ことばパワー</span>
          <strong>⚡ +{outcome.power}</strong>
        </div>
        <div className="result-row">
          <span>XP</span>
          <strong>📈 +{outcome.xp}</strong>
        </div>
        {!outcome.practice && (
          <div className="result-row">
            <span>ほし</span>
            <strong>
              {star === "gold" && "🌟 きんのほし！"}
              {star === "silver" && "⭐ ぎんのほし！"}
              {star === "none" && "つぎは ほしを めざそう！"}
            </strong>
          </div>
        )}
        {cleared && (
          <div className="result-row">
            <span>バッジ</span>
            <strong>
              🎖️ {stage?.areaName}クリア
            </strong>
          </div>
        )}
      </div>

      {newMonster && (
        <div className="new-monster-area">
          <div className="dex-register combo-pop">📖 ずかんに とうろく！</div>
          <div className="new-monster-title">
            ✨ {newMonster.name}と なかよくなった！ ✨
          </div>
          <MonsterCard
            monster={newMonster}
            progress={save.monsters[newMonster.id]}
            owned
            glow
          />
        </div>
      )}

      {leveledUp.length > 0 && (
        <div className="levelup-area">
          <h3 className="panel-title">🆙 レベルアップ！</h3>
          <div className="levelup-row">
            {leveledUp.map(({ id, level }) => {
              const m = getMonster(id);
              if (!m) return null;
              return (
                <div key={id} className="levelup-monster card-bounce">
                  <span className="levelup-icon">{m.icon}</span>
                  <span>
                    {m.name} が Lv.{level} に なった！
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!outcome.practice && !cleared && (
        <p className="screen-note">
          あと すこし！ もういちど チャレンジすれば きっと できるよ！
        </p>
      )}

      <div className="result-buttons">
        {cleared && nextStage && (
          <button
            className="btn btn-primary btn-big"
            onClick={() => onNextStage(nextStage.id)}
          >
            {nextStage.icon} つぎのエリア「{nextStage.areaName}」へ ▶
          </button>
        )}
        <button
          className={`btn ${cleared ? "btn-secondary" : "btn-primary btn-big"}`}
          onClick={onRetry}
        >
          🔁 もういちど チャレンジ
        </button>
        <button className="btn btn-secondary" onClick={onMap}>
          🗺️ マップへ もどる
        </button>
      </div>
    </div>
  );
}
