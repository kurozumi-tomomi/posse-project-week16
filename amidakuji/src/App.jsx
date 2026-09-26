import { useState } from 'react'
import './App.css'

const LANE_COUNT = 5
const ROW_COUNT = 10
const STAGES = {
  1: { name: '肩ならし', level: 'やさしい', limit: 1, wins: 4, color: 'mint', defaultRungs: [{ row: 4, column: 2 }] },
  2: { name: '本気の勝負', level: 'ふつう', limit: 5, wins: 3, color: 'sun', defaultRungs: [{ row: 2, column: 1 }, { row: 7, column: 3 }] },
  3: { name: '炎の最終決戦', level: 'むずかしい', limit: 10, wins: 1, color: 'ember', defaultRungs: [{ row: 1, column: 2 }, { row: 4, column: 0 }, { row: 7, column: 3 }] },
}

function shuffledOutcomes(successCount) {
  const outcomes = [...Array(successCount).fill(true), ...Array(LANE_COUNT - successCount).fill(false)]
  for (let index = outcomes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentOutcome = outcomes[index]
    outcomes[index] = outcomes[swapIndex]
    outcomes[swapIndex] = currentOutcome
  }
  return outcomes
}

function App() {
  const [screen, setScreen] = useState('invite')
  const [stageNumber, setStageNumber] = useState(1)
  const [rungs, setRungs] = useState([])
  const [outcomes, setOutcomes] = useState([])
  const [selectedLane, setSelectedLane] = useState(null)
  const [result, setResult] = useState(null)
  const [tracePath, setTracePath] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const stage = STAGES[stageNumber]

  function startStage(number) {
    setStageNumber(number)
    setRungs(STAGES[number].defaultRungs.map((rung) => ({ ...rung })))
    setOutcomes(shuffledOutcomes(STAGES[number].wins))
    setSelectedLane(null)
    setResult(null)
    setTracePath('')
    setIsRunning(false)
    setScreen('stage')
  }

  function toggleRung(row, column) {
    if (isRunning) return
    const existing = rungs.find((rung) => rung.row === row && rung.column === column)
    if (existing) {
      setRungs(rungs.filter((rung) => rung !== existing))
      return
    }
    if (rungs.length >= stage.limit || rungs.some((rung) => rung.row === row)) return
    setRungs([...rungs, { row, column }])
  }

  function runLadder() {
    if (selectedLane === null || isRunning) return
    let lane = selectedLane
    const orderedRungs = [...rungs].sort((first, second) => first.row - second.row)
    let path = `M ${50 + lane * 100} 28`
    orderedRungs.forEach((rung) => {
      if (lane === rung.column || lane === rung.column + 1) {
        const y = 70 + rung.row * 40
        lane = lane === rung.column ? lane + 1 : lane - 1
        path += ` V ${y} H ${50 + lane * 100}`
      }
    })
    path += ' V 488'
    const didWin = outcomes[lane]
    setTracePath(path)
    setResult({ lane, didWin })
    setIsRunning(true)
  }

  function finishRun() {
    if (!isRunning || !result) return
    setIsRunning(false)
    setScreen(result.didWin ? (stageNumber === 3 ? 'clear' : 'dialogue') : 'gameover')
  }

  const routeRungs = result
    ? rungs.filter((rung) => rung.row < ROW_COUNT)
    : rungs

  return (
    <main className={`game-shell ${stageNumber === 3 ? 'final-stage' : ''} ${screen === 'clear' ? 'victory' : ''}`}>
      <header className="topbar">
        <a className="flex items-center brand" href="#top" onClick={(event) => event.preventDefault()} aria-label="あみだファイト ホーム">
          <span className="brand-mark">あ</span>
          <span>あみだファイト</span>
        </a>
        <div className="top-status"><span className="status-dot" /> きょうの運だめし</div>
      </header>

      {screen === 'invite' && (
        <section className="welcome-screen screen-enter" id="top">
          <div className="welcome-copy">
            <p className="eyebrow"><span>VOL. 01</span> LUCKY LADDER CHALLENGE</p>
            <h1>運命のルート、<br /><span>選ぶのはキミだ。</span></h1>
            <p className="intro-text">あみだの道をつないで、3つのステージを勝ち抜こう。<br />最後に待つのは、キミだけの大勝利！</p>
            <div className="welcome-actions">
              <button className="button button-primary" onClick={() => startStage(1)}>参加する <span aria-hidden="true">→</span></button>
              <button className="button button-quiet" onClick={() => setScreen('declined')}>今回はやめておく</button>
            </div>
            <div className="stage-teaser" aria-label="全3ステージ">
              <span className="teaser-number">01</span><span className="teaser-line" />
              <span className="teaser-number">02</span><span className="teaser-line" />
              <span className="teaser-number teaser-hot">03</span>
              <span className="teaser-label">3 STAGES · 1 CHANCE TO SHINE</span>
            </div>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="sunburst" />
            <div className="art-sticker sticker-one">LUCKY!</div>
            <div className="art-sticker sticker-two">GO!</div>
            <div className="mascot mascot-large"><span>🔥</span><i className="mascot-eye eye-left" /><i className="mascot-eye eye-right" /><b className="mascot-mouth" /></div>
            <div className="art-caption">きょうの主役は<br /><strong>キミ！</strong></div>
            <div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✳</div>
          </div>
          <div className="welcome-bottom"><span>START YOUR STORY</span><span>↓</span><span>SCROLL TO PLAY</span></div>
        </section>
      )}

      {screen === 'declined' && (
        <section className="message-screen screen-enter">
          <div className="mascot mascot-small" aria-hidden="true"><span>🔥</span></div>
          <p className="eyebrow">NEXT TIME, MAYBE</p>
          <h1>また次の機会に！</h1>
          <p className="intro-text">炎のチャレンジャーは、いつでも待ってるよ。</p>
          <button className="button button-primary" onClick={() => setScreen('invite')}>やっぱり参加する <span aria-hidden="true">→</span></button>
        </section>
      )}

      {screen === 'stage' && (
        <section className={`play-screen screen-enter stage-${stage.color}`}>
          <div className="play-heading">
            <div>
              <p className="eyebrow">STAGE 0{stageNumber} <span className="eyebrow-rule" /> {stage.level}</p>
              <h1>{stage.name}<span className="title-period">.</span></h1>
              <p className="play-subtitle">スタートを選んで、ゴールまでの道をつくろう。</p>
            </div>
            <div className="flex items-center progress-track" aria-label={`全3ステージ中 ${stageNumber} ステージ目`}>
              {[1, 2, 3].map((step) => <span key={step} className={`progress-step ${step <= stageNumber ? 'is-active' : ''} ${step === 3 ? 'is-final' : ''}`}>{`0${step}`}</span>)}
            </div>
          </div>

          <div className="play-layout">
            <section className="ladder-panel" aria-label="あみだくじ操作盤">
              <div className="ladder-toolbar">
                <div><span className="toolbar-kicker">YOUR COURSE</span><strong>あみだを組み立てよう</strong></div>
                <div className="rung-counter"><span>{rungs.length}</span><i>/</i>{stage.limit}<small>横棒</small></div>
              </div>
              <div className="start-label">START <span>スタートする棒を選択</span></div>
              <div className="ladder-canvas">
                <svg className="ladder-drawing" viewBox="0 0 500 520" preserveAspectRatio="none" aria-hidden="true">
                  {[50, 150, 250, 350, 450].map((x) => <line key={x} x1={x} y1="28" x2={x} y2="488" className="rail-line" />)}
                  {routeRungs.map((rung) => <line key={`${rung.row}-${rung.column}`} x1={50 + rung.column * 100} y1={70 + rung.row * 40} x2={150 + rung.column * 100} y2={70 + rung.row * 40} className="rung-line" />)}
                  {isRunning && <path key={`${stageNumber}-${tracePath}`} d={tracePath} pathLength="1" className="route-trace" onAnimationEnd={finishRun} />}
                </svg>
                <div className="start-picks">
                  {Array.from({ length: LANE_COUNT }, (_, lane) => <button key={lane} className={`lane-pick ${selectedLane === lane ? 'is-selected' : ''}`} onClick={() => setSelectedLane(lane)} disabled={isRunning} aria-label={`スタート ${lane + 1}番`} aria-pressed={selectedLane === lane}>{lane + 1}</button>)}
                </div>
                <div className="rung-hotspots">
                  {Array.from({ length: ROW_COUNT }, (_, row) => Array.from({ length: LANE_COUNT - 1 }, (_, column) => {
                    const active = rungs.some((rung) => rung.row === row && rung.column === column)
                    const occupied = rungs.some((rung) => rung.row === row && rung.column !== column)
                    const disabled = isRunning || (!active && (rungs.length >= stage.limit || occupied || Boolean(result)))
                    return <button key={`${row}-${column}`} className={`rung-hotspot ${active ? 'is-active' : ''}`} style={{ '--row': row, '--column': column }} onClick={() => toggleRung(row, column)} disabled={disabled} aria-label={`${row + 1}段目、${column + 1}番と${column + 2}番の棒を${active ? 'つなぐ横棒を外す' : '横棒でつなぐ'}`} aria-pressed={active}><span>{active ? '−' : '+'}</span></button>
                  }))}
                </div>
                <div className="goal-picks">
                  {Array.from({ length: LANE_COUNT }, (_, lane) => <div key={lane} className={`goal-pick ${!isRunning && result?.lane === lane ? (result.didWin ? 'goal-win' : 'goal-lose') : ''}`}><span>{!isRunning && result ? (outcomes[lane] ? 'WIN' : 'OUT') : '???'}</span></div>)}
                </div>
              </div>
              <div className="goal-label"><span>GOAL</span><span>横棒は隣同士の棒をつなげます</span></div>
              <p className="route-status" aria-live="polite">{isRunning ? 'あみだをたどっています…' : '横棒があると、道がとなりの棒へ移ります'}</p>
            </section>

            <aside className="game-aside">
              <div className="coach-card">
                <div className="coach-topline"><span>COACH FLAME</span><span className="coach-live">● LIVE</span></div>
                <div className="coach-portrait"><span className="coach-spark">✦</span><div className="mascot mascot-coach" aria-hidden="true"><span>🔥</span><i className="mascot-eye eye-left" /><i className="mascot-eye eye-right" /><b className="mascot-mouth" /></div></div>
                <p className="coach-quote">{stageNumber === 3 ? '最後の決戦だ！心を燃やして、道を見極めろ！' : '道は自分でつくれる！直感を信じて進もう！'}</p>
                <span className="coach-name">ファイア隊長 <span>炎の応援団長</span></span>
              </div>
              <div className="rules-card">
                <div className="rules-heading"><span>PLAY GUIDE</span><span className="guide-icon">?</span></div>
                <p>好きなスタート番号を選び、<br />「＋」で横棒をつなごう。</p>
                <div className="rule-divider" />
                <div className="rule-stat"><span>成功ゴール</span><strong>{stage.wins}<small> / 5</small></strong></div>
                <div className="rule-stat"><span>横棒の上限</span><strong>{stage.limit}<small> 本</small></strong></div>
              </div>
              <button className="button button-primary button-run" onClick={runLadder} disabled={selectedLane === null || isRunning}>{isRunning ? '運命のルートを確認中…' : 'このコースで挑戦'} <span aria-hidden="true">↗</span></button>
              <p className="run-hint">横棒 {rungs.length} / {stage.limit} 本 · スタート {selectedLane === null ? '未選択' : `${selectedLane + 1}番`}</p>
            </aside>
          </div>
        </section>
      )}

      {screen === 'dialogue' && (
        <section className="message-screen dialogue-screen screen-enter">
          <div className="dialogue-orbit" aria-hidden="true"><div className="mascot mascot-small"><span>🔥</span></div></div>
          <p className="eyebrow">STAGE 0{stageNumber} CLEAR</p>
          <h1>{stageNumber === 1 ? 'いい調子！' : 'ここまで来たね！'}</h1>
          <p className="dialogue-quote">「ナイスルート！次のステージも、キミの運とひらめきで突破だ！」</p>
          <p className="coach-signature">— ファイア隊長</p>
          <button className="button button-primary" onClick={() => startStage(stageNumber + 1)}>次のステージへ <span aria-hidden="true">→</span></button>
        </section>
      )}

      {screen === 'gameover' && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="gameover-title">
          <section className="result-modal gameover-modal screen-enter">
            <div className="result-stamp">ROUTE ENDED</div>
            <div className="mascot mascot-small mascot-sad" aria-hidden="true"><span>🔥</span></div>
            <p className="eyebrow">STAGE 0{stageNumber} · OUT</p>
            <h1 id="gameover-title">ここで脱落…！</h1>
            <p>選んだ道の先は、残念ながらハズレ。<br />挑戦してくれてありがとう！</p>
            <div className="result-actions"><button className="button button-primary" onClick={() => startStage(1)}>最初から挑戦 <span aria-hidden="true">↻</span></button><button className="button button-quiet" onClick={() => setScreen('invite')}>タイトルへ戻る</button></div>
          </section>
        </div>
      )}

      {screen === 'clear' && (
        <section className="message-screen clear-screen screen-enter">
          <div className="confetti confetti-one" /><div className="confetti confetti-two" /><div className="confetti confetti-three" />
          <p className="eyebrow">ALL STAGES COMPLETE</p>
          <div className="mascot mascot-small mascot-celebrate" aria-hidden="true"><span>🔥</span></div>
          <h1>完全勝利！</h1>
          <p className="intro-text">3ステージ突破、おめでとう！<br />今日のキミは、まちがいなく最強だ。</p>
          <p className="dialogue-quote">「最高の勝負だった！また一緒に燃え上がろう！」</p>
          <div className="clear-actions"><button className="button button-primary" onClick={() => startStage(1)}>もう一度参加する <span aria-hidden="true">↻</span></button><button className="button button-quiet" onClick={() => setScreen('invite')}>タイトルへ戻る</button></div>
        </section>
      )}

      <footer className="site-footer"><span>AMIDAFIGHT CLUB</span><span>LUCK IS A ROUTE YOU MAKE.</span><span>© 2026</span></footer>
    </main>
  )
}

export default App