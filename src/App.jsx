import './App.css'
import { useState, useEffect, useCallback, useRef } from 'react'
import categories from './categories'
import { splitAnswer } from './answers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faGithubSquare, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import Snowfall from 'react-snowfall'

const THEMES = {
  vm2026: {
    label: 'VM 2026 ⚽',
    title: '⚽ VM 2026',
    subtitle: 'Topp 10 – fotballutgave',
    colors: {
      '--dark-background-color': '#0a3d2e',
      '--light-background-color': '#0a3d2e',
      '--light-text-color': 'rgba(255, 255, 255, 0.92)',
      '--accent-color': '#ffd24a',
    },
  },
  summer: {
    label: 'Sommer 2024 ☀️',
    title: 'Topp 10',
    subtitle: 'Sommer 2024',
    colors: {
      '--dark-background-color': '#0f6e8c',
      '--light-background-color': '#0f6e8c',
      '--light-text-color': 'rgba(255, 255, 255, 0.92)',
      '--accent-color': '#ffd84d',
    },
  },
  default: {
    label: 'Normal',
    title: 'Topp 10',
    colors: {
      '--dark-background-color': '#242424',
      '--light-background-color': '#ffffff',
      '--light-text-color': '#213547',
      '--accent-color': '#646cff',
    },
  },
  christmas: {
    label: 'Jul 2023 🎄',
    title: 'Topp 10',
    subtitle: 'Jul 2023',
    colors: {
      '--dark-background-color': '#5d0707',
      '--light-background-color': '#5d0707',
      '--light-text-color': 'rgba(255, 255, 255, 0.87)',
      '--accent-color': '#e8b923',
    },
  },
}


