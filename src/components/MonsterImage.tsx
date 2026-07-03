import { useState } from "react";
import type { KotobaMonster } from "../types/monster";

type Props = {
  monster: KotobaMonster;
  unknown?: boolean;
  className?: string;
};

export function MonsterImage({ monster, unknown = false, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const classes = [
    "monster-image",
    failed ? "monster-image-fallback" : "",
    unknown ? "monster-image-unknown" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (failed) {
    return (
      <span className={classes} role="img" aria-label={unknown ? "？？？" : monster.name}>
        {unknown ? "❓" : monster.icon}
      </span>
    );
  }

  return (
    <img
      className={classes}
      src={monster.image}
      alt={unknown ? "？？？" : monster.name}
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
