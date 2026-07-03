import { STAGES } from "../data/stages";
import { getMonster } from "../data/monsters";
import { MISSIONS } from "../data/missions";
import type { SaveData } from "../types/progress";
import { MonsterImage } from "./MonsterImage";
import { StatusBar } from "./StatusBar";

type Props = {
  save: SaveData;
  onSelectStage: (stageId: string) => void;
  onTeam: () => void;
  onDex: () => void;
  onProgress: () => void;
  onTitle: () => void;
};

export function WorldMap({
  save,
  onSelectStage,
  onTeam,
  onDex,
  onProgress,
  onTitle,
}: Props) {
  const isUnlocked = (index: number) =>
    index === 0 || save.clearedStageIds.includes(STAGES[index - 1].id);

  const recommended = STAGES.find(
    (s, i) => isUnlocked(i) && !save.clearedStageIds.includes(s.id),
  );
  const isMaster = save.clearedStageIds.length >= STAGES.length;

  return (
    <div className="screen map-screen">
      <StatusBar save={save} onBack={onTitle} backLabel="タイトル" />

      <h2 className="screen-title">🗺️ ことばランド マップ</h2>

      {isMaster ? (
        <div className="master-badge combo-pop">
          👑 ぜんぶ クリア！ きみは ことばマスター！ 👑
        </div>
      ) : (
        recommended && (
          <div className="recommend-banner">
            🌟 つぎの ぼうけんは{" "}
            <strong>
              {recommended.icon} {recommended.areaName}
            </strong>{" "}
            が おすすめ！
          </div>
        )
      )}

      <div className="map-team-row">
        <span className="map-team-label">なかまチーム：</span>
        {save.team.map((id) => {
          const m = getMonster(id);
          return (
            <span key={id} className="map-team-monster" title={m?.name}>
              {m && <MonsterImage monster={m} />}
            </span>
          );
        })}
        {save.team.length === 0 && <span>（まだ いないよ）</span>}
        <button className="btn btn-small" onClick={onTeam}>
          チームをかえる
        </button>
      </div>

      <div className="stage-list">
        {STAGES.map((stage, i) => {
          const unlocked = isUnlocked(i);
          const cleared = save.clearedStageIds.includes(stage.id);
          const star = save.stageStars[stage.id];
          const best = save.bestCorrect[stage.id];
          return (
            <button
              key={stage.id}
              className={[
                "stage-card",
                unlocked ? "" : "stage-locked",
                recommended?.id === stage.id ? "stage-recommended" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!unlocked}
              onClick={() => onSelectStage(stage.id)}
            >
              <span className="stage-icon">{unlocked ? stage.icon : "🔒"}</span>
              <span className="stage-info">
                <span className="stage-area">
                  ステージ{stage.level}：{stage.areaName}
                </span>
                <span className="stage-title">{stage.title}</span>
              </span>
              <span className="stage-status">
                {cleared && star === "gold" && <span>🌟</span>}
                {cleared && star === "silver" && <span>⭐</span>}
                {cleared && (
                  <span className="stage-best">
                    {best}/{stage.questions.length}
                  </span>
                )}
                {!cleared && unlocked && <span>▶</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mission-panel">
        <h3 className="panel-title">📅 きょうの ミッション</h3>
        {MISSIONS.map((m) => {
          const value = save.missions.counters[m.counter];
          const done = save.missions.doneIds.includes(m.id);
          return (
            <div key={m.id} className={`mission-row ${done ? "mission-done" : ""}`}>
              <span>
                {m.icon} {m.title}
              </span>
              <span>{done ? "✅ できた！" : `${Math.min(value, m.target)}/${m.target}`}</span>
            </div>
          );
        })}
      </div>

      <div className="map-footer">
        <button className="btn btn-secondary" onClick={onTeam}>
          🧸 なかま
        </button>
        <button className="btn btn-secondary" onClick={onDex}>
          📖 ずかん
        </button>
        <button className="btn btn-secondary" onClick={onProgress}>
          📊 せいせき
        </button>
      </div>
    </div>
  );
}