function App() {

  const [gamestate, setGamestate] = useState('start')
  const [selectedId, setSelectedId] = useState(0)
  const [answersVisible, setAnswersVisible] = useState(false)
  const [theme, setTheme] = useState('default')
  const [teams, setTeams] = useState([''])
  const [activeTeam, setActiveTeam] = useState(0)
  const standingsDialog = useRef(null)
  // false = play without teams; nobody keeps score and the fasit is just shown.
  const [scoring, setScoring] = useState(true)
  // results[questionIndex][teamIndex] = { place } – place is 1–10 (= points), 0 (not on list) or undefined (not scored yet).
  const [results, setResults] = useState({})

  const questions = categories[theme]
  const current = questions[selectedId]
  const currentResults = results[selectedId] || {}

  const scores = teams.map((_, team) =>
    Object.values(results).reduce((sum, question) => sum + (question[team]?.place || 0), 0)
  )

  // Apply the theme's colours whenever the theme changes.
  useEffect(() => {
    const root = document.querySelector(':root')
    Object.entries(THEMES[theme].colors).forEach(([prop, value]) => {
      root.style.setProperty(prop, value)
    })
  }, [theme])

  // Start each screen and question at the top (matters on mobile, where the list scrolls).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [gamestate, selectedId])

  const firstUnscored = useCallback((questionResults = {}, after = -1) => {
    const order = teams.map((_, i) => (after + 1 + i) % teams.length)
    const team = order.find((i) => questionResults[i]?.place == null)
    return team ?? Math.max(after, 0)
  }, [teams])

  // Give the active team a place, then jump to the next team that hasn't been scored this round.
  const assign = (place) => {
    const team = activeTeam
    const questionResults = { ...currentResults, [team]: { place: currentResults[team]?.place === place ? null : place } }
    setResults({ ...results, [selectedId]: questionResults })
    setActiveTeam(firstUnscored(questionResults, team))
  }

  const goTo = useCallback((id) => {
    setSelectedId(id)
    // Questions that already have points open with the fasit shown.
    setAnswersVisible(Object.values(results[id] || {}).some((r) => r.place != null))
    setActiveTeam(firstUnscored(results[id]))
  }, [results, firstUnscored])

  const start = (withScoring = scoring) => {
    setScoring(withScoring)
    if (withScoring) setTeams(teams.map((t) => t.trim()).filter(Boolean))
    setResults({})
    setSelectedId(0)
    setAnswersVisible(false)
    setActiveTeam(0)
    setGamestate('started')
  }

  const next = useCallback(() => {
    if (selectedId === questions.length - 1) {
      setGamestate('finished')
      return
    }
    goTo(selectedId + 1)
  }, [selectedId, questions.length, goTo])

  const previous = useCallback(() => {
    if (selectedId === 0) return
    goTo(selectedId - 1)
  }, [selectedId, goTo])

  const showAnswers = useCallback(() => {
    setAnswersVisible(true)
    setActiveTeam(firstUnscored(results[selectedId]))
  }, [results, selectedId, firstUnscored])

  const backToLast = () => {
    goTo(questions.length - 1)
    setGamestate('started')
  }

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    setResults({})
    setSelectedId(0)
    setAnswersVisible(false)
  }

  // Keyboard navigation while playing (ignored while typing in a field).
  useEffect(() => {
    if (gamestate !== 'started') return
    const handler = (event) => {
      if (event.target.closest('input')) return
      if (event.key === 'ArrowRight') next()
      else if (event.key === 'ArrowLeft') previous()
      else if ((event.key === ' ' || event.key === 'Enter') && !answersVisible) {
        event.preventDefault()
        showAnswers()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gamestate, answersVisible, next, previous, showAnswers])

  const homeButton = <button onClick={() => setGamestate('start')}>Hjem</button>
  const validTeams = teams.filter((t) => t.trim()).length > 0
  const standings = teams
    .map((name, i) => ({ name, score: scores[i], round: currentResults[i]?.place }))
    .sort((a, b) => b.score - a.score)
  const unscored = answersVisible && teams.some((_, team) => currentResults[team]?.place == null)

  const renderState = () => {
    switch (gamestate) {
      case 'start':
        return (
          <div className="screen center">
            <h1 className="title">{THEMES[theme].title}</h1>
            {THEMES[theme].subtitle && <p className="subtitle">{THEMES[theme].subtitle}</p>}
            <div className="stack">
              <button className="primary" onClick={() => setGamestate('teams')}>Nytt spill</button>
              <button onClick={() => setGamestate('rules')}>Regler</button>
              <button onClick={() => setGamestate('settings')}>Utgave: {THEMES[theme].label}</button>
            </div>
          </div>
        )
      case 'teams':
        return (
          <div className="screen center">
            <h1>Hvem spiller?</h1>
            <p className="hint">Skriv inn navnet på hvert lag eller hver spiller.</p>
            <form className="stack" onSubmit={(e) => { e.preventDefault(); if (validTeams) start() }}>
              {teams.map((name, i) => (
                <div className="teamRow" key={i}>
                  <input
                    value={name}
                    onChange={(e) => setTeams(teams.map((t, j) => (j === i ? e.target.value : t)))}
                    placeholder={`Lag ${i + 1}`}
                    aria-label={`Navn på lag ${i + 1}`}
                    maxLength={30}
                  />
                  {teams.length > 1 &&
                    <button type="button" onClick={() => setTeams(teams.filter((_, j) => j !== i))} aria-label={`Fjern ${name || `lag ${i + 1}`}`}>
                      <FontAwesomeIcon icon={faXmark} />
                    </button>}
                </div>
              ))}
              <button type="button" onClick={() => setTeams([...teams, ''])}>+ Legg til lag</button>
              <button type="submit" className="primary" disabled={!validTeams}>Start</button>
              <button type="button" onClick={() => start(false)}>Spill uten poeng</button>
              {homeButton}
            </form>
          </div>
        )
      case 'started':
        return (
          <div className="screen game">
            <header className="topbar">
              <button onClick={() => setGamestate('start')}>Hjem</button>
              {scoring ? <button onClick={() => standingsDialog.current.showModal()}>Stilling</button> : <span />}
              <span className="counter">{selectedId + 1}/{questions.length}</span>
            </header>
            <main className="question">
              <h1>{current.navn}</h1>
              {!answersVisible &&
                <>
                  <p className="hint">{scoring ? 'Alle lag sier svaret sitt høyt før fasiten vises.' : 'Alle gjetter før fasiten vises.'}</p>
                  <button className="primary reveal" onClick={showAnswers}>Vis fasit</button>
                </>}
              {answersVisible &&
                <>
                  {scoring && <div className="scoringBar">
                    <div className="teamSwitcher">
                      <button
                        onClick={() => setActiveTeam((activeTeam - 1 + teams.length) % teams.length)}
                        aria-label="Forrige lag"
                        disabled={teams.length < 2}
                      >‹</button>
                      <div className="activeTeam" aria-live="polite">
                        <strong>{teams[activeTeam]}</strong>
                        <span>
                          {scores[activeTeam]} poeng
                          {currentResults[activeTeam]?.place != null && ` (+${currentResults[activeTeam].place})`}
                          {teams.length > 1 && ` · ${teams.filter((_, team) => currentResults[team]?.place != null).length} av ${teams.length} ferdig`}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTeam((activeTeam + 1) % teams.length)}
                        aria-label="Neste lag"
                        disabled={teams.length < 2}
                      >›</button>
                    </div>
                  </div>}
                  <ol className="answers">
                    {current.fasit.map((fasit, index) => {
                      const [name, value] = splitAnswer(fasit)
                      const hitBy = teams.filter((_, team) => currentResults[team]?.place === index + 1)
                      const mine = currentResults[activeTeam]?.place === index + 1
                      // Rows are only tappable when someone keeps score.
                      const Row = scoring ? 'button' : 'div'
                      return (
                        <li key={index}>
                          <Row className={`answerRow${mine ? ' active' : ''}`} onClick={scoring ? () => assign(index + 1) : undefined}>
                            <span className="rank">{index + 1}</span>
                            <span className="name">
                              {name}
                              {hitBy.length > 0 && <span className="hits">{hitBy.join(', ')}</span>}
                            </span>
                            {value && <span className="value">{value}</span>}
                          </Row>
                        </li>
                      )
                    })}
                    {scoring && <li className="missItem">
                      <button
                        className={`answerRow miss${currentResults[activeTeam]?.place === 0 ? ' active' : ''}`}
                        onClick={() => assign(0)}
                      >
                        <span className="rank">0</span>
                        <span className="name">
                          Ikke på listen
                          {teams.some((_, team) => currentResults[team]?.place === 0) &&
                            <span className="hits">{teams.filter((_, team) => currentResults[team]?.place === 0).join(', ')}</span>}
                        </span>
                      </button>
                    </li>}
                  </ol>
                  {current.kilde &&
                    <a className="source" href={current.kilde} target='_blank' rel='noopener noreferrer'>
                      Kilde{current.år && ` (${current.år})`}
                    </a>}
                </>}
            </main>
            <dialog ref={standingsDialog} className="standingsDialog" onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}>
              <h2>Stilling</h2>
              <ol className="standings">
                {standings.map(({ name, score, round }, i) => (
                  <li key={i}>
                    <span>{name}</span>
                    <span>{round != null && <span className="roundPoints">+{round}</span>}<strong>{score}</strong></span>
                  </li>
                ))}
              </ol>
              <form method="dialog"><button className="primary">Lukk</button></form>
            </dialog>
            <nav className="navigation">
              <button onClick={previous} disabled={selectedId === 0}>‹ Forrige</button>
              <button className={answersVisible && !unscored ? 'primary' : ''} onClick={next}>
                {selectedId === questions.length - 1 ? 'Se resultat' : 'Neste ›'}
              </button>
            </nav>
          </div>
        )
      case 'finished':
        return (
          <div className="screen center">
            <h1>{scoring && standings.length > 1 ? `${standings[0].name} vant!` : 'Takk for at dere spilte!'}</h1>
            {scoring &&
              <ol className="standings">
                {standings.map(({ name, score }, i) => (
                  <li key={i}><span>{name}</span><strong>{score} poeng</strong></li>
                ))}
              </ol>}
            <div className="stack">
              <button className="primary" onClick={() => start()}>Spill igjen</button>
              <button onClick={backToLast}>Tilbake</button>
              {homeButton}
            </div>
            <p className="madeby">Laget av Peter Skaar Nordby</p>
            <div className="socialmedia">
              <a href="https://www.instagram.com/peter.nordby/" target='_blank' rel='noopener noreferrer' aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} size='2xl' />
              </a>
              <a href="https://www.linkedin.com/in/peternordby/" target='_blank' rel='noopener noreferrer' aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedin} size='2xl' />
              </a>
              <a href="https://github.com/peternordby" target='_blank' rel='noopener noreferrer' aria-label="GitHub">
                <FontAwesomeIcon icon={faGithubSquare} size='2xl' />
              </a>
            </div>
          </div>
        )
      case 'rules':
        return (
          <div className="screen center">
            <h1>Regler</h1>
            <div className="rules">
              <ol>
                <li>Én person er spillvert og styrer appen. Spillverten skriver inn navnet på lagene før spillet starter.</li>
                <li>Hver runde viser en kategori, for eksempel «Største land etter areal». Svaret er en skjult topp 10-liste.</li>
                <li>Hvert lag sier høyt ett svar de tror står på listen.</li>
                <li>Spillverten trykker «Vis fasit».</li>
                <li>Hvert lag får like mange poeng som plassen svaret har: plass 1 gir 1 poeng, plass 10 gir 10 poeng. Står det ikke på listen, blir det 0.</li>
                <li>Trykk «Neste ›» for å gå videre. Laget med flest poeng etter siste runde vinner!</li>
              </ol>
              <p><strong>Tips:</strong> Det mest opplagte svaret er ofte nummer 1 og gir bare 1 poeng. Tør dere å gjette noe lenger ned, kan det gi mye mer.</p>
              <p><strong>For spillverten:</strong> Når fasiten vises, er ett lag markert. Trykk på svaret laget gjettet, eller «ikke på listen», så går appen videre til neste lag. Trykket feil? Velg laget og trykk på riktig svar. Du kan også gå tilbake til tidligere runder og endre poengene.</p>
              <p><strong>Uten poeng:</strong> Vil dere bare spille for moro skyld? Trykk «Spill uten poeng» i stedet for å skrive inn lag, så vises bare kategoriene og fasiten.</p>
              <p><strong>På PC:</strong> Bruk piltastene for å bla og mellomrom for å vise fasit.</p>
            </div>
            {homeButton}
          </div>
        )
      case 'settings':
        return (
          <div className="screen center">
            <h1>Velg utgave</h1>
            <div className="stack">
              {Object.entries(THEMES).map(([key, { label }]) => (
                <button
                  key={key}
                  className={theme === key ? 'themeBtn active' : 'themeBtn'}
                  aria-pressed={theme === key}
                  onClick={() => { changeTheme(key); setGamestate('start') }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )
      default:
        return <h1>Ukjent spilltilstand</h1>
    }
  }

  return (
    <>
      {theme === 'christmas' && <Snowfall color='rgba(255, 255, 255, 0.6)' />}
      <div className="App">
        {renderState()}
      </div>
    </>
  )
}

export default App
