import { useMemo, useState } from "react";
import type { Stage, QuizQuestion } from "../types/quiz";
import type { SaveData, BattleOutcome } from "../types/progress";
import { getMonster } from "../data/monsters";
import {
  answerReward,
  comboMessage,
  MAX_HEARTS,
  PERFECT_POWER_BONUS,
  PERFECT_XP_BONUS,
  shuffle,
} from "../utils/gameLogic";
import { MonsterImage } from "./MonsterImage";

type Phase = "answering" | "correct" | "wrong";

type Props = {
  stage: Stage;
  save: SaveData;
  practice: boolean;
  onFinish: (outcome: BattleOutcome) => void;
  onQuit: () => void;
};

export function QuizBattleScreen({
  stage,
  save,
  practice,
  onFinish,
  onQuit,
}: Props) {
  const questions = stage.questions;
  const [qIndex, setQIndex] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [phase, setPhase] = useState<Phase>("answering");
  const [combo, setCombo] = useState(0);
  const [power, setPower] = useState(0);
  const [xp, setXp] = useState(0);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [missedThisQuestion, setMissedThisQuestion] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [orderPicked, setOrderPicked] = useState<string[]>([]);
  const [starBurst, setStarBurst] = useState(0);
  const [lastGain, setLastGain] = useState(0);

  const question: QuizQuestion = questions[qIndex];

  // ステージと あう なかまが いると ヒントが みやすい（ノーカウント）
  const stageElement = getMonster(stage.rewardMonsterId)?.element;
  const helper = save.team
    .map((id) => getMonster(id))
    .find((m) => m && m.element === stageElement);
  const hintFree = Boolean(helper);

  const shuffledChoices = useMemo(
    () => (question.choices ? shuffle(question.choices) : []),
    [question],
  );

  const cheer = useMemo(() => {
    const team = save.team.map((id) => getMonster(id)).filter(Boolean);
    if (team.length === 0) return "ことばパワーで チャレンジしよう！";
    const m = team[Math.floor(Math.random() * team.length)]!;
    const lines = [
      `${m.name}が おうえんしているよ！`,
      `${m.name}「いっしょに がんばろう！」`,
      `${m.name}が ワクワクして みているよ！`,
    ];
    return lines[qIndex % lines.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, save.team]);

  const buildOutcome = (
    finalCorrect: string[],
    finalWrong: string[],
    finalPower: number,
    finalXp: number,
    endedEarly: boolean,
  ): BattleOutcome => {
    const perfect =
      !endedEarly &&
      finalCorrect.length === questions.length &&
      finalWrong.length === 0;
    return {
      stageId: stage.id,
      practice,
      total: questions.length,
      correct: finalCorrect.length,
      power: finalPower + (perfect ? PERFECT_POWER_BONUS : 0),
      xp: finalXp + (perfect ? PERFECT_XP_BONUS : 0),
      perfect,
      wrongQuestionIds: finalWrong,
      correctQuestionIds: finalCorrect,
      endedEarly,
    };
  };

  const goNext = () => {
    if (qIndex + 1 >= questions.length) {
      onFinish(buildOutcome(correctIds, wrongIds, power, xp, false));
      return;
    }
    setQIndex(qIndex + 1);
    setPhase("answering");
    setMissedThisQuestion(false);
    setHintOpen(false);
    setHintUsed(false);
    setOrderPicked([]);
  };

  const handleCorrect = () => {
    let newCorrectIds = correctIds;
    let newPower = power;
    let newXp = xp;
    if (!missedThisQuestion) {
      const newCombo = combo + 1;
      const reward = answerReward(hintUsed, hintFree, newCombo);
      newCorrectIds = [...correctIds, question.id];
      newPower = power + reward.power;
      newXp = xp + reward.xp;
      setCombo(newCombo);
      setCorrectIds(newCorrectIds);
      setPower(newPower);
      setXp(newXp);
      setLastGain(reward.power);
    } else {
      setLastGain(0);
    }
    setStarBurst((n) => n + 1);
    setPhase("correct");
  };

  const handleWrong = () => {
    setCombo(0);
    let newWrongIds = wrongIds;
    if (!missedThisQuestion) {
      newWrongIds = [...wrongIds, question.id];
      setWrongIds(newWrongIds);
      setMissedThisQuestion(true);
    }
    setPhase("wrong");
    if (!practice) {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      if (newHearts <= 0) {
        // ハートが なくなったら、ここまでの けっかで おわる
        setTimeout(() => {
          onFinish(buildOutcome(correctIds, newWrongIds, power, xp, true));
        }, 1400);
        return;
      }
    }
  };

  const answerChoice = (choice: string) => {
    if (phase === "correct") return;
    if (choice === question.answer) {
      handleCorrect();
    } else {
      handleWrong();
    }
  };

  const pickOrderWord = (word: string, index: number) => {
    if (phase === "correct") return;
    const key = `${word}-${index}`;
    if (orderPicked.includes(key)) return;
    setOrderPicked([...orderPicked, key]);
  };

  const removeOrderWord = (key: string) => {
    if (phase === "correct") return;
    setOrderPicked(orderPicked.filter((k) => k !== key));
  };

  const checkOrder = () => {
    const picked = orderPicked.map((k) => k.slice(0, k.lastIndexOf("-")));
    const answer = question.answer as string[];
    const ok =
      picked.length === answer.length &&
      picked.every((w, i) => w === answer[i]);
    if (ok) {
      handleCorrect();
    } else {
      setOrderPicked([]);
      handleWrong();
    }
  };

  const renderFillQuestion = () => {
    const parts = question.question.split("□");
    return (
      <span>
        {parts[0]}
        <span className="fill-blank">□</span>
        {parts[1]}
      </span>
    );
  };

  return (
    <div className={`screen battle-screen ${phase === "wrong" ? "shake-soft" : ""}`}>
      <div className="battle-top">
        <button
          className="btn btn-small btn-back"
          onClick={() => {
            if (window.confirm("とちゅうで マップに もどる？")) onQuit();
          }}
        >
          ×
        </button>
        <div className="battle-hearts">
          {practice
            ? "れんしゅうちゅう 📝"
            : Array.from({ length: MAX_HEARTS }).map((_, i) => (
                <span key={i} className={i < hearts ? "" : "heart-empty"}>
                  {i < hearts ? "❤️" : "🤍"}
                </span>
              ))}
        </div>
        <div className="battle-meta">
          <span>⚡ {power}</span>
          <span>
            もんだい {qIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="battle-team">
        {save.team.map((id) => {
          const m = getMonster(id);
          if (!m) return null;
          const isHelper = helper && m.id === helper.id;
          return (
            <span
              key={id}
              className={`battle-team-monster ${isHelper ? "battle-helper" : ""}`}
              title={m.name}
            >
              <MonsterImage monster={m} />
            </span>
          );
        })}
        <span className="battle-cheer">{cheer}</span>
      </div>

      {combo >= 2 && phase !== "wrong" && (
        <div className="combo-banner combo-pop" key={combo}>
          🔥 {comboMessage(combo)}
        </div>
      )}

      <div className="battle-card">
        {question.storyText && (
          <div className="story-box">📖 {question.storyText}</div>
        )}
        <div className="battle-question">
          {question.type === "fill" ? renderFillQuestion() : question.question}
        </div>
        {question.type === "fill" && (
          <div className="battle-subnote">□に はいる もじを えらぼう</div>
        )}

        {question.type === "order" ? (
          <div className="order-area">
            <div className="order-answer-row">
              {orderPicked.length === 0 && (
                <span className="order-placeholder">
                  ことばを じゅんばんに タップしてね
                </span>
              )}
              {orderPicked.map((key) => (
                <button
                  key={key}
                  className="choice-btn order-picked"
                  onClick={() => removeOrderWord(key)}
                >
                  {key.slice(0, key.lastIndexOf("-"))}
                </button>
              ))}
            </div>
            <div className="choices-grid">
              {shuffledChoices.map((word, i) => {
                const key = `${word}-${i}`;
                const used = orderPicked.includes(key);
                return (
                  <button
                    key={key}
                    className="choice-btn"
                    disabled={used || phase === "correct"}
                    style={used ? { visibility: "hidden" } : undefined}
                    onClick={() => pickOrderWord(word, i)}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
            {orderPicked.length === shuffledChoices.length &&
              phase !== "correct" && (
                <button className="btn btn-primary btn-big" onClick={checkOrder}>
                  ✅ こたえあわせ
                </button>
              )}
          </div>
        ) : (
          <div className="choices-grid">
            {shuffledChoices.map((choice) => (
              <button
                key={choice}
                className="choice-btn"
                disabled={phase === "correct"}
                onClick={() => answerChoice(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {phase === "correct" && (
          <div className="feedback feedback-correct">
            <div className="feedback-title combo-pop">🎉 せいかい！</div>
            {lastGain > 0 ? (
              <div>ことばパワーが たまった！ ⚡+{lastGain}</div>
            ) : (
              <div>やったね！ つぎへ すすもう！</div>
            )}
            <div className="star-burst" key={starBurst}>
              <span>⭐</span>
              <span>✨</span>
              <span>⭐</span>
              <span>🌟</span>
              <span>✨</span>
            </div>
            <button className="btn btn-primary btn-big" onClick={goNext}>
              {qIndex + 1 >= questions.length ? "けっかを みる ▶" : "つぎへ ▶"}
            </button>
          </div>
        )}

        {phase === "wrong" && (
          <div className="feedback feedback-wrong">
            <div className="feedback-title">
              {hearts > 0 || practice
                ? "もういちど やってみよう！"
                : "ここまで よく がんばったね！"}
            </div>
            {(hearts > 0 || practice) && (
              <div>ヒントを みれば だいじょうぶ！</div>
            )}
          </div>
        )}

        {phase !== "correct" && (
          <div className="hint-area">
            <button
              className={`btn btn-hint ${hintFree ? "btn-hint-free" : ""}`}
              onClick={() => {
                setHintOpen(true);
                setHintUsed(true);
              }}
            >
              💡 ヒント
              {hintFree && helper && (
                <span className="hint-helper-note">
                  <MonsterImage monster={helper} /> {helper.name}が てつだってくれる！
                </span>
              )}
            </button>
            {hintOpen && <div className="hint-box">💡 {question.hint}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
