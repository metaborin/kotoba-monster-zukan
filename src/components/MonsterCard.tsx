import type { KotobaMonster } from "../types/monster";
import type { MonsterProgress } from "../types/progress";
import { levelTitle, xpToNextLevel, MAX_LEVEL } from "../utils/monsterLogic";
import { MonsterImage } from "./MonsterImage";

type Props = {
  monster: KotobaMonster;
  progress?: MonsterProgress;
  owned: boolean;
  compact?: boolean;
  glow?: boolean;
  bounce?: boolean;
  onClick?: () => void;
  selected?: boolean;
};

export function MonsterCard({
  monster,
  progress,
  owned,
  compact = false,
  glow = false,
  bounce = false,
  onClick,
  selected = false,
}: Props) {
  const level = progress?.level ?? 1;
  const xp = progress?.xp ?? 0;
  const next = xpToNextLevel(xp);

  const classes = [
    "monster-card",
    `monster-lv${owned ? level : 0}`,
    compact ? "monster-card-compact" : "",
    glow ? "card-glow" : "",
    bounce ? "card-bounce" : "",
    selected ? "monster-card-selected" : "",
    onClick ? "monster-card-clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!owned) {
    return (
      <div className={classes} onClick={onClick}>
        <div className="monster-icon monster-icon-unknown">
          <MonsterImage monster={monster} unknown />
        </div>
        <div className="monster-name">？？？</div>
        {!compact && (
          <div className="monster-desc">まだ であっていないよ</div>
        )}
      </div>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      <div className="monster-top-row">
        {level >= 5 && <span className="monster-crown">👑</span>}
        {level >= 4 && <span className="monster-sparkle">✨</span>}
      </div>
      <div className="monster-icon">
        <MonsterImage monster={monster} />
      </div>
      <div className="monster-name">{monster.name}</div>
      <div className="monster-level-stars">
        {"★".repeat(level)}
        {"☆".repeat(MAX_LEVEL - level)}
      </div>
      <div className="monster-level-label">
        Lv.{level} {levelTitle(level)}
      </div>
      {!compact && (
        <>
          <div className="monster-element">とくい：{monster.element}</div>
          <div className="monster-desc">{monster.description}</div>
          {level >= 3 && (
            <div className="monster-skill">
              💫 {monster.skillName}
              <span className="monster-skill-desc">
                {monster.skillDescription}
              </span>
            </div>
          )}
          <div className="monster-xp">
            XP: {xp}
            {next !== null ? (
              <span className="monster-xp-next">
                （つぎまで あと {next}）
              </span>
            ) : (
              <span className="monster-xp-next">（さいだいレベル！）</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
