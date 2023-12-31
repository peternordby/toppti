import './App.css'
import { useState } from 'react'
import categories from './categories'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faGithubSquare, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faUndo } from '@fortawesome/free-solid-svg-icons'
import Toggle from 'react-toggle'
import "react-toggle/style.css"
import Snowfall from 'react-snowfall'
import { faSnowflake } from '@fortawesome/free-regular-svg-icons'

function App() {

  const [gamestate, setGamestate] = useState('start')
  const [selectedId, setSelectedId] = useState(0)
  const [answersVisible, setAnswersVisible] = useState(false)
  const [points, setPoints] = useState(0)
  const [pointsHistory, setPointsHistory] = useState([])
  const [pointsVisible, setPointsVisible] = useState(false)
  const [isChristmas, setIsChristmas] = useState(false)

  const theme = isChristmas ? 'christmas' : 'default'

  const start = () => {
    setGamestate('started')
  }

  const next = () => {
    if (selectedId === categories[theme].length - 1) {
      setGamestate('finished')
      return
    }
    setSelectedId(selectedId + 1)
    setAnswersVisible(false)
  }
  
  const previous = () => {
    if (selectedId === 0) {
      setGamestate('start')
      return
    }
    setSelectedId(selectedId - 1)
    setAnswersVisible(false)
  }

  const backToLast = () => {
    setSelectedId(categories[theme].length - 1)
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
    togglePoints()
  }

  const undoPoints = () => {
    setPoints(pointsHistory.pop())
  }

  const setBackgroundColor = (theme) => {
    const root = document.querySelector(':root')
    if (theme === 'default') {
      root.style.setProperty('--dark-background-color', '#242424')
      root.style.setProperty('--light-background-color', '#ffffff')
      root.style.setProperty('--light-text-color', '#213547')
    }
    else if (theme === 'christmas') {
      root.style.setProperty('--dark-background-color', '#5d0707')
      root.style.setProperty('--light-background-color', '#5d0707')
      root.style.setProperty('--light-text-color', 'rgba(255, 255, 255, 0.87)')
    }
  }

  setBackgroundColor(theme)

  const renderState = () => {
    switch (gamestate) {
      case 'start':
        return (
          <>
            <div className="start">
              <h1>Topp 10</h1>
              <div className="buttons">
                <button onClick={start}>Start</button>
                <button onClick={() => { setGamestate("rules") }}>Regler</button>
                <button onClick={() => { setGamestate("settings") }}>Instillinger</button>
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
                <FontAwesomeIcon icon={faUndo} size='l'/>
              </button>}
            </div>
            {pointsVisible && <div style={{
              marginTop: '10px',
              marginBottom: '10px',
            }}>
              <button className="pointBtn" onClick={() => updatePoints(1)}>+1</button>
              <button className="pointBtn" onClick={() => updatePoints(2)}>+2</button>
              <button className="pointBtn" onClick={() => updatePoints(3)}>+3</button>
              <button className="pointBtn" onClick={() => updatePoints(4)}>+4</button>
              <button className="pointBtn" onClick={() => updatePoints(5)}>+5</button>
              <button className="pointBtn" onClick={() => updatePoints(6)}>+6</button>
              <button className="pointBtn" onClick={() => updatePoints(7)}>+7</button>
              <button className="pointBtn" onClick={() => updatePoints(8)}>+8</button>
              <button className="pointBtn" onClick={() => updatePoints(9)}>+9</button>
              <button className="pointBtn" onClick={() => updatePoints(10)}>+10</button>
            </div>}
            {!pointsVisible && <h1>{categories[theme][selectedId].navn}</h1>}
            {!answersVisible && <button onClick={showAnswers}>Vis Fasit</button>}
            {answersVisible &&
            <>
              <ol>
                {categories[theme][selectedId].fasit.map((fasit, index) => {
                  return (
                    <li key={index}>{fasit}</li>
                  )
                })}
              </ol>
              <div className="source">
                <a href={categories[theme][selectedId].kilde} target='_blank' rel='noopener noreferrer'>Kilde ({ categories[theme][selectedId].år })</a> 
              </div>
            </>
            }
            <div className="navigation">
              <button onClick={previous}>&lt;</button>
              <p>{selectedId + 1} / { categories[theme].length }</p>
              <button onClick={next}>&gt;</button>
            </div>
          </>
        )
      case 'finished':
        return (
          <>
            <div>
            <button onClick={backToStart}>Hjem</button>
              <button onClick={backToLast} style={{marginLeft: '10px'}}>Tilbake</button>
            </div>
            <h1>Takk for at du spilte!</h1>
            <h2>Du endte opp med {points} poeng!</h2>
            <p className='madeby'>Laget av Peter Skaar Nordby</p>
            <div className="socialmedia">
              <a href="https://www.instagram.com/peter.nordby/" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faInstagram} size='2xl' style={{color: '#f9f9f9'}}/>
              </a>
              <a href="https://www.linkedin.com/in/peternordby/" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faLinkedin} size='2xl' style={{color: '#f9f9f9'}}/>
              </a>
              <a href="https://github.com/peternordby" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faGithubSquare} size='2xl' style={{color: '#f9f9f9'}}/>
              </a>
            </div>
          </>
        )
      case 'rules':
        return (
          <>
            <h1>Regler</h1>
            <div className="rules">
              <p>Formålet med spillet er å gjette et av svarene som ligger på topp 10 i den gitte kategorien</p>
              <p>Man kan spille på lag eller individuelt, og alle gjør sine egne gjetninger</p>
              <p>Poeng blir bestemt ut i fra hvor på topp 10-listen gjettet var</p>
              <p>Er gjettet ditt nummer 1 på listen, får du/dere 1 poeng</p>
              <p>Er gjettet ditt nummer 10 på listen, får du/dere 10 poeng</p>
              <p>Er ikke gjettet ditt på listen, får du/dere 0 poeng</p>
            </div>
            <button onClick={() => { setGamestate("start") }}>Hjem</button>
          </>
        )
      case 'settings':
        return (
          <>
            <h1>Instillinger</h1>
            <p>Juleversjon</p>
            <Toggle
              defaultChecked={isChristmas}
              icons={{
                checked: <FontAwesomeIcon icon={faSnowflake} size='xs'/>,
                unchecked: null,
              }}
              
              onChange={() => { setIsChristmas(!isChristmas) }}
            />
            <p></p>
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
    {isChristmas && <Snowfall color='rgba(255, 255, 255, 0.6)' />}
    <div className="App">
      {renderState()}
    </div>
    </>
  )
}

export default App
