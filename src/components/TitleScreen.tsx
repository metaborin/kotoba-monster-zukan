type Props = {
  hasProgress: boolean;
  onStart: () => void;
  onContinue: () => void;
  onDex: () => void;
  onProgress: () => void;
  onReset: () => void;
  isMaster: boolean;
};

export function TitleScreen({
  hasProgress,
  onStart,
  onContinue,
  onDex,
  onProgress,
  onReset,
  isMaster,
}: Props) {
  return (
    <div className="screen title-screen">
      <div className="title-hero">🧢</div>
      <h1 className="title-logo">
        <span className="title-line1">ことばモンスターずかん</span>
        <span className="title-line2">1ねんせい</span>
      </h1>
      <p className="title-sub">
        こくごの もんだいを といて、
        <br />
        ことばモンスターと なかよく なろう！
      </p>
      {isMaster && (
        <div className="master-badge combo-pop">
          👑 きみは ことばマスター！ 👑
        </div>
      )}
      <div className="title-buttons">
        <button className="btn btn-primary btn-big" onClick={onStart}>
          🚀 ぼうけんを はじめる
        </button>
        {hasProgress && (
          <button className="btn btn-secondary btn-big" onClick={onContinue}>
            📍 つづきから
          </button>
        )}
        <button className="btn btn-secondary" onClick={onDex}>
          📖 ずかん
        </button>
        <button className="btn btn-secondary" onClick={onProgress}>
          📊 せいせき
        </button>
      </div>
      <button className="btn-text-reset" onClick={onReset}>
        はじめから やりなおす
      </button>
    </div>
  );
}
