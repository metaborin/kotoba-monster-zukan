import { MONSTERS } from "../data/monsters";
import type { SaveData } from "../types/progress";
import { MonsterCard } from "./MonsterCard";
import { StatusBar } from "./StatusBar";

const TEAM_SIZE = 3;

type Props = {
  save: SaveData;
  onChangeTeam: (team: string[]) => void;
  onBack: () => void;
};

export function TeamScreen({ save, onChangeTeam, onBack }: Props) {
  const owned = MONSTERS.filter((m) => save.unlockedMonsterIds.includes(m.id));

  const toggle = (id: string) => {
    if (save.team.includes(id)) {
      onChangeTeam(save.team.filter((t) => t !== id));
    } else if (save.team.length < TEAM_SIZE) {
      onChangeTeam([...save.team, id]);
    }
  };

  return (
    <div className="screen team-screen">
      <StatusBar save={save} onBack={onBack} backLabel="マップ" />
      <h2 className="screen-title">🧸 なかまチーム</h2>
      <p className="screen-note">
        チームに いれる なかまを {TEAM_SIZE}たいまで えらぼう。
        <br />
        ステージに あった なかまが いると、ヒントが みやすくなるよ！
      </p>

      <div className="team-slots">
        {Array.from({ length: TEAM_SIZE }).map((_, i) => {
          const id = save.team[i];
          const monster = id ? MONSTERS.find((m) => m.id === id) : undefined;
          return (
            <div key={i} className="team-slot">
              {monster ? (
                <>
                  <span className="team-slot-icon">{monster.icon}</span>
                  <span className="team-slot-name">{monster.name}</span>
                </>
              ) : (
                <span className="team-slot-empty">あき</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="monster-grid">
        {owned.map((m) => {
          const inTeam = save.team.includes(m.id);
          return (
            <div key={m.id} className="team-card-wrap">
              <MonsterCard
                monster={m}
                progress={save.monsters[m.id]}
                owned
                compact
                selected={inTeam}
                onClick={() => toggle(m.id)}
              />
              <button
                className={`btn btn-small ${inTeam ? "btn-out" : "btn-primary"}`}
                onClick={() => toggle(m.id)}
                disabled={!inTeam && save.team.length >= TEAM_SIZE}
              >
                {inTeam
                  ? "チームから はずす"
                  : save.team.length >= TEAM_SIZE
                    ? "チームが いっぱい"
                    : "チームに いれる"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
