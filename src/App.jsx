import './App.css'
import { useState, useEffect, useCallback } from 'react'
import categories from './categories'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faGithubSquare, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faUndo } from '@fortawesome/free-solid-svg-icons'
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
    label: 'Sommer 2023',
    title: 'Topp 10',
    subtitle: 'Sommer 2023',
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
  const [points, setPoints] = useState(0)
  const [pointsHistory, setPointsHistory] = useState([])
  const [pointsVisible, setPointsVisible] = useState(false)
  const [theme, setTheme] = useState('vm2026')

  const questions = categories[theme]
  const current = questions[selectedId]

  // Apply the theme's colours whenever the theme changes.
  useEffect(() => {
    const root = document.querySelector(':root')
    Object.entries(THEMES[theme].colors).forEach(([prop, value]) => {
      root.style.setProperty(prop, value)
    })
  }, [theme])

  const start = () => {
    setSelectedId(0)
    setAnswersVisible(false)
    setGamestate('started')
  }

  const next = useCallback(() => {
    if (selectedId === questions.length - 1) {
      setGamestate('finished')
      return
    }
    setSelectedId(selectedId + 1)
    setAnswersVisible(false)
  }, [selectedId, questions.length])

  const previous = useCallback(() => {
    if (selectedId === 0) {
      setGamestate('start')
      return
    }
    setSelectedId(selectedId - 1)
    setAnswersVisible(false)
  }, [selectedId])

  const backToLast = () => {
    setSelectedId(questions.length - 1)
    setGamestate('started')
  }

  const backToStart = () => {
    setSelectedId(0)
    setGamestate('start')
  }

  const showAnswers = () => {
    setAnswersVisible(true)
  }

  const togglePoints = () => {
    setPointsVisible(!pointsVisible)
  }

  const updatePoints = (value) => {
    setPointsHistory([...pointsHistory, points])
    setPoints(points + value)
    setPointsVisible(false)
  }

  const undoPoints = () => {
    if (pointsHistory.length === 0) return
    setPoints(pointsHistory[pointsHistory.length - 1])
    setPointsHistory(pointsHistory.slice(0, -1))
  }

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    setSelectedId(0)
    setAnswersVisible(false)
  }

  // Keyboard navigation while playing.
  useEffect(() => {
    if (gamestate !== 'started') return
    const handler = (event) => {
      if (event.key === 'ArrowRight') next()
      else if (event.key === 'ArrowLeft') previous()
      else if ((event.key === ' ' || event.key === 'Enter') && !answersVisible) {
        event.preventDefault()
        showAnswers()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gamestate, answersVisible, next, previous])

  const renderState = () => {
    switch (gamestate) {
      case 'start':
        return (
          <>
            <div className="start">
              <h1>{THEMES[theme].title}</h1>
              {THEMES[theme].subtitle && <p className="subtitle">{THEMES[theme].subtitle}</p>}
              <div className="buttons">
                <button onClick={start}>Start</button>
                <button onClick={() => { setGamestate("rules") }}>Regler</button>
                <button onClick={() => { setGamestate("settings") }}>Innstillinger</button>
              </div>
            </div>
          </>
        )
      case 'started':
        return (
          <>
            <div>
              <button onClick={togglePoints}>Poeng: {points}</button>
              {pointsHistory.length > 0 && <button onClick={undoPoints} style={{ marginLeft: '10px' }}>
                <FontAwesomeIcon icon={faUndo} size='l' />
              </button>}
            </div>
            {pointsVisible && <div className="pointPicker">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button key={value} className="pointBtn" onClick={() => updatePoints(value)}>+{value}</button>
              ))}
            </div>}
            {!pointsVisible && <h1>{current.navn}</h1>}
            {!answersVisible && <button onClick={showAnswers}>Vis Fasit</button>}
            {answersVisible &&
              <>
                <ol>
                  {current.fasit.map((fasit, index) => {
                    return (
                      <li key={index}>{fasit}</li>
                    )
                  })}
                </ol>
                <div className="source">
                  <a href={current.kilde} target='_blank' rel='noopener noreferrer'>Kilde ({current.år})</a>
                </div>
              </>
            }
            <div className="navigation">
              <button onClick={previous} aria-label="Forrige">&lt;</button>
              <p>{selectedId + 1} / {questions.length}</p>
              <button onClick={next} aria-label="Neste">&gt;</button>
            </div>
          </>
        )
      case 'finished':
        return (
          <>
            <div>
              <button onClick={backToStart}>Hjem</button>
              <button onClick={backToLast} style={{ marginLeft: '10px' }}>Tilbake</button>
            </div>
            <h1>Takk for at du spilte!</h1>
            <h2>Du endte opp med {points} poeng!</h2>
            <p className='madeby'>Laget av Peter Skaar Nordby</p>
            <div className="socialmedia">
              <a href="https://www.instagram.com/peter.nordby/" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faInstagram} size='2xl' style={{ color: '#f9f9f9' }} />
              </a>
              <a href="https://www.linkedin.com/in/peternordby/" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faLinkedin} size='2xl' style={{ color: '#f9f9f9' }} />
              </a>
              <a href="https://github.com/peternordby" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faGithubSquare} size='2xl' style={{ color: '#f9f9f9' }} />
              </a>
            </div>
          </>
        )
      case 'rules':
        return (
          <>
            <h1>Regler</h1>
            <div className="rules">
              <p>Hver runde viser en kategori med en skjult topp 10-liste. Spill individuelt eller på lag.</p>
              <p>Før fasiten vises gjør alle én gjetning på et svar de tror er på listen.</p>
              <p>Trykk «Vis Fasit» når alle har gjettet, og se hvor gjetningene havnet.</p>
              <p>Du får poeng etter plasseringen på listen: plass 1 gir 1 poeng, plass 10 gir 10 poeng.</p>
              <p>Er gjetningen ikke blant de ti, gir den 0 poeng.</p>
              <p>Jo lenger ned på listen du tør å treffe, jo mer er det verdt – målet er å samle flest poeng totalt.</p>
              <p>Registrer poeng med poengknappene, og bla mellom kategoriene med pilene eller piltastene.</p>
            </div>
            <button onClick={() => { setGamestate("start") }}>Hjem</button>
          </>
        )
      case 'settings':
        return (
          <>
            <h1>Velg utgave</h1>
            <p>Velg utgave</p>
            <div className="themePicker">
              {Object.entries(THEMES).map(([key, { label }]) => (
                <button
                  key={key}
                  className={theme === key ? 'themeBtn active' : 'themeBtn'}
                  onClick={() => changeTheme(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => { setGamestate("start") }}>Hjem</button>
          </>
        )
      default:
        return (
          <>
            <h1>Ukjent spilltilstand</h1>
          </>
        )
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
